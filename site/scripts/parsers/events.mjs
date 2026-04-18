import { rm } from 'node:fs/promises';
import { writeEntry } from '../lib/mdx.mjs';
import { makeSlug, resetSlugCache } from '../lib/slugify.mjs';
import { parseDate } from '../lib/dates.mjs';

const OUT_DIR = 'src/content/events';

// Regex for event date+time strings on /talksevents/. Observed formats:
//   "Jun 6th 2025, 9:00 – 10:00AM PT"
//   "NOV 1st 2024, 9:00 – 10:00AM PT"
//   "Apr 12 2024" (older events with no ordinal, no time)
//   "May 3th 2024, 10:00AM PT" (note the typo: "3th" not "3rd")
// Strategy: strip ordinal suffix (handled in parseDate via lib/dates.mjs),
// split on first comma if present (left = date, right = time).
function parseDateTimeBlob(raw) {
  if (!raw) return { date: undefined, time: undefined };
  const cleaned = raw.trim();
  const commaIdx = cleaned.indexOf(',');
  let datePart, timePart;
  if (commaIdx >= 0) {
    datePart = cleaned.slice(0, commaIdx).trim();
    timePart = cleaned.slice(commaIdx + 1).trim();
  } else {
    datePart = cleaned;
  }
  const date = parseDate(datePart);
  return { date, time: timePart };
}

// Extract speaker, speakerBio, abstract from the "Guest Speaker" / "Abstract" text blocks.
// The live raise.uw.edu source has inconsistent speaker-name presence in the bio:
//   - "Faeze's research focuses on..." (first word is the speaker first name)
//   - "He is a co-author..." (no name — just pronoun)
//   - "Dr. Prabhakaran is a Staff Research Scientist..." (name + honorific)
// We extract the first sentence as a speakerBio PREFIX, then try to find a
// plausible name at the very start (capitalized first word + optional second).
// If the first token is a pronoun (He/She/His/Her/My/I/They/Their), speaker is
// left undefined so the parser defaults to 'Guest Speaker'.
function extractEventText(fullText) {
  const text = fullText.replace(/\s+/g, ' ').trim();
  const speakerMarker = text.search(/Guest Speaker/i);
  const abstractMarker = text.search(/Abstract/i);

  let speaker, speakerBio, abstract;
  if (speakerMarker >= 0 && abstractMarker > speakerMarker) {
    const between = text.slice(speakerMarker + 'Guest Speaker'.length, abstractMarker).trim();
    speakerBio = between.replace(/^[:\-\s]+/, '').trim();
    // Try to pick the speaker's first + last name from the start of the bio.
    // Acceptable: "Faeze's..." → Faeze; "Dr. Prabhakaran is..." → Dr. Prabhakaran;
    // "Gagan is part of..." → Gagan. Reject pronouns.
    const PRONOUNS = /^(he|she|his|her|they|their|my|i|we)\b/i;
    if (!PRONOUNS.test(speakerBio)) {
      // Match honorific + capitalized word(s), OR capitalized word(s) before verb/possessive.
      // Accept forms:
      //   "Dr. Prabhakaran is"
      //   "Faeze's research" (straight or curly apostrophe)
      //   "Gagan Bansal is"
      //   "Dr. Stypińska is" (Unicode diacritics)
      //   "Muhammad Aurangzeb Ahmad is" (3-word names)
      const namePattern = /^((?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)?\s*\p{Lu}[\p{L}\p{M}]+(?:[\s\-]\p{Lu}[\p{L}\p{M}]+){0,2})(?:['\u2018\u2019]s|[\s,])/u;
      const m = speakerBio.match(namePattern);
      if (m) speaker = m[1].trim();
    }
  }
  if (abstractMarker >= 0) {
    abstract = text.slice(abstractMarker + 'Abstract'.length).replace(/^[:\-\s]+/, '').trim();
    // Trim trailing Zoom-join sentence if present
    abstract = abstract.replace(/\s*(Join Zoom Meeting.*|Join Event.*|https?:\/\/\S*zoom\S*).*$/i, '').trim();
  }
  return { speaker, speakerBio, abstract };
}

export async function parseEvents($) {
  resetSlugCache();
  await rm(OUT_DIR, { recursive: true, force: true });

  const events = [];

  $('.et_pb_row').each((_, row) => {
    const $row = $(row);

    // A row counts as an event if it has either a Zoom link or a "Guest Speaker" text marker.
    const rowText = $row.text();
    const hasGuestSpeaker = /Guest Speaker/i.test(rowText);
    const hasZoom = $row.find('a[href*="zoom"]').length > 0;
    if (!hasGuestSpeaker && !hasZoom) return;

    // Title: first .et_pb_text_inner in the row consistently holds the event title
    // (not the image title — those are junk like "New Template", "VB2", speaker names, etc.)
    const textInners = $row.find('.et_pb_text_inner').toArray();
    const title = $(textInners[0]).text().replace(/\s+/g, ' ').trim();
    if (!title || title.length < 5) return;

    // Date: look for a text node matching "{Month} {day}(st|nd|rd|th)? {year}..." anywhere in the row
    const dateMatch = rowText.match(/(\w+ \d{1,2}(?:st|nd|rd|th)? \d{4}(?:,\s*[^A-Z]*?(?:AM|PM)\s*PT)?)/i);
    const { date, time } = parseDateTimeBlob(dateMatch?.[1]);
    if (!date) return;  // omit events we can't date

    const { speaker, speakerBio, abstract } = extractEventText(rowText);

    // Recording / slides: look for non-Zoom external links (youtube, vimeo, slides.com, etc.)
    let recording, slides;
    $row.find('a[href]').each((_, a) => {
      const href = $(a).attr('href') ?? '';
      if (/youtube\.com|youtu\.be|vimeo\.com/i.test(href)) recording = recording ?? href;
      if (/slides\.com|slideshare|docs\.google\.com\/presentation/i.test(href)) slides = slides ?? href;
    });

    events.push({
      title,
      speaker: speaker || 'Guest Speaker',
      speakerBio,
      date,
      time,
      abstract,
      recording,
      slides,
      upcoming: false,  // All /talksevents/ entries are past events (D-03)
    });
  });

  // Deduplicate by title (rows can double-count in mixed Divi/Framer layouts).
  const byTitle = new Map();
  for (const e of events) if (!byTitle.has(e.title)) byTitle.set(e.title, e);
  const dedup = Array.from(byTitle.values());

  let count = 0;
  for (const e of dedup) {
    const frontmatter = {
      title: e.title,
      speaker: e.speaker,
      ...(e.speakerBio && { speakerBio: e.speakerBio }),
      date: e.date,
      ...(e.time && { time: e.time }),
      ...(e.abstract && { abstract: e.abstract }),
      ...(e.recording && { recording: e.recording }),
      ...(e.slides && { slides: e.slides }),
      upcoming: false,
    };
    const filename = makeSlug(e.title) + '.mdx';
    await writeEntry({ dir: OUT_DIR, filename, frontmatter, body: '' });
    count++;
  }
  return count;
}
