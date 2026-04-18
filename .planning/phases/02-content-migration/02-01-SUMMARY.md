---
phase: 02-content-migration
plan: 01
subsystem: content-migration
tags: [astro, mdx, cheerio, gray-matter, date-fns, slug, scraper, publications]

# Dependency graph
requires:
  - phase: 01-complete-the-site-surface
    provides: publications detail page template and content collection schema
provides:
  - 41 publication MDX files scraped from raise.uw.edu in site/src/content/publications/
  - Scraper orchestrator CLI (site/scripts/scrape.mjs) with --publications / --all flags
  - Shared scraper libs: mdx.mjs, slugify.mjs, dates.mjs, topics.mjs
  - Publications parser (site/scripts/parsers/publications.mjs) using stable .et_pb_blurb selectors
  - Relaxed content schema: pdf/recording/slides/website no longer require .url() (local paths allowed)
  - npm script: pnpm scrape
affects:
  - 02-content-migration (02-02, 02-03 will add parsers via same orchestrator)
  - 03-cms-production-launch (Decap CMS collections depend on finalized MDX schema)

# Tech tracking
tech-stack:
  added:
    - cheerio@^1.2.0 (HTML parsing)
    - gray-matter@^4.0.3 (MDX frontmatter writer)
    - date-fns@^4.1.0 (multi-format date parsing)
    - slug@^11.0.1 (kebab-case slugification)
    - p-limit@^7.3.0 (concurrency limiter, available for 02-02/03)
    - "@types/slug" (TypeScript types)
  patterns:
    - Spread-conditional field omission: ...(val && { field: val }) for D-03 compliance
    - Stable CSS token selectors (.et_pb_blurb) — never numbered variants
    - gray-matter.stringify for MDX write (not template strings)
    - Orchestrator flag routing (--publications, --all) with per-parser modules
    - Slug collision deduplication with in-memory seen Map
    - Multi-format date parsing with ordinal-suffix stripping

key-files:
  created:
    - site/scripts/scrape.mjs
    - site/scripts/parsers/publications.mjs
    - site/scripts/lib/mdx.mjs
    - site/scripts/lib/slugify.mjs
    - site/scripts/lib/dates.mjs
    - site/scripts/lib/topics.mjs
    - site/src/content/publications/ (41 MDX files)
  modified:
    - site/src/content.config.ts (pdf/recording/slides/website url() constraints removed)
    - site/package.json (scrape script added, 6 dev deps added)
    - site/pnpm-lock.yaml

key-decisions:
  - "arXiv /abs/ URLs converted to /pdf/ and stored as pdf field (Plan 02-03 will download)"
  - "doi.org landing-page URLs: extract DOI ID to doi field; other landing-page URLs stored as doi field raw"
  - "Direct .pdf external URLs stored as pdf field for Plan 02-03 to download and rewrite to /pdfs/{slug}.pdf"
  - "Slug collision handling via -2/-3 suffix deduplication using module-scoped seen Map"
  - "Clean-slate policy: rm -rf src/content/publications on each scraper run (git diff shows any regression)"

patterns-established:
  - "Scraper orchestrator pattern: scrape.mjs dispatches via --flag routing to parser modules in parsers/"
  - "Shared lib pattern: all parsers import from scripts/lib/ (mdx, slugify, dates, topics)"
  - "D-03 omit-when-missing: cleanFrontmatter() strips undefined/null/empty at write time"
  - "User-Agent header: RAISE-content-migration/1.0 on all fetch calls"

requirements-completed:
  - MIG-01

# Metrics
duration: ~45min
completed: 2026-04-18
---

# Phase 02 Plan 01: Scraper Foundation + Publications Migration Summary

**41 real RAISE publications scraped from raise.uw.edu into MDX via a Cheerio/gray-matter pipeline with multi-format date parsing, arXiv PDF conversion, and stable Divi class-token selectors**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-04-18
- **Completed:** 2026-04-18
- **Tasks:** 3
- **Files modified:** 12 + 41 MDX files created

## Accomplishments

- Replaced 2 sample publications with 41 real RAISE publications from raise.uw.edu, all with title/authors/venue/date/topics
- Built reusable scraper foundation (orchestrator + 4 shared libs) that Plans 02-02 and 02-03 will extend with --people, --events, --assets flags
- Relaxed content schema .url() constraints on pdf/recording/slides/website so local asset paths (Plan 02-03) will validate without ZodError
- `pnpm build` passes with all 41 migrated publications validating against schema (55 pages built, exit 0)

## Task Commits

1. **Task 1: Relax schema, install deps, add npm script** - `0e3947c` (chore)
2. **Task 2: Build scraper orchestrator + shared libs** - `27a38f5` (feat)
3. **Task 3: Implement publications parser + run migration** - `f9fa0b3` (feat)

## Files Created/Modified

- `site/src/content.config.ts` — pdf/recording/slides/website .url() constraints removed
- `site/package.json` — scrape script + 6 dev deps (cheerio, gray-matter, date-fns, slug, p-limit, @types/slug)
- `site/scripts/scrape.mjs` — orchestrator with RAISE-content-migration/1.0 User-Agent, --publications/--all flags
- `site/scripts/parsers/publications.mjs` — Divi .et_pb_blurb parser with venue/date split, arXiv PDF conversion
- `site/scripts/lib/mdx.mjs` — gray-matter MDX writer with cleanFrontmatter D-03 enforcement
- `site/scripts/lib/slugify.mjs` — kebab-case slug generator with collision deduplication
- `site/scripts/lib/dates.mjs` — multi-format date parser (d MMMM yyyy, d MMM yyyy, MMMM d, yyyy) with ordinal-suffix stripping
- `site/scripts/lib/topics.mjs` — pipe-separated topic normalizer with acronym whitelist (LLM, AI, NLP, HCI, COVID-19, etc.)
- `site/src/content/publications/*.mdx` — 41 publication MDX files (all frontmatter-only, no body)

## Decisions Made

- arXiv /abs/ URLs are converted to /pdf/ and stored as `pdf:` field. Plan 02-03 will download these and rewrite to `/pdfs/{slug}.pdf`
- doi.org URLs: DOI identifier extracted (e.g. `10.24963/ijcai.2023/659`) into `doi:` field; other landing-page URLs also stored in `doi:` as raw URL
- Direct .pdf external URLs stored as `pdf:` for Plan 02-03 download+rewrite
- Clean-slate policy on each scraper run: `rm -rf src/content/publications` before writing, so `git diff` provides regression visibility
- Slug deduplication via in-memory `seen` Map with `-2`/`-3` suffix appending

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - scraper ran cleanly on first execution, extracting 41 publications. Build passed with no ZodErrors. The two handcrafted sample files (llm-opioid-reddit.mdx, ml-fairness-computational.mdx) were replaced by freshly scraped versions per the plan's clean-slate policy.

## Publication Migration Details

- **Total scraped:** 41 publications
- **Publications skipped:** 0 (no missing titles or unparseable dates found)
- **Handcrafted samples replaced:** llm-opioid-reddit.mdx and ml-fairness-computational.mdx were overwritten by scraped versions (accepted per CONTEXT.md D-02 policy)
- **npm deps added:** cheerio@^1.2.0, gray-matter@^4.0.3, date-fns@^4.1.0, slug@^11.0.1, p-limit@^7.3.0, @types/slug

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Publications collection fully populated with real content; `/publications` route now shows 41 real publications
- Scraper orchestrator ready for Plans 02-02 (--people, --events flags) and 02-03 (--assets, --article flags)
- Schema relaxed for local asset paths — Plan 02-03 can land PDFs without schema changes
- Build is green; no blockers

---
*Phase: 02-content-migration*
*Completed: 2026-04-18*
