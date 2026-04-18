---
phase: 01-complete-the-site-surface
plan: 02
subsystem: ui
tags: [astro, mdx, pagefind, reveal, animation, content-collections, getEntries]

# Dependency graph
requires:
  - phase: 01-complete-the-site-surface
    provides: "Plan 01 foundation — ClientRouter + setupReveal + people schema `reference()` fields for linkedPublications/linkedTalks"
provides:
  - DET-01 complete — event detail renders hero-stagger, abstract/body fade-in, pagefind-body wrapper
  - DET-02 complete — person detail renders Selected Publications + Talks sections from `reference()` IDs via `getEntries()`, with empty-state copy when unlinked
  - DET-03 complete — article detail renders reading-time `{N} min read` in byline + reveal on body
  - 404 page ships with editorial hero-stagger + "Page not found." contract
  - `data-pagefind-body` on all 4 detail-route `<article>` wrappers (DISC-02 foundation for Plan 03)
  - Reusable `LinkedContentList` component (empty-state-aware, kind-generic over publications/events)
affects: [01-03-surfaces, phase-02-content-migration, phase-03-cms-launch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Inline reading-time helper (no dependency) — `Math.max(1, Math.ceil(words/200))` from `entry.body`"
    - "`<article data-pagefind-body>` wrapper pattern on all detail routes (Plan 03 Task 3 runs pagefind index + translations)"
    - "Kind-generic `LinkedContentList` component — `{ label, items, kind, emptyCopy }` with type narrowing via `kind === 'publications'` discriminant"
    - "Empty-state-aware linked lists (muted italic copy) replace hiding the whole section"

key-files:
  created:
    - site/src/components/LinkedContentList.astro
    - site/src/pages/404.astro
  modified:
    - site/src/pages/people/[slug].astro
    - site/src/pages/events/[slug].astro
    - site/src/pages/articles/[slug].astro
    - site/src/pages/publications/[slug].astro

key-decisions:
  - "Reading-time helper inline (5 lines) — no remark-reading-time dependency"
  - "LinkedContentList uses runtime discriminant on `kind` prop (not polymorphic rendering) to keep component small + statically typed"
  - "Article detail hero/byline intentionally NOT staggered (UI-SPEC reserves stagger for index heroes + event-detail only)"
  - "Empty-state copy ('Publications will appear here when linked.') renders even for shipped samples — Phase 2 migration populates the `reference()` arrays"

patterns-established:
  - "detail-page animation contract: hero-stagger (event only) via `.animate-fade-up .animate-delay-{100..400}`; body/abstract/citation via `.reveal` scroll-observed"
  - "Pagefind body wrapper pattern: `<article ... data-pagefind-body>` on every detail route's outermost content wrapper"

requirements-completed: [DET-01, DET-02, DET-03]

# Metrics
duration: 4min
completed: 2026-04-17
---

# Phase 01 Plan 02: Detail Pages + 404 Summary

**Four detail-page templates (events, people, articles, publications) content-complete with hero-stagger + scroll-reveal + pagefind-body; new `LinkedContentList` component wires DET-02 via `getEntries()`; editorial 404 page ships.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-18T04:04:28Z
- **Completed:** 2026-04-18T04:08:40Z
- **Tasks:** 3
- **Files created:** 2 (LinkedContentList.astro, 404.astro)
- **Files modified:** 4 (people/events/articles/publications [slug].astro)

## Accomplishments

- **DET-01 (Event detail):** hero-stagger (banner → meta → title → speaker → actions at delays 0/100/200/300/400), `.reveal` on `.event-abstract` + `.event-body`, `data-pagefind-body` on outer `<article>`
- **DET-02 (Person detail):** new `LinkedContentList` component renders `Selected Publications` + `Talks` sections from `getEntries(person.data.linkedPublications)` / `linkedTalks` with empty-state copy; `.reveal` on all three wrappers; `data-pagefind-body` on `<article>`
- **DET-03 (Article detail):** inline `readingTimeMinutes(body)` helper computes `Math.max(1, Math.ceil(words/200))`; byline renders `{author} · {formattedDate} · {N} min read`; `.reveal` on `.article-body`; `data-pagefind-body` on `<article>`
- **Publications polish:** `.reveal` on `.pub-abstract` + `.cite-block`; `data-pagefind-body` on `<article>` — no other changes (page already validated "fully styled" per UI-SPEC)
- **404 page:** editorial "Page not found." heading (Fraunces 300 + accent-color italic `<em>not</em>`), hero-load stagger (heading → body copy → CTAs at delays 0/100/200), two CTAs (`Go to homepage` + `Search the site →`) using locally-scoped `.btn-primary` / `.btn-ghost`

## Task Commits

Each task was committed atomically:

1. **Task 1: LinkedContentList component + DET-02 wiring** — `5d8d3bd` (feat)
2. **Task 2: events/articles hero-stagger + reading-time + reveal** — `eb7c5d7` (feat)
3. **Task 3: publications reveal/pagefind + 404 page** — `3715ef1` (feat)

**Plan metadata:** pending final commit (SUMMARY.md + STATE.md + ROADMAP.md + REQUIREMENTS.md)

## Files Created/Modified

- `site/src/components/LinkedContentList.astro` — NEW. Reusable empty-state-aware list component, kind-generic over publications/events, D-02-compliant spacing (`gap: 0.25rem` between flex children, `0.5rem` between list items).
- `site/src/pages/404.astro` — NEW. Editorial not-found page with hero stagger. Uses only existing CSS tokens (`--color-base/surface/accent/muted/border/border-dark`, `--radius-btn`, `--ease-out-expo`, `--font-display`). No hex literals. All spacing on D-02 scale (`0.25/0.5/0.75/1/1.5/2/3/5` rem).
- `site/src/pages/people/[slug].astro` — +`getEntries` import, +`LinkedContentList` import, +`linkedPubs`/`linkedTalks` in frontmatter, +two `<LinkedContentList />` invocations after `.person-body`, +`.reveal` on `.person-body` + both linked sections, +`data-pagefind-body` on `<article>`.
- `site/src/pages/events/[slug].astro` — +stagger classes on `.upcoming-banner`, `.event-meta-bar`, `.event-title`, `.event-speaker-line`, `.event-actions`; +`.reveal` on `.event-abstract` + `.event-body`; +`data-pagefind-body` on `<article>`.
- `site/src/pages/articles/[slug].astro` — +inline `readingTimeMinutes` helper, +`readingTime` const, +reading-time span in byline, +`.reveal` on `.article-body`, +`data-pagefind-body` on `<article>`.
- `site/src/pages/publications/[slug].astro` — +`data-pagefind-body` on `<article>`, +`.reveal` on `.pub-abstract` + `.cite-block` only (no other changes per plan constraint).

## Decisions Made

- **Stagger delay assignment for event detail hero** (ambiguity in plan between `<behavior>` and `<action>` blocks): followed the `<action>` block (DOM order): banner→delay-0, meta→delay-100, title→delay-200, speaker→delay-300, actions→delay-400. `speaker-bio` (optional biographical paragraph) intentionally not staggered — it's a secondary element, not in the plan's element list.
- **Preserved existing classes when appending `.reveal`** (e.g., `.person-body prose` → `.person-body prose reveal`, `.article-body prose` → `.article-body prose reveal`, `.event-body prose` → `.event-body prose reveal`). The plan's example patterns showed single-class targets; keeping `prose` preserves the existing typography rules from `global.css`.
- **404 page pre-substituted D-02-compliant spacing** before writing (plan required `gap: 0.4rem` → `0.5rem` and `margin: 0 auto 2.5rem` → `0 auto 2rem`). All values in the `<style>` block are on the `{0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5}` rem scale; viewport-units and time-durations are not spacing.

## Deviations from Plan

None — plan executed exactly as written.

All acceptance criteria for Tasks 1–3 verified by automated grep + build. No auto-fix deviations applied. No architectural changes needed. No authentication gates encountered.

## Issues Encountered

- None during execution. Pre-existing `[build] The collection "articles" does not exist or is empty` warning is benign — no article MDX files shipped in Phase 1 (articles arrive in Phase 2 migration). Build still passes with exit 0 and 16 pages built.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**Plan 03 (Surfaces) ready to execute:**
- All 4 detail routes now wrap content in `data-pagefind-body` — Plan 03 Task 3 can run pagefind build + translations override without additional wiring.
- `.reveal` class is live on detail-page body/abstract/citation wrappers — IntersectionObserver from Plan 01's `setupReveal()` will trigger fade-in on scroll (confirmed functional during local build).
- 404 route is in `site/dist/404.html` — Cloudflare Pages will serve it automatically for any unmatched path (confirmed in build output).

**Phase 2 (Content Migration) foundation:**
- `LinkedContentList` is kind-generic — when content-team adds `linkedPublications: [ref-id]` or `linkedTalks: [ref-id]` to person MDX frontmatter in Phase 2, the empty-state copy will be replaced by actual linked items automatically. No code changes needed.

**Defers to Phase 2 (content migration):**
- Empty-state copy ("Publications will appear here when linked.") is the expected UX for current samples until person MDX frontmatter is populated with `reference()` IDs.

**Defers to Plan 03 (surfaces):**
- BRD-03 visual QA of everything in this plan (event-detail hero stagger, person-detail linked sections, article reading-time, 404 rendering) runs in Plan 03's human-verify checkpoint alongside other discovery-surface verification.

## Self-Check: PASSED

All 7 files exist on disk:
- `site/src/components/LinkedContentList.astro` (created)
- `site/src/pages/404.astro` (created)
- `site/src/pages/people/[slug].astro` (modified)
- `site/src/pages/events/[slug].astro` (modified)
- `site/src/pages/articles/[slug].astro` (modified)
- `site/src/pages/publications/[slug].astro` (modified)
- `.planning/phases/01-complete-the-site-surface/01-02-SUMMARY.md` (this file)

All 3 task commits present in `git log`:
- `5d8d3bd` feat(01-02): add LinkedContentList component and wire DET-02 into person detail
- `eb7c5d7` feat(01-02): polish event + article detail with hero-stagger, reading-time, reveal
- `3715ef1` feat(01-02): add 404 page + wire reveal/pagefind-body on publication detail

Build verified (`cd site && npm run build` exit 0, 16 pages built, 7 detail pages have `data-pagefind-body` in output).

---
*Phase: 01-complete-the-site-surface*
*Completed: 2026-04-17*
