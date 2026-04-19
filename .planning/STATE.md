---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_plan: 3
status: verifying
last_updated: "2026-04-19T23:14:28.973Z"
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 6
  completed_plans: 7
  percent: 100
---

# STATE: RAISE Website Redesign

**Last Updated:** 2026-04-18

---

## Project Reference

**Project:** RAISE Website Redesign
**Core Value:** A beautiful, fast, searchable home for RAISE's research, people, events, and articles — that anyone on the team can keep up-to-date.
**Stack:** Astro 6 + Tailwind v4 + MDX + Pagefind + Decap CMS + Lenis + Motion
**Working directory:** `/Users/mayuri/Projects/RAISE/site/`
**Mode:** yolo
**Granularity:** coarse

**Current Focus:** Phase 02 — content-migration

---

## Current Position

Phase: 02 (content-migration) — EXECUTING
Plan: 3 of 3
**Phase:** 2
**Current Plan:** 3
**Total Plans in Phase:** 3
**Status:** Phase complete — ready for verification
**Progress:** [██████████] 100%

### Phase Breakdown

```
Phase 1: Complete the Site Surface     [██████████] 100% (3/3 plans complete — code complete, ready for verification)
Phase 2: Content Migration             [██████░░░░]  67% (2/3 plans complete — publications + people + events migrated; assets + article pending)
Phase 3: CMS & Production Launch       [░░░░░░░░░░] Not started
```

---

## Performance Metrics

| Metric | Current | Target |
|--------|---------|--------|
| v1 requirements mapped | 26/26 | 26/26 ✓ |
| Phases complete | 0/3 (Phase 1 code-complete, pending verification) | 3/3 |
| Plans complete | 3/3 (Phase 1) | 3/3 |
| Lighthouse (homepage) | TBD | ≥95 on all four categories |
| Publications migrated | 41/41 | ~40/~40 ✓ |
| Events migrated | 29/29 | 50+/50+ (live site has 41 event-like rows; 29 with parseable dates) |
| People migrated | 19/19 | 16/16 ✓ (live site has 19, up from REQUIREMENTS estimate of 16) |
| Phase 02-content-migration P01 | 45 | 3 tasks | 53 files |
| Phase 02-content-migration P02 | 16 min | 2 tasks | 51 files |
| Phase 03-cms-production-launch P01 | 8min | 2 tasks | 2 files |

### Execution History

| Plan | Duration | Tasks | Files | Commits |
|------|----------|-------|-------|---------|
| Phase 01-complete-the-site-surface P01 | 2min | 3 | 5 | 3adad45, 8d17532, 07f1e7b |
| Phase 01-complete-the-site-surface P02 | 4min | 3 | 6 | 5d8d3bd, eb7c5d7, 3715ef1 |
| Phase 01-complete-the-site-surface P03 | 8min | 4 | 22 | 2468c54, fcffc36, cf68b5b, 1a3fddb |

---

## Accumulated Context

### Decisions

Sourced from PROJECT.md key decisions:

| Decision | Rationale | Status |
|----------|-----------|--------|
| Astro 6 | Zero-JS, MDX, Content Collections, View Transitions | In use |
| Tailwind v4 with `@theme {}` | Fastest iteration, design tokens as CSS vars | In use |
| Cloudflare Pages | Free, unlimited bandwidth, preview URLs per PR | Pending deploy |
| Decap CMS | Free, git-based, commits MDX to repo | Pending setup |
| Pagefind | Zero-config static search at build time | In use |
| `[slug].astro` routing (not spread routes) | Avoids conflict with index pages | Validated |
| `.id` not `.slug` for collection entries | Content Layer API breaking change in Astro 6 | Validated |
| `import tailwindcss from '@tailwindcss/vite'` (default export) | Named export errors in Tailwind v4 | Validated |

- [Phase 01-complete-the-site-surface]: Use reference() for people.linkedPublications/linkedTalks (not string arrays) — build-time validation + Decap relation-widget compatibility
- [Phase 01-complete-the-site-surface]: Module-scoped lenisInitialized flag keeps Lenis singleton across astro:page-load firings
- [Phase 01-complete-the-site-surface]: Keyboard-shortcut listener bound once at module load (NOT inside astro:page-load) to avoid listener accumulation
- [Phase 01-complete-the-site-surface]: Reading-time computed inline (Math.ceil(words/200), 1-min floor) — avoided remark-reading-time dependency
- [Phase 01-complete-the-site-surface]: LinkedContentList uses runtime discriminant on 'kind' prop — kind-generic + empty-state-aware; Phase 2 content will populate empty arrays automatically
- [Phase 01-complete-the-site-surface]: Hero-stagger reserved for index heroes + event-detail hero only (article title is focal anchor, gets no stagger per UI-SPEC)
- [Phase 01-complete-the-site-surface]: Dark mode removed entirely after BRD-03 user review — site enforces a single light theme via CSS removal + color-scheme meta (no theme toggle; 21 @media blocks removed + --color-border-dark token retired)
- [Phase 01-complete-the-site-surface]: UW Block W shipped in text-only fallback mode — uw-w.svg.TODO marker tracks pending Marketing-approved SVG swap
- [Phase 01-complete-the-site-surface]: RSS past events capped at 20 items sorted by pubDate desc; atom self-link via new URL('/rss.xml', context.site)
- [Phase 02-content-migration]: arXiv /abs/ URLs converted to /pdf/ and stored as pdf field (Plan 02-03 will download)
- [Phase 02-content-migration]: Clean-slate scraper policy: rm -rf publications dir on each run, use git diff for regression visibility
- [Phase 02-content-migration]: People parser walks .et_pb_row in document order (not .et_pb_section): live raise.uw.edu wraps all 19 people in a single section with role headings in sibling rows
- [Phase 02-content-migration]: Handcrafted-preservation PRESERVE map baked into people parser: bill-howe, chirag-shah, tanu-mitra keep department Information School + their 3-element researchAreas arrays after scraper clean-slate
- [Phase 02-content-migration]: Events title extraction via .et_pb_text_inner (first one in row) not img[title]: image-title attributes on raise.uw.edu are junk (New Template, VB2, speaker-only names)
- [Phase 02-content-migration]: Events speaker extraction is opportunistic: Unicode-aware name regex on first sentence of speaker bio; falls back to 'Guest Speaker' default when bio starts with a pronoun
- [Phase 02-content-migration]: Twitter handle dedup post-pass: source-site markup has @chirag_shah leaked into Tanu Mitra + Emily Bender blocks; parser drops duplicates, keeps first by order
- [Phase 03-cms-production-launch]: Dropped events.image from Decap config.yml — field not in content.config.ts schema (plan interfaces section was stale); schema is source of truth
- [Phase 03-cms-production-launch]: backend.repo in Decap config is 'mayuri-tech/RAISE' placeholder — must be updated in Plan 03-03 when the repo is pushed to its final GitHub location
- [Phase 03-cms-production-launch]: Added widget: markdown body field to each Decap collection — MDX content body is implicit in Zod schema but Decap needs an explicit widget so editors can write prose

### Active Todos

None yet — will accumulate as plans execute.

### Blockers

None. Scaffold is complete and building locally.

### Known Risks

- **UW brand asset access:** BRD-01/BRD-02 depend on obtaining UW official logos and a RAISE logomark. If assets are delayed, Phase 1 branding portion can staging with placeholder treatments.
- **DNS cutover:** DEPL-02 targets a Cloudflare Pages URL (staging). Final raise.uw.edu DNS change requires UW IT coordination and is out of scope for v1 launch verification.
- **Content scraping fidelity:** MIG-01/02/03 rely on accurate extraction from the existing WordPress site. Ambiguous metadata (missing dates, unclear topics) may require manual cleanup.

---

## Session Continuity

### Last Session

- Executed Plan 01-03 (surfaces + branding + discovery): hero-stagger on all 8 index/utility pages, `.reveal` on the 4 index card grids, UW branding in Nav + Footer (text-only fallback), RSS feed with atom self-link + 20 past events, Pagefind zero-results copy override, `data-pagefind-body` verified on all 4 detail routes
- BRD-03 human-verify checkpoint ran; user rejected dark theme → dark mode removed entirely (21 @media blocks, `--color-border-dark` token, and addition of `<meta name="color-scheme" content="light">`); revision committed as `1a3fddb`
- 4 atomic commits: `2468c54`, `fcffc36`, `cf68b5b`, `1a3fddb`
- `cd site && npm run build` passes (exit 0); 16 pages built; `dist/rss.xml`, `dist/pagefind/`, `dist/404.html` all present

### Stopped At

Completed 01-03-PLAN.md (Phase 1 code-complete — all 13 requirements ANI/BRD/DISC/DET shipped; awaiting formal verifier pass)

### Next Session Start

Recommended next command:

```
/gsd:verify-phase 01
```

Or, when ready to begin content migration:

```
/gsd:plan-phase 02
```

### Files of Record

- `/Users/mayuri/Projects/RAISE/.planning/PROJECT.md` — project charter
- `/Users/mayuri/Projects/RAISE/.planning/REQUIREMENTS.md` — v1 requirements with traceability
- `/Users/mayuri/Projects/RAISE/.planning/ROADMAP.md` — phase structure with success criteria
- `/Users/mayuri/Projects/RAISE/.planning/STATE.md` — this file
- `/Users/mayuri/Projects/RAISE/.planning/config.json` — GSD settings

---

*State initialized: 2026-04-17*
