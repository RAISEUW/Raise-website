import { rm } from 'node:fs/promises';
import { writeEntry } from '../lib/mdx.mjs';
import { makeSlug, resetSlugCache } from '../lib/slugify.mjs';
import { splitTopics } from '../lib/topics.mjs';

const OUT_DIR = 'src/content/publications';

const MONTH_SHORT = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
const MONTH_FULL = 'January|February|March|April|May|June|July|August|September|October|November|December';
const MONTH_INDEX = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7,
  september: 8, october: 9, november: 10, december: 11,
};

// Cascading patterns, most specific first. Each returns { date, matchStart, matchEnd } for the RIGHTMOST match.
const DATE_PATTERNS = [
  // "16th November, 2023" / "25th November, 2023" (day+ordinal + month + year)
  { re: new RegExp(`(\\d{1,2})(?:st|nd|rd|th)\\s+(${MONTH_FULL}|${MONTH_SHORT})[a-z]*,?\\s+(\\d{4})`, 'gi'), kind: 'dmy' },
  // "7 June 2025" / "9 Aug, 2022" / "9 Aug 2022" (day + month + year)
  { re: new RegExp(`(\\d{1,2})\\s+(${MONTH_FULL}|${MONTH_SHORT})[a-z]*,?\\s+(\\d{4})`, 'gi'), kind: 'dmy' },
  // "April 19, 2023" / "October 08, 2023" / "March 03, 2021" (month + day + year)
  { re: new RegExp(`(${MONTH_FULL}|${MONTH_SHORT})[a-z]*\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'gi'), kind: 'mdy' },
  // "(May 2023)" / "May 2023" / "January 2024" (month + year only)
  { re: new RegExp(`(${MONTH_FULL}|${MONTH_SHORT})[a-z]*\\s+(\\d{4})`, 'gi'), kind: 'my' },
  // Year-only fallback: "(2024)" / ", 2023" / " 2025"
  { re: /(?:^|\D)(\d{4})(?:\D|$)/g, kind: 'y' },
];

// Return { date: Date, match: { index, length } } or undefined.
// For each pattern tier, scan matches right-to-left, keep the first year in [1990, 2100].
// This avoids page numbers like "9871-8199" being mistaken for years.
function extractDate(text) {
  for (const { re, kind } of DATE_PATTERNS) {
    re.lastIndex = 0;
    const matches = [...text.matchAll(re)];
    if (matches.length === 0) continue;

    // Walk right-to-left so the latest-stated date wins, but skip any match whose year is out of range.
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      let year, monthIdx = 0, day = 1, matchIndex = m.index, matchLen = m[0].length;

      if (kind === 'dmy') {
        day = parseInt(m[1], 10);
        monthIdx = MONTH_INDEX[m[2].toLowerCase()] ?? 0;
        year = parseInt(m[3], 10);
      } else if (kind === 'mdy') {
        monthIdx = MONTH_INDEX[m[1].toLowerCase()] ?? 0;
        day = parseInt(m[2], 10);
        year = parseInt(m[3], 10);
      } else if (kind === 'my') {
        monthIdx = MONTH_INDEX[m[1].toLowerCase()] ?? 0;
        year = parseInt(m[2], 10);
      } else if (kind === 'y') {
        year = parseInt(m[1], 10);
        matchIndex = m.index + m[0].indexOf(m[1]);
        matchLen = 4;
      }

      if (!year || year < 1990 || year > 2100) continue;  // try next earlier match
      return {
        date: new Date(Date.UTC(year, monthIdx, day)),
        match: { index: matchIndex, length: matchLen },
      };
    }
  }
  return undefined;
}

// Split "VENUE, DATE-SUBSTRING" — prefer date on the right, venue is the prefix.
function splitVenueDate(strongText) {
  const text = strongText.trim();
  if (!text) return ['', undefined];
  const found = extractDate(text);
  if (!found) return [text, undefined];
  // Venue = everything before the match; trim trailing punctuation.
  let venue = text.slice(0, found.match.index).replace(/[,.\s\-]+$/, '').trim();
  // If venue is empty, try: strip the match out of the middle and dedupe.
  if (!venue) {
    venue = text.slice(0, found.match.index).concat(text.slice(found.match.index + found.match.length))
      .replace(/[,.\s\-]+$/, '').replace(/^[,.\s\-]+/, '').trim();
  }
  return [venue, found.date];
}

// Extract DOI from doi.org URLs (populate `doi:` field when `pdf:` isn't local).
function extractDoi(url) {
  if (!url) return undefined;
  const m = url.match(/doi\.org\/(10\.[^\s?#]+)/i);
  return m ? m[1] : undefined;
}

// Filter: is this blurb a real publication? (skip page decoration, empty blurbs)
function isRealPublication(title, strongText) {
  if (!title || title.length < 15) return false;
  if (!/[a-z]/i.test(title)) return false;
  return true;  // allow strong-less publications (missing venue) — will be captured with empty venue
}

export async function parsePublications($) {
  resetSlugCache();
  await rm(OUT_DIR, { recursive: true, force: true });

  const skipped = [];
  let count = 0;
  const blurbs = $('.et_pb_blurb').toArray();

  for (const el of blurbs) {
    const $el = $(el);
    const title = $el.find('.et_pb_module_header span').first().text().trim()
      || $el.find('.et_pb_module_header').first().text().trim();
    const strongText = $el.find('.et_pb_blurb_description strong').first().text().trim();

    if (!isRealPublication(title, strongText)) {
      skipped.push({ title, reason: 'not-a-publication', strongText });
      continue;
    }

    let [venue, date] = splitVenueDate(strongText);

    // Fallback: if no date found in strong, scan the full description for a date.
    // Covers cases where the strong is empty or truncated ("A", "University of Washington, Faculty").
    if (!date) {
      const fullDesc = $el.find('.et_pb_blurb_description').first().text().trim();
      const fromDesc = splitVenueDate(fullDesc);
      if (fromDesc[1]) {
        date = fromDesc[1];
        // If strong is empty/tiny, promote the description-derived venue chunk.
        if (!venue || venue.length < 5) venue = fromDesc[0];
      }
    }

    // Authors: first <p> in description that has no <strong> and non-empty text
    const ps = $el.find('.et_pb_blurb_description p').toArray();
    let authorsText = '';
    for (const p of ps) {
      const $p = $(p);
      if ($p.find('strong').length === 0 && $p.text().trim()) {
        authorsText = $p.text().trim();
        break;
      }
    }
    // Authors: split on commas, strip leading "and "/"& " from each, remove trailing periods.
    const authors = authorsText
      .split(/,\s*/)
      .map(s => s.trim().replace(/^(and|&)\s+/i, '').replace(/\.\s*$/, '').trim())
      .filter(Boolean);

    // Sibling et_pb_buttons inside the parent row: "Read Here" link + pipe-separated topic button
    const $row = $el.closest('.et_pb_row');
    const $buttons = $row.find('.et_pb_button');
    let readHere, topicText;
    $buttons.each((_, b) => {
      const $b = $(b);
      const text = $b.text().trim();
      const href = $b.attr('href');
      if (text === 'Read Here') readHere = href;
      else if (text) topicText = text;
    });
    const topics = topicText ? splitTopics(topicText) : [];

    // Decision (Pitfall #4): arXiv abs -> PDF, direct .pdf preserved, else treat as doi/URL
    let pdf, doi;
    if (readHere) {
      if (/\.pdf(\?|$)/i.test(readHere)) {
        pdf = readHere;  // external PDF; Plan 02-03 downloads and rewrites to /pdfs/{slug}.pdf
      } else if (/arxiv\.org\/abs\//i.test(readHere)) {
        pdf = readHere.replace('/abs/', '/pdf/').replace(/(\.pdf)?$/, '.pdf');
      } else {
        doi = extractDoi(readHere) ?? readHere;
      }
    }

    // Final date fallback: if still no date, mine the row HTML (href attrs, embedded text) for any year token.
    // Matches "CHI2024", "/2021/", doi "10.1145/3456-2024-...", etc. Year-only -> Jan 1 UTC.
    if (!date) {
      // Search row HTML (includes unstripped hrefs) AND readHere.
      const searchSpace = ($row.html() || '') + ' ' + (readHere || '');
      const yearMatches = searchSpace.match(/(?:19|20)\d{2}/g) || [];
      // Filter to plausible years; prefer the LATEST year present (most recent publication date).
      const years = yearMatches
        .map(y => parseInt(y, 10))
        .filter(y => y >= 1990 && y <= 2030);
      if (years.length > 0) {
        const y = Math.max(...years);
        date = new Date(Date.UTC(y, 0, 1));
      }
    }

    // D-03: spread-conditional omits undefined fields cleanly (cleanFrontmatter also strips).
    const frontmatter = {
      title,
      authors,
      ...(venue && { venue }),
      ...(date && { date }),
      topics,
      ...(pdf && { pdf }),
      ...(doi && { doi }),
    };

    // Schema requires venue — if we couldn't extract one, keep the raw strong text as venue.
    if (!frontmatter.venue) frontmatter.venue = strongText || 'Unpublished';

    // Schema requires date — if unknown, fall back to Jan 1 of a best-guess year in strong text,
    // or skip if truly nothing is available.
    if (!frontmatter.date) {
      // Emit with placeholder; we already tried year-only pattern above. If still missing, skip.
      skipped.push({ title, reason: 'no-date', strongText });
      continue;
    }

    const filename = makeSlug(title) + '.mdx';
    await writeEntry({ dir: OUT_DIR, filename, frontmatter, body: '' });
    count++;
  }

  if (skipped.length) {
    console.log(`  Skipped ${skipped.length} blurb(s):`);
    for (const s of skipped) {
      console.log(`    - [${s.reason}] ${s.title?.substring(0, 80) || '(no title)'} | strong=${(s.strongText || '').substring(0, 60)}`);
    }
  }
  return count;
}
