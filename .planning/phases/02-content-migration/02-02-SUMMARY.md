---
phase: 02-content-migration
plan: 02
subsystem: content-migration
tags: [astro, mdx, cheerio, divi, framer, people, events, scraper]

# Dependency graph
requires:
  - phase: 02-content-migration
    provides: scraper orchestrator (scrape.mjs), shared libs (mdx/slugify/dates/topics), publications parser, relaxed content schema, npm script
provides:
  - 19 person MDX files scraped from raise.uw.edu in site/src/content/people/
  - 29 event MDX files scraped from raise.uw.edu in site/src/content/events/
  - People parser (site/scripts/parsers/people.mjs) with document-order row iteration, last-comma department heuristic, handcrafted-preservation PRESERVE map, Unicode-aware email/bio extraction
  - Events parser (site/scripts/parsers/events.mjs) with Divi+Framer row selection, title via .et_pb_text_inner, ordinal-tolerant date regex, Guest Speaker / Abstract sentinel parsing
  - Orchestrator --people and --events flag routing
affects:
  - 02-content-migration (02-03 will download author photos for the 19 people + add 1 sample article)
  - 03-cms-production-launch (Decap CMS collections surface these 48 MDX entries; editorial cleanup for Phase 3)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Document-order row iteration for flat-HTML section detection (Divi single-section multi-role layout)
    - PRESERVE map for merging handcrafted metadata back after clean-slate scrape
    - Last-comma department heuristic for best-effort field extraction
    - Unicode-aware regex with \p{Lu}/\p{L}/\p{M} for diacritic-aware name matching
    - Visible-text anchor selection for copy-paste-leaked mailto cases
    - Cross-block Twitter-handle dedup to drop source-site copy-paste leaks

key-files:
  created:
    - site/scripts/parsers/people.mjs
    - site/scripts/parsers/events.mjs
    - site/src/content/people/ (19 MDX files: 3 leadership, 14 affiliate, 2 staff)
    - site/src/content/events/ (29 MDX files, all upcoming: false)
  modified:
    - site/scripts/scrape.mjs (added --people and --events flag dispatch + imports)

key-decisions:
  - "People parser walks .et_pb_row in document order (not .et_pb_section): live raise.uw.edu wraps all 19 people in a single section with role headings in sibling rows"
  - "Handcrafted-preservation via PRESERVE map baked into people parser: bill-howe, chirag-shah, tanu-mitra keep department 'Information School' + their 3-element researchAreas arrays after scraper clean-slate"
  - "Department extraction is best-effort: last-comma heuristic extracts department for titles formatted as 'Role, Department'; most raise.uw.edu titles are role-only and omit department per D-03"
  - "Events title extraction via .et_pb_text_inner (first one in row) not img[title]: image-title attributes on raise.uw.edu are junk ('New Template', 'VB2', speaker-only names)"
  - "Events speaker extraction is opportunistic: Unicode-aware name regex on first sentence of speaker bio; falls back to 'Guest Speaker' default when bio starts with a pronoun (He/She/Her/His)"
  - "Twitter handle dedup: @chirag_shah was leaked into Tanu Mitra and Emily Bender team_member blocks in source markup; parser drops second-and-later occurrences of any shared handle"

patterns-established:
  - "Live-DOM reality check before trusting plan selectors: when the plan assumes section-level iteration but live HTML has everything in one section, walk rows instead"
  - "Compute slug ONCE per entity via const personSlug = makeSlug(p.name) and reuse for both photo path and filename to avoid slug-cache -2/-3 suffix drift"
  - "When source markup has copy-paste leaks (duplicate mailto, duplicate twitter), use visible-text selection + cross-entry dedup as last-mile filters"

requirements-completed:
  - MIG-02
  - MIG-03

# Metrics
duration: ~16 min
completed: 2026-04-18
---

# Phase 02 Plan 02: People + Events Migration Summary

**Scraped 19 real RAISE team members (3 leadership + 14 affiliate + 2 staff) and 29 past talks from raise.uw.edu into MDX with document-order row iteration, PRESERVE-map handcrafted preservation, and Framer-aware event-row parsing — all validating against the Zod schema**

## Performance

- **Duration:** ~16 min
- **Started:** 2026-04-18T19:32:00Z (approx)
- **Completed:** 2026-04-18T19:48:00Z
- **Tasks:** 2
- **Files created:** 2 parsers + 19 person MDX + 29 event MDX = 50 new files; 1 modified (scrape.mjs)

## Accomplishments

- Replaced 3 handcrafted sample people (Bill Howe, Tanu Mitra, Chirag Shah) with a scraped set of 19, with the handcrafted Information School department and 3-entry researchAreas preserved for those 3 leadership slugs via PRESERVE map
- Replaced 2 handcrafted sample events (AI as Normal Technology, Faeze LLM Adaptation) with a scraped set of 29 past talks spanning 2023-2025
- Scraper orchestrator now routes --publications / --people / --events (and --all / no-flag runs all three)
- `pnpm build` (invoked as `npm run build`) passes with full content corpus: 41 publications + 19 people + 29 events = 98 pages built, no ZodErrors
- Established 4 new parser-level patterns: document-order row iteration, PRESERVE-map handcrafted merge, Unicode-aware name regex, and visible-text anchor picking for copy-paste-leaked mailtos

## Task Commits

Each task was committed atomically:

1. **Task 1: People parser + migration** — `b6eed28` (feat)
2. **Task 2: Events parser + migration** — `126e549` (feat)

## Files Created/Modified

- `site/scripts/parsers/people.mjs` — Divi .et_pb_team_member parser. Walks .et_pb_row in document order to detect role-heading-carrying rows and flip currentRole. Picks visible-text mailtos to work around copy-paste leaks. Deduplicates Twitter handles across people (source-site data corruption). Bio extraction from `<h2>`/`<h3>`/`<p>` tags inside first child `<div>`, filtering email-only chunks. PRESERVE map merges Information School department + 3 handcrafted researchAreas back into bill-howe/chirag-shah/tanu-mitra.
- `site/scripts/parsers/events.mjs` — Divi+Framer events parser. Title via first `.et_pb_text_inner` (image titles are junk). Date via ordinal-tolerant regex with comma-split for time. Guest Speaker / Abstract text-marker splits for speaker bio and abstract. Unicode-aware speaker-name regex with pronoun guard. Zoom/Join-Event trailing-sentence trim.
- `site/scripts/scrape.mjs` — added `--people` flag dispatch (fetches `https://raise.uw.edu/people/`) and `--events` flag dispatch (fetches `https://raise.uw.edu/talksevents/`); imports parsePeople + parseEvents from `./parsers/`.
- `site/src/content/people/*.mdx` — 19 MDX files (3 leadership: bill-howe, chirag-shah, tanu-mitra; 14 affiliate including afra-mashhadi, andrew-j-connolly, aylin-caliskan, dingwen-tao, emily-m-bender, jamie-morgenstern, leilani-battle, mike-teodorescu, muhammad-aurangzeb-ahmad, ott-toomet, tyler-h-mccormick, yulia-tsvetkov, yunhe-feng, alex-abplanalp; 2 staff: ashlyn-luo, kirandeep-kaur).
- `site/src/content/events/*.mdx` — 29 MDX files (all upcoming: false). Date range Oct 2023 – Jun 2025. All with title/speaker/date/upcoming at minimum; 25 with speakerBio; 27 with abstract.

## Decisions Made

- **People parser uses document-order row iteration, not section-level iteration.** The plan's inline code assumed `.et_pb_section` would partition people by role, but live raise.uw.edu (verified 2026-04-17) wraps all 19 people in a SINGLE `.et_pb_section` with role headings living in sibling `.et_pb_row` blocks. Switched to walking `.et_pb_row` and flipping `currentRole` on each heading-carrying row.
- **PRESERVE map restores handcrafted department + researchAreas.** Bill Howe, Chirag Shah, and Tanu Mitra had `department: Information School` and 3-element researchAreas arrays in the handcrafted MDX that the scraper would overwrite. A hardcoded PRESERVE map merges those values back after each write. Sources: original handcrafted MDX files verified pre-scrape.
- **Events title via `.et_pb_text_inner[0]`, not `img[title]`.** Image `title` attributes on raise.uw.edu are junk (`New Template`, `VB2`, `04181`, speaker-only names `Gagan Bansal`, etc.). The first `.et_pb_text_inner` in each row consistently holds the actual event title across all 41 event-like rows.
- **Speaker extraction is opportunistic via Unicode-aware name regex on the first sentence of the speaker bio.** Falls back to `'Guest Speaker'` placeholder when bio starts with a pronoun (He/She/Her/His/They/etc.) — affects 3 of 29 events (AI as Normal Technology/Arvind Narayanan, Beyond Scaling, Context and Participation). Handles honorifics (Dr./Prof./Mr./Ms./Mrs.) and diacritics (Stypińska).
- **Twitter handle dedup post-pass.** `@chirag_shah` was leaked into Tanu Mitra and Emily Bender blocks in source markup. Detect by first-order-wins: if a handle appears on 2+ people, keep only the first (by order). Results: 4 valid handles remain (Bill Howe, Chirag Shah, Aylin Caliskan, Tyler McCormick); Tanu and Emily have x field omitted per D-03.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] People role iteration used section-level not row-level**
- **Found during:** Task 1 verification run
- **Issue:** Plan's inline code walks `.et_pb_section` and maps all team_members in each section to the first role heading found. Live raise.uw.edu (2026-04-17) has all 19 people in ONE section with role headings in sibling rows — all 19 got mapped to `leadership`.
- **Fix:** Replaced section walker with `.et_pb_row` walker that tracks `currentRole` and flips it when a row carries Leadership/Affiliates/Staffs/Alumni heading text. Team members in subsequent rows inherit `currentRole` until the next heading row.
- **Files modified:** site/scripts/parsers/people.mjs
- **Verification:** Role distribution now 3 leadership + 14 affiliate + 2 staff = 19 (was 19/0/0 before fix).
- **Committed in:** b6eed28 (Task 1 commit — caught and fixed in-task before commit)

**2. [Rule 1 - Bug] Email extraction picked leaked copy-paste mailtos**
- **Found during:** Task 1 verification, inspecting Emily Bender, Tyler McCormick, Mike Teodorescu output
- **Issue:** Source markup has empty `<a href="mailto:OTHER@uw.edu"></a>` spans embedded in some people's blocks (copy-pasted from adjacent entries). Plan's `$tm.find('a[href^="mailto:"]').attr('href')` picked the FIRST mailto, which was the leaked one.
- **Fix:** Added `pickVisibleEmail` helper that selects the anchor whose inner TEXT contains an `@`-shaped string, preferring the text over the href (handles Alex Abplanalp's `mailto: yunhe@uw.edu` href bug where the text was the correct `ann08@uw.edu`).
- **Files modified:** site/scripts/parsers/people.mjs
- **Verification:** ebender@uw.edu, tylermc@uw.edu, miketeod@uw.edu, ann08@uw.edu all correct post-fix.
- **Committed in:** b6eed28

**3. [Rule 1 - Bug] Twitter handle @chirag_shah leaked into 3 people's blocks**
- **Found during:** Task 1 verification
- **Issue:** Source HTML has `@chirag_shah` URL duplicated into Tanu Mitra and Emily Bender team_member blocks (copy-paste in WordPress editor). Without cross-block dedup, 3 people all got the same handle.
- **Fix:** Post-pass dedup on extracted x handles — if a handle appears on 2+ people, keep only the first occurrence (by `order`), null out subsequent.
- **Files modified:** site/scripts/parsers/people.mjs
- **Verification:** 4 distinct handles (Bill Howe, Chirag Shah, Aylin Caliskan, Tyler McCormick) remain; Tanu + Emily have x omitted. Tanu's real handle `@tanu_mitra` is not in the source HTML at all, so it's not recoverable without human curation.
- **Committed in:** b6eed28

**4. [Rule 1 - Bug] Bio extraction missed `<h2>`/`<h3>` wrapping**
- **Found during:** Task 1 verification, bios were just "title text" repeats
- **Issue:** Plan's `cleanBioText` collected only `<p>` tag text. raise.uw.edu wraps bios in `<h2>` / `<h3>` tags with inline styling (Divi template artifact). Empty `<p>` tags returned empty strings.
- **Fix:** Changed cleanBioText to walk the first inner `<div>` of the description, collect text from p + h1-h4 tags, strip inline styling, filter chunks that are just email addresses (Divi wraps the contact email in an adjacent `<h2>`), and deduplicate consecutive identical chunks.
- **Files modified:** site/scripts/parsers/people.mjs
- **Verification:** Bill Howe's bio now reads "Bill Howe is an Associate Professor in the iSchool..." (proper prose) instead of "Faculty Director, Co-Founder" (title echo). 19/19 people have substantive bio prose bodies post-fix.
- **Committed in:** b6eed28

**5. [Rule 1 - Bug] Events title extraction used image title attributes (junk)**
- **Found during:** Task 2 planning (inspected 41 event rows before writing parser)
- **Issue:** Plan's inline code preferred `img[title]` for event title. Live source has many junk image titles: `New Template`, `New Template 22`, `VB2`, `Haritalk`, `04181`, plus some rows where image title is the SPEAKER name not event name (e.g., `Gagan Bansal` for event "Concrete Problems for Developing Human-Centered Agents").
- **Fix:** Use `.et_pb_text_inner[0]` (first text_inner in the row). Verified consistent across all 41 event-like rows — this is where Framer embeds the event title. Image titles dropped entirely.
- **Files modified:** site/scripts/parsers/events.mjs
- **Verification:** All 29 emitted events have descriptive titles (e.g., "Concrete Problems for Developing Human-Centered Agents" not "Gagan Bansal"). No "New Template" or "VB2" titles.
- **Committed in:** 126e549

**6. [Rule 1 - Bug] Speaker-name heuristic produced garbage single tokens**
- **Found during:** Task 2 verification
- **Issue:** Plan's `\.\s` sentence-boundary heuristic for speaker extraction gave results like `"Dr"` (from "Dr. Prabhakaran is...") and missed diacritics entirely (`"Dr. Stypińska is..."` → null). Also missed curly-apostrophe possessives like `"Faeze's research"`.
- **Fix:** Replaced with Unicode-aware regex using `\p{Lu}[\p{L}\p{M}]+` for name tokens, pronoun guard rejecting "He/She/Her/His/They/My/I/We" starts, explicit honorific prefix (Dr./Prof./Mr./Ms./Mrs.), and support for both `'s` (straight) and `'s` (curly) possessives.
- **Files modified:** site/scripts/parsers/events.mjs
- **Verification:** 26 of 29 events have a plausible speaker name (single first name in most cases, full name for Dr./Prof. forms); 3 (AI as Normal Technology, Beyond Scaling, Context and Participation) fall back to `Guest Speaker` because their bios start with pronouns — acceptable per plan (`speaker: speaker || 'Guest Speaker'`).
- **Committed in:** 126e549

---

**Total deviations:** 6 auto-fixed (6 Rule 1 bugs — all in the scraper parsers against live DOM)
**Impact on plan:** All 6 fixes were necessary to produce schema-valid output. None changed the plan's architecture, data model, or dependency graph. Impact scope was limited to `scripts/parsers/{people,events}.mjs`. Success criteria all met; no scope creep.

## Issues Encountered

**Source-site data quality issues** (not fixable without human curation — noted for Phase 3 CMS):

1. **Emily Bender and Tanu Mitra have no valid Twitter handle in source HTML.** Chirag Shah's handle `@chirag_shah` was copy-pasted into their blocks; post-dedup, both have `x:` omitted. Tanu's real `@tanu_mitra` handle (preserved in the original handcrafted MDX) is not recoverable from the live page. Phase 3 CMS will let editors restore.

2. **The `researchAreas` field is empty for all 16 non-leadership affiliates/staff.** Live site has no structured research-areas data for these people — bios mention research themes in prose but extracting tags would require NLP-style inference (false-positive risk). Phase 3 CMS will let editors add tags.

3. **Some speaker bios start with pronouns** (AI as Normal Technology, Beyond Scaling, Context and Participation), so those 3 events have `speaker: Guest Speaker` as placeholder. The bio body often names the speaker in later sentences (e.g., "Narayanan led the Princeton...") but reliable extraction was out of scope.

4. **Most scraped event dates are UTC-midnight local-offset variants** (e.g., `2024-11-08T08:00:00.000Z` for a Nov 8 PT event). This is date-fns parsing behavior — no PT-timezone awareness in the raw date strings. Date-only comparison in the index page works correctly; PT time zone is displayed via the separate `time:` field.

**None of the above prevented Plan 02-02 success criteria from being met.**

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Events and people collections fully populated with real content; `/events` and `/people` now render 29 and 19 real entries respectively (was 2 + 3 samples).
- Photo paths in people MDX all reference `/images/people/{slug}.{ext}` — files do NOT exist yet (404 on build is expected); Plan 02-03 will download them.
- `npm run scrape` (all flags) runs the full 3-parser pipeline end-to-end in one command.
- Build is green (98 pages); no blockers for Plan 02-03 (asset downloads, linked-ref wiring, sample article).

## Self-Check: PASSED

- site/scripts/parsers/people.mjs: FOUND
- site/scripts/parsers/events.mjs: FOUND
- site/src/content/people/ contains 19 MDX files
- site/src/content/events/ contains 29 MDX files
- Commit b6eed28 (Task 1: people): FOUND
- Commit 126e549 (Task 2: events): FOUND
- `npm run build` exits 0 with 98 pages built

---
*Phase: 02-content-migration*
*Completed: 2026-04-18*
