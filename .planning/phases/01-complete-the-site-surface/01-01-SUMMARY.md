---
phase: 01-complete-the-site-surface
plan: 01
subsystem: ui
tags: [astro, view-transitions, intersection-observer, lenis, content-collections, zod, reference]

# Dependency graph
requires:
  - phase: 00-scaffold
    provides: Astro 6 project with content collections, Lenis, global.css tokens, index pages using .reveal class on scoped style
provides:
  - "setupReveal() from site/src/scripts/reveal.ts — reusable IntersectionObserver with reduced-motion short-circuit"
  - "<ClientRouter /> in <head> — Astro 6 View Transitions active site-wide"
  - "astro:page-load listener re-running setupReveal on every navigation (ANI-01 + ANI-04 wiring)"
  - "Module-scoped Lenis init (lenisInitialized flag) — exactly one smooth-scroll instance per session"
  - "linkedPublications + linkedTalks fields on people schema using reference() — Phase 2 can populate"
  - ".reveal + .reveal.visible utility in global.css — site-wide scroll reveal available on every page"
affects: [01-02 detail pages, 01-03 surfaces, 02-content-migration (populates linked arrays), 03-cms-production]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "astro:page-load listener pattern: module-scoped init flag for singletons, per-navigation re-run for observers"
    - "Content Layer reference() for cross-collection links instead of string arrays"
    - "Reduced-motion short-circuit: add .visible synchronously and return before observer construction"

key-files:
  created:
    - site/src/scripts/reveal.ts
    - .planning/phases/01-complete-the-site-surface/01-01-SUMMARY.md
  modified:
    - site/src/content.config.ts
    - site/src/styles/global.css
    - site/src/layouts/Base.astro
    - site/src/pages/index.astro

key-decisions:
  - "Used reference('publications') / reference('events') for people.linkedPublications and people.linkedTalks instead of z.array(z.string()) — build-time validation + Decap CMS relation-widget compatibility"
  - "Lenis init moved behind module-scoped lenisInitialized flag so astro:page-load can re-fire without double-booting Lenis"
  - "Kept keyboard-shortcut listener at module load (not inside astro:page-load) to avoid listener accumulation on repeated navigations"
  - "Did NOT add transition:persist to Nav/Footer — they are stateless; defer to a follow-up if BRD-03 QA surfaces scroll-position flashes"

patterns-established:
  - "Per-navigation setup: initialize-once singletons via module flag, re-observable DOM effects inside astro:page-load"
  - "Reduced-motion guard in both global.css (@media) and reveal.ts (matchMedia) — belt and suspenders so users never see stuck-invisible content"
  - ".reveal utility lives in global.css; every page just adds the class and setupReveal handles the rest on page-load"

requirements-completed: [ANI-01, ANI-03, ANI-04, ANI-05]

# Metrics
duration: 2min
completed: 2026-04-17
---

# Phase 01 Plan 01: Animation & Transition Foundation Summary

**Astro 6 View Transitions via `<ClientRouter />`, shared `setupReveal()` IntersectionObserver with reduced-motion short-circuit, and `people` schema extended with `reference()`-typed cross-links — all three Phase 1 animation primitives wired once in `Base.astro`.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-18T03:57:04Z
- **Completed:** 2026-04-18T03:59:12Z
- **Tasks:** 3
- **Files modified:** 4 (+ 1 new)

## Accomplishments

- **ANI-03 wired:** `<ClientRouter />` from `astro:transitions` rendered in `<head>` → smooth soft transitions between routes (no full page reload). Build emits the `astro-view-transitions` meta tag in `dist/index.html`, confirming it is active.
- **ANI-01 wired:** `setupReveal()` in `site/src/scripts/reveal.ts` uses `IntersectionObserver` with `threshold: 0.15` and `rootMargin: '0px 0px -10% 0px'`; calls `observer.unobserve(e.target)` on intersect so memory doesn't accumulate across view transitions.
- **ANI-04 wired:** Both a CSS-level `@media (prefers-reduced-motion)` guard AND a `matchMedia` short-circuit inside `setupReveal()` ensure reduced-motion users see content immediately (no stuck-invisible elements, no Lenis hijack).
- **ANI-05 preserved:** Lenis remains behind the `prefersReducedMotion` guard and now initializes exactly once per session via a module-scoped `lenisInitialized` flag, even across many view transitions.
- **DET-02 foundation:** `people` schema in `site/src/content.config.ts` gained `linkedPublications: z.array(reference('publications')).default([])` and `linkedTalks: z.array(reference('events')).default([])`. The 3 shipped sample people MDX files still validate via the default empty arrays.
- **`.slug` → `.id` cleanup (partial):** Fixed two `.slug` references in `site/src/pages/index.astro` (lines 104, 126). Two remaining `.slug` references in `site/src/pages/rss.xml.ts` are deferred to Plan 03 Task 3 (documented in plan's `<output>` block).

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend people schema with reference()-based linked content fields** — `3adad45` (feat)
2. **Task 2: Create src/scripts/reveal.ts + lift .reveal CSS to global.css + strip inline observer from index.astro** — `8d17532` (feat)
3. **Task 3: Wire ClientRouter + astro:page-load listener + persistent Lenis in Base.astro** — `07f1e7b` (feat)

## Files Created/Modified

- `site/src/scripts/reveal.ts` (NEW) — exports `setupReveal()`; reduced-motion short-circuit + single IntersectionObserver with unobserve-on-intersect.
- `site/src/content.config.ts` (modified) — added `reference` to imports; added `linkedPublications` and `linkedTalks` fields to the `people` schema.
- `site/src/styles/global.css` (modified) — appended one CSS block (`.reveal` + `.reveal.visible`, 269 chars added, well under the 400-char acceptance cap). No tokens, font weights, spacing, or colors touched (D-01/D-02 preserved).
- `site/src/layouts/Base.astro` (modified) — import + render `<ClientRouter />`; replace inline Lenis init with `astro:page-load`-bound handler that calls `initLenis()` and `setupReveal()`; keep keyboard-shortcut listener bound once at module load.
- `site/src/pages/index.astro` (modified) — deleted the inline IntersectionObserver `<script>` block; changed `slug={event.slug}` and `slug={article.slug}` to `.id`.

## Decisions Made

- **`reference()` over string arrays for linked content.** Matches the RESEARCH §DET-02 recommendation. `reference()` gives build-time validation against actual collection IDs and is directly compatible with Decap CMS's relation widget in Phase 3. Using `z.array(z.string())` would have deferred both validation and CMS integration.
- **Module-scoped `lenisInitialized` flag.** Without it, every `astro:page-load` would spin up another Lenis instance, causing competing `raf` loops and jittery scroll. A boolean at module scope (not component scope) is the minimum-ceremony singleton.
- **Keep the `/` keyboard-shortcut listener at module load — NOT inside `astro:page-load`.** Per the RESEARCH notes and the plan's explicit guidance, binding a `document`-level listener once is correct; re-binding on every navigation would accumulate one listener per visit.
- **Did not add `transition:persist` to Nav/Footer.** They are stateless right now; re-rendering them is free. If BRD-03 QA in Plan 03 surfaces a scroll-position flash, a targeted follow-up can add `transition:persist` with a named `transition:name` — deliberately out of scope here.

## Deviations from Plan

None — plan executed exactly as written.

The only nuance: the `site/` directory was untracked at the start of this plan, so each file I modified was reported by git as a new create rather than a delta. Semantically the changes are still surgical edits (as visible in the per-task action blocks above). No behavior change from what the plan specified.

## Issues Encountered

None. Both `cd site && npm run build` runs (after Task 1 and after Task 3) returned exit 0. The "articles collection is empty" warning printed during build is pre-existing (the `src/content/articles/` directory has no MDX files yet) and not caused by this plan — it will resolve as Plan 02 (content migration) populates that collection.

## User Setup Required

None — no external service configuration required for this plan. Behaviorally verifiable in the browser via `cd site && npm run dev`:
- Scroll home page slowly; `.reveal` elements fade up.
- Click Nav → `/events`; soft view transition fires (no full reload).
- DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, hard-refresh; content is immediately visible, Lenis smooth-wheel inactive.

## Next Phase Readiness

**Ready for Plan 02 (detail pages).** Downstream plans can now:

- Add `class="reveal"` to any element on any page — `setupReveal()` will observe it on `astro:page-load` and fade it in.
- Rely on `<ClientRouter />` being active for all soft navigations.
- Populate `linkedPublications` and `linkedTalks` in people MDX frontmatter; `getEntries()` will resolve them at build time.
- Assume Lenis runs once per session without re-instantiation concerns.

**Carry-over to Plan 03:** `site/src/pages/rss.xml.ts` still contains two `.slug` references (lines 15 and 24). The plan's `<output>` block explicitly defers these to Plan 03 Task 3 — they are not a regression, just scope-boundary.

---
*Phase: 01-complete-the-site-surface*
*Completed: 2026-04-17*

## Self-Check: PASSED

**Files claimed → existence verified:**
- `site/src/scripts/reveal.ts` — FOUND
- `site/src/content.config.ts` — FOUND
- `site/src/layouts/Base.astro` — FOUND
- `site/src/pages/index.astro` — FOUND
- `site/src/styles/global.css` — FOUND
- `.planning/phases/01-complete-the-site-surface/01-01-SUMMARY.md` — FOUND

**Commits claimed → presence in git log verified:**
- `3adad45` (Task 1) — FOUND
- `8d17532` (Task 2) — FOUND
- `07f1e7b` (Task 3) — FOUND

**Build output:**
- `site/dist/index.html` — FOUND (confirms `<ClientRouter />` was emitted; `cd site && npm run build` exit code 0 on final run)
