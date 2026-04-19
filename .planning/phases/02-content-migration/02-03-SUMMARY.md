---
plan: 02-03
phase: 02-content-migration
status: complete
wave: 3
requirements: [MIG-04, MIG-05]
self_check: PASSED
---

# Plan 02-03: Assets, Links, Sample Article — Summary

**Executed:** 2026-04-18
**Duration:** ~10 min
**Tasks:** 2/2 complete

## What Was Built

### Task 1: Asset download (MIG-05)

Created `site/scripts/lib/assets.mjs` (streaming downloader with `Readable.fromWeb` + `pipeline`, `User-Agent` header, `extFromUrl` helper) and `site/scripts/parsers/assets.mjs` (re-scrapes raise.uw.edu/people/ to build name→photoURL map, then downloads with `pLimit(5)` concurrency cap).

**Results:**
- **Photos:** 19 ok, 0 failed → `site/public/images/people/` ({slug}.jpg for each team member)
- **PDFs:** 9 ok, 0 failed, 32 skipped (external-only per MIG-05 narrowed invariant)
  - 9 fetchable PDFs: ~2 direct .pdf URLs + ~7 arXiv-converted
  - 32 publications kept external-only (DOI records, ACM/IEEE/Nature landing pages, paywalled — accepted per RESEARCH.md Pitfall #4 and must_haves.truths)
- MDX frontmatter rewritten to local paths on success (`photo: /images/people/{slug}.jpg`, `pdf: /pdfs/{slug}.pdf`)
- Zero orphan publications — every entry has either `pdf:` (local or external) or `doi:`

### Task 2: Cross-links + sample article (MIG-04)

Created `site/scripts/parsers/links.mjs` (case-insensitive name-match between person.name and publication.authors / event.speaker). Wired `--assets` and `--links` flags into `site/scripts/scrape.mjs`.

**Link results:**
- **pubLinks:** 18 publication links across 6 people
- **talkLinks:** 0 (no migrated events have a speaker whose name matches a current RAISE team member exactly — events are external speaker talks)

**Sample article (MIG-04):**
- `site/src/content/articles/welcome-to-raise.mdx` — "Welcome to the New RAISE Website"
- Tags: Announcements, Responsible AI
- Renders at `/articles/welcome-to-raise/`

## Acceptance Criteria Verification

| Check | Result |
|-------|--------|
| `ls site/public/images/people/ \| wc -l` ≥ 15 | 19 ✓ |
| `ls site/public/pdfs/*.pdf \| wc -l` ≥ 5 | 9 ✓ |
| `welcome-to-raise.mdx` exists | ✓ |
| `dist/articles/welcome-to-raise/` built | ✓ |
| ≥ 2 people with linkedPublications | 6 ✓ |
| Zero orphan publications | 0 ✓ |
| `npm run build` exits 0 | 99 pages ✓ |

## Key Files Created

- `site/scripts/lib/assets.mjs` — streaming asset downloader
- `site/scripts/parsers/assets.mjs` — headshot + PDF download pass
- `site/scripts/parsers/links.mjs` — linkedPublications/linkedTalks name-match wiring
- `site/src/content/articles/welcome-to-raise.mdx` — inaugural article
- `site/public/images/people/` — 19 headshots
- `site/public/pdfs/` — 9 publication PDFs

## Commits

- `12cc897` — feat(02-03): implement asset downloader + download 19 headshots and 9 PDFs
- `c1d9dc0` — feat(02-03): wire linkedPublications/linkedTalks + author welcome-to-raise article

## End-State Counts

| Collection | Count |
|------------|-------|
| Publications | 41 MDX |
| Events | 29 MDX |
| People | 19 MDX |
| Articles | 1 MDX |

## Notes

- `department` populated for 3/19 people (leadership only — no clean structured source for affiliates/staff; deferred to Phase 3 CMS)
- `talkLinks: 0` is correct — RAISE events are external speaker talks, not team member talks
- ~34/43 publications stay external-only by design; this is the accepted MIG-05 reality per RESEARCH.md
- `pnpm scrape` (no args) runs all 5 parsers (publications, people, events, assets, links) end-to-end
