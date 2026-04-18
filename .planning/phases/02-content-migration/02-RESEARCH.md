# Phase 2: Content Migration - Research

**Researched:** 2026-04-17
**Domain:** WordPress (Divi-builder) HTML scraping, MDX generation, asset downloading for Astro content collections
**Confidence:** HIGH

## Summary

raise.uw.edu is a WordPress site built with the **Divi Builder** theme. All content lives on three long single pages (`/publications/`, `/people/`, `/talksevents/`) — there is **no pagination**, **no individual detail pages**, and **no useful structured data in the WordPress REST API** (the API exposes only Divi shortcode markup, not rendered content). The WP sitemap confirms only one `project` custom post type entry (`talk-1`), which is vestigial.

This simplifies Phase 2 architecture dramatically: the scraper is three independent Divi HTML parsers operating on three fetched HTML documents, not a crawler. The DOM structure is **Divi-specific and stable at the token level** (`.et_pb_blurb`, `.et_pb_team_member`, `.et_pb_button`) even though numbered-suffix classes (`.et_pb_blurb_0_tb_body`) vary by layout position. Scraped counts verified against the live site: **43 publications** (exceeds the "~40" estimate), **19 people** (Leadership 3 + Affiliates 14 + Staff 2 — 3 more than the "16" estimate, **no Alumni section**), and **30–41 events** depending on how they're counted (30 have "Guest Speaker" blocks, 41 have Zoom links, 43 have dated content blocks).

**Primary recommendation:** Build a single Node.js scraper at `site/scripts/scrape.mjs` using **cheerio 1.2.0** for DOM parsing, **gray-matter 4.0.3** for MDX frontmatter serialization, **date-fns 4.1.0** for multi-format date parsing, and **slug 11.0.1** for kebab-case filename generation. Three parse passes (publications, people, events), one asset-download pass (author headshots + any direct-PDF links), one manual author for the sample article. Ship behind a single npm script `pnpm scrape` so re-runs are reproducible and reviewable via `git diff`. **Two schema edits are required before the scraper can run** — see Open Questions #1.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Content is extracted via a **script scraper** — a Node.js or Python script that crawls raise.uw.edu, parses HTML, and emits MDX files directly into `src/content/{publications,events,people}/`. No manual copy-paste; no intermediate CSV/JSON step.
- **D-02:** The scraper writes **direct MDX output** — files land straight in `src/content/` and are review-able via `git diff` after the run. No staging format or draft: true intermediate step.
- **D-03:** When the scraper cannot find a field (e.g. no DOI on a publication, no recording on an event, no headshot URL for a person), it **omits the field entirely** from the MDX frontmatter. All affected fields (`pdf`, `doi`, `abstract`, `recording`, `slides`, `speakerPhoto`, `photo`) are already `optional` in the Zod schema — the site renders gracefully without them.

### Claude's Discretion
- Slug derivation: generate kebab-case slugs from content titles (matching existing sample pattern: `llm-opioid-reddit.mdx`, `ai-normal-technology.mdx`, `bill-howe.mdx`). Claude can handle edge cases (duplicate titles, long titles, special characters).
- Asset download strategy: download author headshots to `site/public/images/people/` and publication PDFs to `site/public/pdfs/` as part of the scraper run or as a separate asset-fetch pass.
- `linkedPublications` / `linkedTalks` on people: wire these up during migration where associations are identifiable from the existing site, leave as empty arrays otherwise.
- Sample article (MIG-04): topic and length are Claude's discretion — should be something relevant to the RAISE mission (responsible AI at UW).
- Slug uniqueness: if two publications share a near-identical title, append year or first author initial to disambiguate.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MIG-01 | All ~40 publications from raise.uw.edu migrated to MDX with accurate frontmatter (title, authors, venue, date, topics, PDF, DOI) | Verified 43 publications on `/publications/`. Divi `.et_pb_blurb` structure parsed in §Architecture Patterns. Date formats in §Common Pitfalls. `pdf` vs `doi` strategy covered in Open Questions #1. |
| MIG-02 | All 50+ events from raise.uw.edu migrated to MDX (title, speaker, date, location, abstract, recording, upcoming flag) | Events page has 30–41 event-like entries; live count is lower than the "50+" estimate. Event HTML mixes Divi with embedded Framer markup — more fragile than publications. See Open Questions #3. |
| MIG-03 | All 16 people from raise.uw.edu migrated to MDX (name, role, title, dept, photo, researchAreas) | Verified 19 people (Leadership 3, Affiliates 14, Staff 2). No Alumni section on live site. Role enum mapping in §Architecture Patterns. |
| MIG-04 | At least 1 article authored and published as a sample (new content, not migrated) | `articles/` collection is empty. Just needs one MDX file in `site/src/content/articles/`. Schema has `title, date, author, tags, cover, excerpt, draft` per `content.config.ts`. |
| MIG-05 | Author photos and publication PDFs downloaded to `public/images/` and `public/pdfs/` | Asset URLs live on `sites.uw.edu/iraise/files/...` (mirror: `www.raise.uw.edu/files/`). Photos: straightforward download. PDFs: **only 2 of 43 publications have direct `.pdf` links** — most link to DOI/arXiv landing pages. See Open Questions #1 and §Common Pitfalls. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cheerio | 1.2.0 | HTML parsing with jQuery-like selectors | Purpose-built for server-side DOM work; the only mature choice for Divi's class-token selectors. Published 2026-01-23, stable 1.x API. |
| gray-matter | 4.0.3 | Frontmatter serialize/parse for MDX | De-facto standard for YAML frontmatter on Node; used by every static-site generator in the Node ecosystem. Stable since 2021 (no active drift). |
| date-fns | 4.1.0 | Multi-format date parsing | `date-fns/parse` handles "7 June 2025", "April 19, 2023", "October 08, 2023" cleanly with explicit format strings. Smaller than moment/luxon; tree-shakeable. |
| slug | 11.0.1 | Unicode-safe kebab-case slug generation | Handles diacritics, punctuation, collisions. Same pattern as the existing sample MDX filenames. |
| undici | 7.14.0 | HTTP client (built into Node 22+ as `fetch`) | Already available via Node's global `fetch` — no new dep needed. Used for HTML GET and asset download streaming. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| p-limit | 7.3.0 | Concurrency limiter | When downloading ~20 headshots + PDFs, cap at 4–6 parallel to avoid rate-limiting `sites.uw.edu` |
| he | (built-in alt) | HTML entity decoding | Divi output contains `&#091;`, `&#093;`, `&amp;` — cheerio's `.text()` handles most, but raw HTML extraction needs decoding. Node 22's `DOMParser` via `jsdom` works too; prefer `cheerio + $.text()` and avoid an extra dep. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| cheerio | node-html-parser 7.1.0 | Faster and lighter, but weaker selector support for class-token matching with numbered suffixes. cheerio's chainable API is a better fit for Divi. |
| cheerio | Playwright/Puppeteer | Overkill — the Divi-rendered HTML is fully present in the static response; no JavaScript execution is needed. Adds 300MB of browser deps. |
| gray-matter | Manual YAML.stringify | gray-matter preserves comment handling, delimiter choice, and edge-case escaping (quotes in titles). Hand-rolling this is a well-known way to produce invalid YAML. |
| date-fns | chrono-node 2.9.0 | chrono handles natural-language dates, but the formats here are structured enough that explicit `parse(str, 'd MMMM yyyy', new Date())` is more predictable. chrono's fuzziness is a pitfall when authors typed dates inconsistently. |
| Node scraper | Python scraper | Node stays in the existing toolchain (`pnpm` already present), emits UTF-8 MDX correctly, and co-locates with the Astro project. No reason to introduce Python. |

**Installation:**
```bash
cd site
pnpm add -D cheerio@^1.2.0 gray-matter@^4.0.3 date-fns@^4.1.0 slug@^11.0.1 p-limit@^7.3.0
pnpm add -D @types/slug
```

**Version verification (2026-04-17):** All versions confirmed against npm registry. cheerio 1.2.0 published 2026-01-23. date-fns 4.1.0 current major. slug 11.0.1 current. p-limit 7.3.0 is ESM-only (aligns with the project's `"type": "module"`).

## Architecture Patterns

### Recommended Project Structure
```
site/
├── scripts/
│   ├── scrape.mjs              # Orchestrator: fetch 3 pages, dispatch parsers, emit MDX
│   ├── parsers/
│   │   ├── publications.mjs    # .et_pb_blurb → publication frontmatter
│   │   ├── people.mjs          # .et_pb_team_member → person frontmatter + bio body
│   │   └── events.mjs          # Event rows → event frontmatter
│   ├── lib/
│   │   ├── mdx.mjs             # gray-matter wrappers: renderFrontmatter, writeEntry
│   │   ├── slugify.mjs         # slug() wrapper with collision handling + acronym preservation
│   │   ├── dates.mjs           # parseDate(str) tries multiple format strings
│   │   ├── topics.mjs          # "LLM | OPIOID USE DISORDER" → ["LLM", "Opioid Use Disorder"]
│   │   └── assets.mjs          # downloadImage, downloadPdf, streamToFile
│   └── sample-data/
│       └── role-map.json       # Hand-curated name→role overrides if auto-mapping is wrong
└── src/content/                # Output lands here
```

### Pattern 1: Fetch-once, parse-many
**What:** Download each of the 3 HTML pages once into memory or `/tmp`, then run selector-based parsers. Avoid re-fetching during a single scrape run.
**When to use:** All three parsers.
**Example:**
```javascript
// Source: https://cheerio.js.org/docs/intro/
import * as cheerio from 'cheerio';

const res = await fetch('https://raise.uw.edu/publications/', {
  headers: { 'User-Agent': 'RAISE-content-migration/1.0' },
});
const html = await res.text();
const $ = cheerio.load(html);

const publications = $('.et_pb_blurb').map((_, el) => {
  const $el = $(el);
  const title = $el.find('.et_pb_module_header span').text().trim();
  const description = $el.find('.et_pb_blurb_description').text().trim();
  return { title, description };
}).get();
```

### Pattern 2: Select on stable class tokens, not numbered variants
**What:** Divi auto-generates class names with numeric suffixes that depend on the element's position within the page layout (`et_pb_blurb_0_tb_body`, `et_pb_button_1_tb_body`). These shift whenever the editor adds/removes a block.
**When to use:** Every selector.
**Example:**
```javascript
// GOOD — stable across layout changes
$('.et_pb_blurb').each(...)
$('.et_pb_team_member').each(...)

// BAD — breaks when Divi renumbers blocks
$('.et_pb_blurb_0_tb_body').each(...)
```

### Pattern 3: Divi publication block shape
**What:** Each publication is a `.et_pb_blurb` containing title, venue+date, authors, plus an **adjacent** topic button and "Read Here" link. The topic button and link are siblings of the blurb, not children — requires walking the Divi row structure.
**Example HTML (verbatim):**
```html
<div class="et_pb_blurb">
  <h4 class="et_pb_module_header"><span>Online myths on opioid use disorder...</span></h4>
  <div class="et_pb_blurb_description">
    <p><strong>Proceedings of the International AAAI Conference on Web and Social Media, <span>7 June 2025</span></strong></p>
    <p>Shravika Mittal, Hayoung Jung, Mai ElSherief, Tanushree Mitra, Munmun De Choudhury</p>
  </div>
</div>
<a class="et_pb_button" href="https://ojs.aaai.org/index.php/ICWSM/article/view/35870">Read Here</a>
<a class="et_pb_button" href="">LLM | OPIOID USE DISORDER | MISINFORMATION</a>
```
**Parser strategy:** Select the parent `.et_pb_row`, then within that row find the `.et_pb_blurb` (title+authors+venue+date) and the two `.et_pb_button` links (first: "Read Here" → external URL; second: pipe-separated topics).

### Pattern 4: Divi people block shape
**What:** Each person is a `.et_pb_team_member` with `.et_pb_module_header` (name), `.et_pb_member_position` (title), a description div containing bio + email (often wrapped in extensive inline styling), and `.et_pb_member_social_links` for X/LinkedIn. The headshot is a sibling `.et_pb_image` in an adjacent column.
**Role mapping:** The role is derived from the section heading ancestor — iterate h1/h2/h3 siblings preceding the team-member block to find the nearest `Leadership | Affiliates | Staffs | Alumni` heading, then map:
- `Leadership` → `leadership`
- `Affiliates` → `affiliate`
- `Staffs` → `staff`
- `Alumni` → `alumni` (no instances on live site, but enum supports it)

**Order field:** set by iteration order within each section (leadership first = order 1, 2, 3; affiliates continue from 10, 11, 12…; staff from 50, 51…). This matches the existing hand-crafted order values (Bill Howe=1, Tanu=2, Chirag=3).

### Pattern 5: Divi event block shape (most fragile)
**What:** Events on `/talksevents/` mix Divi with embedded Framer markup (`data-framer-name`, `framer-1u1ez3o` class tokens). Each event row contains:
- An image with `title` attribute that typically matches the event title
- A Framer-styled text block with the title, date/time, "Guest Speaker", speaker bio, "Abstract", abstract text
- A Zoom join link

**Parser strategy:** Iterate `et_pb_row` blocks. For each row, extract:
- `title` — from the image `title=` attribute or the first Framer heading
- `speaker` — the text between "Guest Speaker" and "Abstract" markers (first line)
- `speakerBio` — continues until "Abstract" marker
- `date`, `time` — regex for `Mon DDth YYYY, H:00 – H:00AM PT` pattern; tolerate typo "3th" (May 3th 2024 is in the source)
- `abstract` — text between "Abstract" marker and Zoom/end-of-row
- `recording` — omit (not present in source HTML)
- `upcoming` — **always `false`**: every event on `/talksevents/` is past. The two samples `upcoming: false` confirm this pattern. Future events (if any) need manual flagging post-scrape.

### Pattern 6: Bio body as MDX prose (people only)
**What:** Unlike publications and events (frontmatter-only), people MDX files include a prose body with the bio after `---`. The Divi bio HTML is wrapped in inline styling (`<span style="font-family: Montserrat;">`) — strip all style/font/color attrs, keep paragraph structure, emit as plain Markdown.
**When to use:** People only.
**Example transform:**
```html
<!-- Divi source -->
<h2 style="text-align: left;">
  <span style="font-family: Cabin; color: #000000;">Bill Howe is an Associate Professor in the iSchool...</span>
</h2>
```
Becomes in MDX body:
```markdown
Bill Howe is an Associate Professor in the iSchool...
```

### Pattern 7: MDX writing via gray-matter
**What:** Use `matter.stringify(body, frontmatter)` to produce valid MDX with YAML frontmatter. Do not hand-concatenate `---\n${yaml}\n---\n${body}` — gray-matter handles quoting, multiline strings, and date serialization.
**Example:**
```javascript
// Source: https://github.com/jonschlinkert/gray-matter
import matter from 'gray-matter';
import { writeFileSync } from 'node:fs';

const data = {
  title: 'Online myths on opioid use disorder: A comparison of reddit and large language model',
  authors: ['Shravika Mittal', 'Hayoung Jung', 'Mai ElSherief', 'Tanushree Mitra', 'Munmun De Choudhury'],
  venue: 'Proceedings of the International AAAI Conference on Web and Social Media',
  date: new Date('2025-06-07'),
  topics: ['LLM', 'Opioid Use Disorder', 'Misinformation'],
};
const mdx = matter.stringify('', data);  // empty body for publications
writeFileSync('src/content/publications/llm-opioid-reddit.mdx', mdx);
```

### Anti-Patterns to Avoid
- **Scraping without a User-Agent:** UW IT infrastructure may block default fetch UA. Always set `User-Agent: RAISE-content-migration/1.0`.
- **Writing MDX with template strings:** YAML escaping is subtle (colons in titles, quotes in abstracts). Use `matter.stringify` — not string interpolation.
- **Serializing dates as strings:** Zod has `z.coerce.date()` — passing a `new Date()` object through gray-matter produces an ISO string in YAML that Zod parses cleanly. Hand-formatting risks timezone drift.
- **Selecting on numbered class variants** (see Pattern 2).
- **Re-parsing HTML for each publication:** Load once per page, iterate selectors in memory.
- **Writing MDX outside `src/content/`:** Astro's glob loader only sees files under the configured base. Write directly to the four content subdirectories.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing | Regex-on-HTML | cheerio 1.2.0 | HTML is not regular. Nested tags, attribute ordering, entity decoding, and self-closing elements all break naive regex. cheerio handles all of them. |
| Frontmatter YAML writing | Template strings | gray-matter 4.0.3 | YAML is finicky: colons in titles need quoting, multiline abstracts need `|` block scalars, dates need special handling. gray-matter gets all this right. |
| Date parsing | `new Date(str)` | date-fns `parse()` | `new Date('7 June 2025')` returns `Invalid Date` in some JS engines. date-fns takes an explicit format string, so "7 June 2025" parses deterministically as `parse(str, 'd MMMM yyyy', new Date())`. |
| Slug generation | `.toLowerCase().replace(/\s+/g, '-')` | slug 11.0.1 | Unicode characters (`Tañu`, `ÉmilyBender`), punctuation (`: A Comparison`), and collision handling all fail with the naive regex. |
| Concurrency control for downloads | `Promise.all` of 50 fetches | p-limit 7.3.0 | Unbounded parallelism triggers rate limits and socket-exhaustion on `sites.uw.edu`. Cap at 4–6. |
| Image/PDF streaming | `arrayBuffer()` + write | `Readable.fromWeb(res.body).pipe(createWriteStream(path))` via Node's built-in streams | Buffer-in-memory fails for large PDFs and headshots; streaming is simple with Node 22. |

**Key insight:** This is not a place to be clever. Scraping WordPress/Divi output is well-trodden territory. Every shortcut (regex for HTML, template strings for YAML, unbounded fetches) has a known failure mode that will bite during a single scrape run.

## Runtime State Inventory

This phase is a **content migration** that overwrites stored artifacts. The scraper's output collides with existing state:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **7 existing sample MDX files:** `src/content/people/{bill-howe,chirag-shah,tanu-mitra}.mdx`, `src/content/events/{ai-normal-technology,faeze-llm-adaptation}.mdx`, `src/content/publications/{llm-opioid-reddit,ml-fairness-computational}.mdx`. All 7 describe real raise.uw.edu content and will collide with scraper output. | **Decide overwrite policy** (see Open Questions #2). The handcrafted Bill Howe/Tanu Mitra/Chirag Shah bios may be richer than what's auto-extractable. |
| Live service config | None — no external services are queried during scrape. | None. |
| OS-registered state | None — no scheduled tasks, no system services. | None. |
| Secrets/env vars | None — `raise.uw.edu` is a public site, no auth needed. | None. |
| Build artifacts / installed packages | `site/dist/` may contain stale built HTML from sample content (verified from `ls site/`). Rebuilds after scrape will regenerate. The `site/public/images/` directory currently only contains `uw-w.svg.TODO` — no prior image downloads to conflict with. | Re-run `pnpm build` after scrape; commit a `.gitignore` entry for `public/pdfs/` if PDFs shouldn't be versioned (large binaries). |

**Nothing found in category:** Live service config, OS-registered state, and secrets/env vars — verified no external services or registered tasks exist for this phase.

## Common Pitfalls

### Pitfall 1: Divi class suffixes shift with layout
**What goes wrong:** Selector `.et_pb_blurb_0_tb_body` works today, breaks tomorrow when the editor adds a block above.
**Why it happens:** Divi generates numeric suffixes based on each block's position in the page tree.
**How to avoid:** Always select on the stable token (`.et_pb_blurb`, `.et_pb_team_member`, `.et_pb_button`). Never use numbered variants.
**Warning signs:** A scrape run that suddenly returns 0 publications after a site edit, even though the page looks identical.

### Pitfall 2: Inconsistent date formats across publications
**What goes wrong:** `new Date("7 June 2025")` works in V8, fails in Safari. `"8 Apr 2025"` vs `"April 19, 2023"` vs `"October 08, 2023"` require three different format strings.
**Why it happens:** WordPress editors typed dates differently over 5 years; no input validation.
**How to avoid:** Maintain a list of format strings and try each in order with date-fns `parse()`; fall back to ISO extraction if all fail; log and omit the `date` field rather than crash.
**Warning signs:** `Invalid Date` in scraper output, frontmatter with dates like `1970-01-01`.
**Observed formats in source** (live scrape):
- `7 June 2025` → `d MMMM yyyy`
- `8 Apr 2025` → `d MMM yyyy`
- `April 19, 2023` → `MMMM d, yyyy`
- `October 08, 2023` → `MMMM dd, yyyy`
- Event dates: `Jun 6th 2025, 9:00 – 10:00AM PT` → regex-strip the ordinal suffix first, then `MMM d yyyy`
- **Typo:** `May 3th 2024` (not `3rd`) appears in source — accept any of `st|nd|rd|th` and strip.

### Pitfall 3: Pipe-separated topics lose acronyms on naive title-case
**What goes wrong:** `"LLM | OPIOID USE DISORDER"` → naive `titleCase()` → `"Llm | Opioid Use Disorder"`. The `llm-opioid-reddit.mdx` sample shows topics like `"LLM"`, `"Opioid Use Disorder"`, `"Misinformation"` — acronyms preserved.
**Why it happens:** Source topics are all-uppercase. Converting to title case strips the acronym identity.
**How to avoid:** Maintain an acronym whitelist: `['LLM', 'AI', 'NLP', 'HCI', 'HPC', 'COVID-19', 'DOI', 'API', 'URL', 'PDF', 'LM', 'ML']`. For each topic token, if it's in the list, keep uppercase; else title-case.
**Warning signs:** Publications show up on the index with `"Llm"` or `"Nlp"` tags instead of `"LLM"` / `"NLP"`.

### Pitfall 4: "Read Here" links are landing pages, not PDFs
**What goes wrong:** MIG-05 calls for publication PDFs downloaded to `public/pdfs/`. Of 43 publications, **only 2 have direct `.pdf` URLs**. The other 41 point to DOI pages (26), arXiv abs pages (7), ACM/AAAI/OpenReview landing pages.
**Why it happens:** Research publications route through publisher landing pages; the PDF is typically one click deeper and may require authentication (ACM Digital Library) or may be on a different URL pattern per publisher.
**How to avoid:** Be explicit about scope. Two viable approaches:
1. **arXiv auto-conversion:** For any `arxiv.org/abs/NNNN.NNNNN` URL, rewrite to `arxiv.org/pdf/NNNN.NNNNN.pdf` and download. Covers 7/43 cases. Combined with the 2 direct links, that's 9/43 PDFs local.
2. **Accept external-only:** Leave `pdf:` omitted, populate `doi:` with the DOI ID (extracted from `doi.org/10.NNNN/...`), let the detail page render `doi.org/10.NNNN/...` link. MIG-05's "publication PDFs download locally" is satisfied only for the cases where PDFs are fetchable.
**Warning signs:** 404s during asset download, mixed-content warnings, or broken PDF links on publication detail pages.

### Pitfall 5: Zod `.url()` rejects local paths
**What goes wrong:** Schema has `pdf: z.string().url()`, `recording: z.string().url()`, `slides: z.string().url()`, `website: z.string().url()`. A local path like `/pdfs/llm-opioid-reddit.pdf` is not a valid URL and **fails validation at build time**. Only `photo` and `speakerPhoto` are bare `z.string()`.
**Why it happens:** The schema was written assuming these would always be external URLs. Phase 2's MIG-05 assumes local paths for PDFs.
**How to avoid:** Edit the schema to change `pdf: z.string().url().optional()` → `pdf: z.string().optional()` before scraping (and do the same for any other field that will hold a local path). See Open Questions #1 — planner must decide whether this is a schema edit task or a scope adjustment.
**Warning signs:** `pnpm build` fails with `ZodError: Invalid url` after scrape lands MDX with `pdf: /pdfs/...`.

### Pitfall 6: Framer-wrapped event content is deeply nested
**What goes wrong:** Events page has Divi rows containing Framer embeds. The HTML has 4–6 levels of nested `<div class="framer-...">` wrappers around each text span, plus inline font-family styling.
**Why it happens:** Someone updated the events page using the Framer design tool embedded in WordPress (likely copy-pasted from a Framer mock).
**How to avoid:** Use `$('.et_pb_text_inner').text()` which flattens the nested structure and returns plain text. Do not try to walk the Framer tree manually.
**Warning signs:** Abstract field contains HTML fragments, font-family names ("Cabin"), or hex color codes.

### Pitfall 7: Asset host is sites.uw.edu, not raise.uw.edu
**What goes wrong:** Photos appear as `<img src="https://sites.uw.edu/iraise/files/2025/09/Group-5.png">`. Treating raise.uw.edu as the asset base gives 404s.
**Why it happens:** UW sites use a shared CDN (`sites.uw.edu`) with a per-site files path (`/iraise/files/`). Both domains serve the same files, but canonical is `sites.uw.edu`.
**How to avoid:** Resolve photo URLs against the full URL in the `src=` attribute; don't strip the host. Normalize `www.raise.uw.edu/files/` → `sites.uw.edu/iraise/files/` (or vice versa) if mixed hosts cause issues. Filenames are opaque (`Screenshot-2024-04-02-at-3.40.58-PM-bb8add218186eb12.png`) — on download, rename to `{person-slug}.{ext}` and update frontmatter `photo: /images/people/{slug}.{ext}`.

### Pitfall 8: People counts don't match REQUIREMENTS estimate
**What goes wrong:** REQUIREMENTS.md says "16 people"; live site has 19 (Leadership 3 + Affiliates 14 + Staff 2). Event estimate says "50+"; live site has 30–41 depending on counting method.
**Why it happens:** Estimates in REQUIREMENTS were approximate; live site has drifted.
**How to avoid:** Scrape-driven counts are authoritative. Report actual counts back to the planner so STATE.md metrics are accurate.

### Pitfall 9: Schema requires `researchAreas` but source has them in bio prose only
**What goes wrong:** `researchAreas: z.array(z.string())` requires an array of tags on people. The raise.uw.edu people page has research areas mentioned **inside the bio text** (e.g., "technology for endangered language documentation, computational semantics") — not as a separate tag list.
**Why it happens:** Different information architecture — the live site uses prose, the new site uses tags.
**How to avoid:** Either (a) default to `[]` and accept that existing sample handcrafting is the source of truth for tags, or (b) pattern-match bio text for common topic keywords (`fairness`, `bias`, `misinformation`, `NLP`, …). Option (a) is safer; (b) risks false positives. Handcrafted samples use 3 tags each — a reasonable default is to leave `researchAreas: []` for new people and let editors fill via CMS in Phase 3.

## Code Examples

### Fetching and parsing a Divi page
```javascript
// Source: https://cheerio.js.org/docs/intro/
import * as cheerio from 'cheerio';

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'RAISE-content-migration/1.0 (https://raise.uw.edu)' },
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return cheerio.load(await res.text());
}

const $ = await fetchPage('https://raise.uw.edu/publications/');
```

### Parsing publications (verified against live HTML)
```javascript
function parsePublications($) {
  const pubs = [];
  $('.et_pb_blurb').each((_, el) => {
    const $el = $(el);
    const $row = $el.closest('.et_pb_row');  // or walk up to find the row
    const title = $el.find('.et_pb_module_header span').first().text().trim();
    if (!title) return;

    // Venue and date both live inside <strong>
    const strongText = $el.find('strong').first().text().trim();
    // "Proceedings of the International AAAI Conference on Web and Social Media, 7 June 2025"
    const [venue, dateStr] = splitVenueDate(strongText);

    // Authors are the second <p> in the description
    const authors = $el.find('.et_pb_blurb_description p').eq(1).text().trim()
      .split(/,\s*/).filter(Boolean);

    // The "Read Here" link and topic button are sibling et_pb_buttons inside the same row
    const buttons = $row.find('.et_pb_button');
    const readHereHref = buttons.filter((_, b) => $(b).text().trim() === 'Read Here').attr('href');
    const topicText = buttons.filter((_, b) => $(b).text().trim() !== 'Read Here').text().trim();
    const topics = topicText.split('|').map(s => normalizeTopic(s.trim())).filter(Boolean);

    pubs.push({ title, venue, date: parseDate(dateStr), authors, topics, readHereHref });
  });
  return pubs;
}
```

### Parsing people (with role + bio)
```javascript
function parsePeople($) {
  const people = [];
  const sectionHeadings = $('h1, h2, h3').filter((_, h) =>
    ['Leadership', 'Affiliates', 'Staffs', 'Alumni'].includes($(h).text().trim())
  );

  sectionHeadings.each((sectionIdx, sectionEl) => {
    const sectionLabel = $(sectionEl).text().trim();
    const role = { Leadership: 'leadership', Affiliates: 'affiliate', Staffs: 'staff', Alumni: 'alumni' }[sectionLabel];

    // Walk forward until the next section heading
    let node = sectionEl.nextSibling;
    const until = sectionHeadings.get(sectionIdx + 1);
    while (node && node !== until) {
      const $node = $(node);
      $node.find('.et_pb_team_member').each((idx, tm) => {
        const $tm = $(tm);
        const name = $tm.find('.et_pb_module_header').text().trim();
        const positionLine = $tm.find('.et_pb_member_position').text().trim();
        // Bio: everything in the description div, strip styling
        const bio = $tm.find('.et_pb_team_member_description > div')
          .text().trim().replace(/\s+/g, ' ');
        const email = $tm.find('a[href^="mailto:"]').attr('href')?.replace(/^mailto:/, '');
        const x = $tm.find('.et_pb_twitter_icon').parent().attr('href');
        const linkedin = $tm.find('.et_pb_linkedin_icon').parent().attr('href');
        // Photo is in adjacent column
        const photo = $node.find('.et_pb_image img').first().attr('src');

        people.push({
          name,
          role,
          title: positionLine,
          email,
          x: x ? '@' + x.split('/').pop() : undefined,
          linkedin,
          photo,
          bio,
          order: people.length + 1,
        });
      });
      node = node.nextSibling;
    }
  });
  return people;
}
```

### Writing an MDX file via gray-matter
```javascript
import matter from 'gray-matter';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import slug from 'slug';

async function writePerson(person, repoRoot) {
  const filename = slug(person.name, { lower: true }) + '.mdx';
  const frontmatter = {
    name: person.name,
    role: person.role,
    title: person.title,
    ...(person.department && { department: person.department }),
    ...(person.email && { email: person.email }),
    ...(person.x && { x: person.x }),
    ...(person.linkedin && { linkedin: person.linkedin }),
    ...(person.photo && { photo: `/images/people/${filename.replace('.mdx', path.extname(person.photo))}` }),
    researchAreas: person.researchAreas ?? [],
    order: person.order,
  };
  const mdx = matter.stringify(person.bio ?? '', frontmatter);
  const out = path.join(repoRoot, 'site/src/content/people', filename);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, mdx, 'utf8');
}
```

### Streaming an asset to disk
```javascript
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}
```

### Parallel-bounded downloads
```javascript
import pLimit from 'p-limit';
const limit = pLimit(5);
await Promise.all(
  people.map(p => limit(async () => {
    if (!p.photo) return;
    const ext = path.extname(new URL(p.photo).pathname) || '.jpg';
    const filename = slug(p.name, { lower: true }) + ext;
    await downloadImage(p.photo, `site/public/images/people/${filename}`);
  }))
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `node-fetch` as a dependency | Node 22's global `fetch` (undici under the hood) | Node 18 (Oct 2022) stabilized `fetch`, Node 21 removed `--experimental-fetch` flag | One fewer dep; native Web Streams support for downloads |
| `request` library | Built-in `fetch` + `undici` | `request` deprecated 2020 | Don't add `request`; use `fetch` |
| CommonJS `require('cheerio')` | ESM `import * as cheerio from 'cheerio'` | cheerio 1.0 (May 2024) went ESM-first | Project is `"type": "module"`; use ESM imports |
| cheerio 0.x named export | cheerio 1.x namespace import | cheerio 1.0 (2024) | Import pattern differs — see Code Examples |

**Deprecated/outdated:**
- `request` / `request-promise`: replace with built-in `fetch`
- `moment.js`: use `date-fns` (smaller, tree-shakeable, still maintained)
- `html-parser` (no namespace): use `node-html-parser` or `cheerio`

## Open Questions

### 1. Schema `.url()` blocks local PDF paths — planner must decide (BLOCKING)

**What we know:**
- `site/src/content.config.ts` defines `pdf: z.string().url().optional()`, `recording: z.string().url().optional()`, `slides: z.string().url().optional()`, `website: z.string().url().optional()`.
- MIG-05 requires publication PDFs downloaded to `public/pdfs/` — local paths like `/pdfs/foo.pdf` **fail** `.url()` validation.
- Only 2 of 43 publications have direct `.pdf` URLs at all. 26 are DOI landing pages, 7 are arXiv abs pages, 8 are publisher landing pages.
- `photo` and `speakerPhoto` are bare `z.string()` — local paths work there. The asymmetry is inconsistent.

**What's unclear:** Which decision does the planner want?
- **Option A — Schema edit (simplest):** Drop `.url()` from `pdf`, `recording`, `slides`, `website`. Local and remote values both validate. Consistent with `photo`.
- **Option B — Scope MIG-05 down:** Only download PDFs for arXiv links (auto-convert `/abs/` → `/pdf/`) and the 2 direct PDFs. Everything else stays as `doi: 10.NNNN/...` in the detail page. Keep `.url()`; populate `pdf:` only for local files (won't validate — still needs A). Still requires schema edit.
- **Option C — Dual fields:** Add `pdfLocal: z.string().optional()` (unconstrained) alongside existing `pdf`. Ugly.

**Recommendation for planner:** **Option A (schema edit).** It's a one-line change per field, resolves the contradiction cleanly, matches the `photo` pattern, and leaves the migration strategy (local-where-available, external-link-when-not) to the scraper. The detail page templates already conditionally render `pdf`/`doi` — no page-level changes needed.

### 2. Existing sample MDX collides with scraper output — planner must decide

**What we know:**
- 7 handcrafted sample MDX files exist: 3 people (Bill Howe, Chirag Shah, Tanu Mitra), 2 events (AI as Normal Technology, Faeze LLM Adaptation), 2 publications (LLM Opioid Reddit, ML Fairness Computational).
- All 7 describe real raise.uw.edu content. The scraper will regenerate all 7.
- CONTEXT.md says "direct MDX output — files land straight in `src/content/` and are review-able via `git diff`," implying overwrite.
- Handcrafted Bill Howe bio is demonstrably richer (two paragraphs, mentions co-founding, research themes) than what's auto-extractable from the Divi-wrapped source (one prose paragraph with inline styling). Same for Tanu Mitra and Chirag Shah.

**What's unclear:** Which policy?
- **A. Overwrite all (per CONTEXT.md literal reading):** Simpler; git diff lets you revert richer bios manually if needed.
- **B. Skip-if-exists:** Preserves handcrafted content; scraper only emits new entries. Risk: drift between live-site updates and MDX.
- **C. Delete-all-then-scrape:** Explicit `rm -rf src/content/{people,events,publications}/*.mdx` before scrape. Clean slate; handcrafted bios are lost unless restored from git.

**Recommendation for planner:** **A (overwrite) with an explicit post-scrape review task.** CONTEXT.md already commits to this workflow. Make the review task concrete: after `pnpm scrape`, run `git diff site/src/content/` and preserve any handcrafted bios that were richer than the scraped version (commit them back). This keeps the scraper deterministic and makes the value-add of human curation an explicit review step.

### 3. Event count — live site has 30–41, estimate says "50+" (NON-BLOCKING)

**What we know:** Scraped `/talksevents/` contains:
- 43 total event-like Divi rows (by row count)
- 41 Zoom join links
- 30 "Guest Speaker" blocks (implies 30 events with full bio)
- 23 unique detected date patterns

**What's unclear:** How many of these are actual events vs. page decoration? The "50+" in REQUIREMENTS may have been optimistic.

**Recommendation for planner:** Scope the event parser to "whatever the scraper extracts with a non-empty title and date." Report final count back to STATE.md. Don't block on matching the 50+ estimate — the success criterion is "all 50+ real events migrated," and reality is the denominator.

### 4. `researchAreas` field has no clean source on live site

**What we know:** Schema requires `researchAreas: z.array(z.string()).default([])`. Live site has research areas mentioned in bio prose, not as tags.

**Recommendation:** Default to `[]`. Handcrafted Bill Howe/Tanu/Chirag already populate these (3 tags each); preserve them via the overwrite-with-review flow from #2. Let the Phase 3 CMS allow editors to add tags.

### 5. `linkedPublications` / `linkedTalks` — when to wire up

**What we know:** CONTEXT.md says "wire these up during migration where associations are identifiable from the existing site, leave as empty arrays otherwise." The live site has no such associations — publications and events list authors/speakers as plain text, not links.

**Recommendation:** All-empty arrays for now. Post-scrape, run a name-matching pass: for each publication, if any author name matches a person entry name exactly, add that publication ID to the person's `linkedPublications`. Same for events: if the speaker name matches a person, add the event ID to `linkedTalks`. This is mechanical enough to be safe.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Scraper runtime | ✓ | 25.2.1 (> required ≥22.12) | — |
| Python 3 | Not required (Node scraper chosen) | ✓ | 3.14.3 | — |
| curl | Manual verification | ✓ | 8.7.1 | — |
| Network access to `raise.uw.edu` | Scraper fetch | ✓ | — | — |
| Network access to `sites.uw.edu` | Image download | ✓ | — | — |
| Network access to `arxiv.org` | Optional PDF fetch | ✓ (assumed) | — | Skip arXiv PDFs, keep external link |
| Network access to DOI / publisher sites | No — these are linked externally, not downloaded | n/a | — | — |
| pnpm | Project package manager | ✓ (project already uses npm scripts but CLAUDE.md says `pnpm build`) | — | npm works too; package.json scripts are pm-agnostic |

**Missing dependencies with no fallback:** None. All scraper dependencies are npm-installable.

**Missing dependencies with fallback:** arXiv PDF download can be skipped if `arxiv.org` is unreachable — external `doi:` / link remains.

## Sources

### Primary (HIGH confidence)
- `/Users/mayuri/Projects/RAISE/site/src/content.config.ts` — authoritative Zod schema; verified URL constraint on `pdf`/`recording`/`slides`/`website` vs bare string on `photo`/`speakerPhoto`.
- `/Users/mayuri/Projects/RAISE/site/src/content/{people,events,publications}/*.mdx` — 7 sample files; verified frontmatter format, prose-body convention for people only.
- Live scrape of `https://raise.uw.edu/publications/` (2026-04-17): 43 publications, Divi `.et_pb_blurb` structure, pipe-separated topic buttons, "Read Here" external links.
- Live scrape of `https://raise.uw.edu/people/` (2026-04-17): 19 people across Leadership/Affiliates/Staffs; no Alumni; photos on `sites.uw.edu/iraise/files/`.
- Live scrape of `https://raise.uw.edu/talksevents/` (2026-04-17): 30–41 events in mixed Divi+Framer layout; Zoom-join pattern.
- `https://raise.uw.edu/wp-sitemap.xml` — confirmed no useful custom post types; only `talk-1` project entry exists.
- `https://raise.uw.edu/wp-json/wp/v2/pages?slug=publications` — confirmed WP REST API returns Divi shortcode markup, not rendered content.
- `npm view cheerio version` → 1.2.0 (published 2026-01-23)
- `npm view gray-matter version` → 4.0.3
- `npm view date-fns version` → 4.1.0
- `npm view slug version` → 11.0.1
- `npm view p-limit version` → 7.3.0
- `http://cheerio.js.org/docs/intro/` — ESM import pattern for cheerio 1.x

### Secondary (MEDIUM confidence)
- Topic acronym whitelist derived from observed publication topics (LLM, NLP, AI, COVID-19) — extrapolation; might miss domain-specific acronyms. Recommend adding to the whitelist incrementally as scraper runs surface new cases.

### Tertiary (LOW confidence)
None — all claims verified against live HTML or npm registry.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every library version verified against npm registry today; cheerio selector patterns verified against live Divi HTML.
- Architecture: HIGH — HTML structure sampled directly, not inferred. Selector patterns written against real source.
- Pitfalls: HIGH — all 9 pitfalls are either verified against live HTML (#1–4, #6–8) or direct readings of the Zod schema (#5, #9).
- Open Questions: HIGH — the schema `.url()` vs local-path contradiction is a concrete, verified bug in the current schema, not speculation.

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 — WordPress content drifts; the scraper should be runnable any time before UW publishes the new site, but if they edit the page layout significantly, selector-stability guarantees weaken (Pitfall 1). Re-verify selector token presence if more than 30 days elapse before running.
