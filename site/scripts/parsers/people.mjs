import { rm } from 'node:fs/promises';
import { writeEntry } from '../lib/mdx.mjs';
import { makeSlug, resetSlugCache } from '../lib/slugify.mjs';

const OUT_DIR = 'src/content/people';

const ROLE_MAP = {
  Leadership: 'leadership',
  Affiliates: 'affiliate',
  Staffs: 'staff',
  Staff: 'staff',
  Alumni: 'alumni',
};

// Handcrafted-preservation map (MIG-03 warning fix). For these 3 slugs the scraper
// overwrites richer human-curated data — merge back department + researchAreas after write.
// Source: original handcrafted MDX files in site/src/content/people/ (pre-scrape).
const PRESERVE = {
  'bill-howe': {
    department: 'Information School',
    researchAreas: ['Responsible AI', 'Data Management', 'Scientific Computing'],
  },
  'chirag-shah': {
    department: 'Information School',
    researchAreas: ['Information Retrieval', 'Human-Centered AI', 'Fairness in Search'],
  },
  'tanu-mitra': {
    department: 'Information School',
    researchAreas: ['Computational Social Science', 'Misinformation', 'Human-AI Interaction'],
  },
};

// Department heuristic (MIG-03 blocker fix): if title contains a comma, take substring
// after the LAST comma (trimmed) as department. Best-effort — on raise.uw.edu most
// titles are role-only; this yields department for only the minority of comma-formatted
// strings. D-03 applies to the omission case.
function extractDepartmentFromTitle(title) {
  if (!title) return undefined;
  const lastComma = title.lastIndexOf(',');
  if (lastComma === -1) return undefined;
  const dept = title.slice(lastComma + 1).trim();
  return dept.length > 0 ? dept : undefined;
}

// Extract bio prose from the Divi team_member_description. The live raise.uw.edu markup
// wraps bios inside a child <div> and uses a mix of <h2>, <h3>, and <p> tags with heavy
// inline styling. Strategy: pick the first child <div> as the bio container, then iterate
// its immediate children (p, h2, h3, h4), strip styling, and join text. Fall back to the
// container's plain text if no children produced text.
function cleanBioText($bioEl, $) {
  if (!$bioEl || $bioEl.length === 0) return '';
  const container = $bioEl.find('> div').first();
  const source = container.length > 0 ? container : $bioEl;
  const clone = source.clone();
  clone.find('*').each((_, el) => {
    const $el = $(el);
    $el.removeAttr('style').removeAttr('class').removeAttr('color').removeAttr('face');
  });

  // Collect text content from heading + paragraph tags (bios live in <h2>/<h3>/<p>).
  // Filter out chunks that are just an email address — Divi wraps the contact email
  // in an <h2> alongside the bio prose on raise.uw.edu.
  const chunks = clone.find('p, h1, h2, h3, h4')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean)
    .filter(c => !/^\S+@\S+\.[a-z]{2,}$/i.test(c));
  if (chunks.length > 0) {
    // Deduplicate consecutive identical chunks (Divi sometimes wraps the same text multiple times).
    const unique = chunks.filter((c, i) => c !== chunks[i - 1]);
    return unique.join('\n\n');
  }
  return clone.text().replace(/\s+/g, ' ').trim();
}

// Pick the visible email from a team_member block. Live raise.uw.edu markup has two
// classes of inconsistencies: (1) empty copy-pasted mailto from adjacent persons' blocks
// (Emily Bender, Tyler McCormick, Mike Teodorescu) where the visible text-bearing anchor
// is correct; (2) hand-typed mailto hrefs with stray spaces (Alex Abplanalp:
// `mailto: yunhe@uw.edu`) where the anchor text is actually correct but the href isn't.
// Strategy: find the anchor whose inner text contains '@', and prefer its VISIBLE TEXT
// over its href. Fall back to the last mailto href when no anchor has visible text.
function pickVisibleEmail($tm, $) {
  const anchors = $tm.find('a[href^="mailto:"]').toArray();
  if (anchors.length === 0) return undefined;

  // Find the first anchor whose inner text includes an "@"-shaped string.
  for (const a of anchors) {
    const text = $(a).text().trim();
    const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (match) return match[0];
  }

  // No visible text: fall back to the last href, stripped of stray whitespace.
  const lastHref = $(anchors[anchors.length - 1]).attr('href') ?? '';
  return lastHref.replace(/^mailto:/, '').trim();
}

function extractTwitterHandle(href) {
  if (!href) return undefined;
  const m = href.match(/(?:twitter\.com|x\.com)\/(?:@)?([\w]+)/i);
  return m ? '@' + m[1] : undefined;
}

// Find a role-assigning heading (Leadership/Affiliates/Staffs/Alumni) in this row's headings.
// The live raise.uw.edu layout groups all team_members inside ONE .et_pb_section but splits
// role headings across separate sibling rows. So we walk rows in document order and flip
// `currentRole` whenever a row carries one of the canonical headings.
function findRoleForRow($row, $) {
  const headings = $row.find('h1, h2, h3, h4').toArray();
  for (const h of headings) {
    const label = $(h).text().trim();
    if (ROLE_MAP[label]) return ROLE_MAP[label];
  }
  return null;
}

export async function parsePeople($) {
  resetSlugCache();
  await rm(OUT_DIR, { recursive: true, force: true });

  const people = [];
  let currentRole = null;
  let orderCounter = 1;

  // Walk rows in document order across all sections. Live DOM (2026-04-17):
  // one section contains all 19 people; role headings and team_members live in
  // separate sibling rows. Any time a row carries a Leadership/Affiliates/Staffs
  // heading, flip currentRole; any time a row carries team_members, emit them
  // under currentRole.
  $('.et_pb_row').each((_, row) => {
    const $row = $(row);
    const rowRole = findRoleForRow($row, $);
    if (rowRole) currentRole = rowRole;

    $row.find('.et_pb_team_member').each((_, tm) => {
      if (!currentRole) return;
      const $tm = $(tm);
      const name = $tm.find('.et_pb_module_header').text().trim();
      if (!name) return;

      const title = $tm.find('.et_pb_member_position').text().trim() || 'Member';
      const bio = cleanBioText($tm.find('.et_pb_team_member_description'), $);
      const email = pickVisibleEmail($tm, $);

      const xHref = $tm.find('.et_pb_twitter_icon').parent('a').attr('href')
        || $tm.find('a[href*="twitter.com"], a[href*="x.com"]').attr('href');
      const linkedin = $tm.find('.et_pb_linkedin_icon').parent('a').attr('href')
        || $tm.find('a[href*="linkedin.com"]').attr('href');
      const website = $tm.find('a[href^="http"]')
        .not('[href*="twitter"]').not('[href*="x.com"]').not('[href*="linkedin"]')
        .not('[href^="mailto:"]').first().attr('href');

      const photoUrl = $tm.closest('.et_pb_row').find('.et_pb_image img').first().attr('src')
        || $tm.find('img').first().attr('src');

      people.push({
        name,
        role: currentRole,
        title,
        email,
        x: extractTwitterHandle(xHref),
        linkedin,
        website,
        _photoUrl: photoUrl,
        bio,
        order: orderCounter++,
      });
    });
  });

  // Deduplicate by name (in case a person appears in two sections).
  const byName = new Map();
  for (const p of people) if (!byName.has(p.name)) byName.set(p.name, p);
  const dedup = Array.from(byName.values());

  // Drop Twitter handles that appear on multiple people — those are copy-paste leaks
  // in the source markup (verified 2026-04-17: @chirag_shah leaked into Tanu Mitra and
  // Emily Bender team_member blocks). Keep the FIRST person's handle (by order), null
  // out subsequent appearances.
  const xSeen = new Map();
  for (const p of dedup) {
    if (!p.x) continue;
    const existing = xSeen.get(p.x);
    if (existing === undefined) {
      xSeen.set(p.x, p.order);
    } else if (p.order > existing) {
      p.x = undefined;
    }
  }

  let count = 0;
  for (const p of dedup) {
    // CRITICAL: compute the slug ONCE per person.
    // makeSlug() mutates a cache on every call — calling it twice (once for the photo
    // path, once for the filename) produces `{slug}.ext` + `{slug}-2.mdx`, desynchronizing
    // the photo path from the filename. Hoist the call and reuse the result everywhere.
    const personSlug = makeSlug(p.name);

    let photo;
    if (p._photoUrl) {
      const urlPath = new URL(p._photoUrl, 'https://sites.uw.edu').pathname;
      const ext = (urlPath.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] ?? '.jpg').toLowerCase();
      photo = `/images/people/${personSlug}${ext}`;
    }

    // Department: extracted best-effort from title via last-comma heuristic (MIG-03).
    // D-03 applies when no comma is present (field omitted, schema is .optional()).
    const extractedDept = extractDepartmentFromTitle(p.title);

    // Handcrafted preservation (MIG-03 warning fix): for the 3 known leadership slugs,
    // override both department and researchAreas with handcrafted values after heuristic.
    const preserved = PRESERVE[personSlug] ?? {};
    const finalDept = preserved.department ?? extractedDept;
    const finalResearchAreas = preserved.researchAreas ?? [];

    const frontmatter = {
      name: p.name,
      role: p.role,
      title: p.title,
      ...(finalDept && { department: finalDept }),
      ...(p.email && { email: p.email }),
      ...(p.x && { x: p.x }),
      ...(p.linkedin && { linkedin: p.linkedin }),
      ...(p.website && { website: p.website }),
      ...(photo && { photo }),
      researchAreas: finalResearchAreas,
      order: p.order,
    };
    const filename = personSlug + '.mdx';
    await writeEntry({ dir: OUT_DIR, filename, frontmatter, body: p.bio ?? '' });
    count++;
  }
  return count;
}
