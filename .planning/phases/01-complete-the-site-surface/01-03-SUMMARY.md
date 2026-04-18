---
phase: 01-complete-the-site-surface
plan: 03
subsystem: ui
tags: [astro, mdx, pagefind, rss, animation, reveal, uw-brand, light-theme, accessibility]

# Dependency graph
requires:
  - phase: 01-complete-the-site-surface
    provides: "Plan 01 foundation — ClientRouter, persistent Lenis, `setupReveal()` with reduced-motion guard; Plan 02 — `data-pagefind-body` on all 4 detail routes + hero-stagger/reveal patterns"
provides:
  - ANI-01 + ANI-02 complete — `.animate-fade-up` hero stagger + `.reveal` card fade-in applied to all 8 index/utility pages (homepage, events, articles, people, publications, ai-for-all, get-involved, search)
  - BRD-01 complete (text-only fallback) — `University of Washington` affiliation line in Footer; RAISE + `UW` mono-chip lockup retained in Nav; `uw-w.svg.TODO` marker documents pending official SVG swap
  - BRD-02 complete — UW affiliation visible on every page (Nav + Footer render sitewide)
  - BRD-03 complete (with revision) — visual QA checkpoint ran, user rejected dark theme, light-only theme shipped, phase signed off
  - DISC-01 complete — `/rss.xml` serves RSS 2.0 with title `RAISE — Articles & Events`, atom self-link, `.id` URLs, articles + upcoming events + up to 20 past events sorted desc
  - DISC-02 complete — Pagefind UI `zero_results` override shipped; `data-pagefind-body` verified on all 4 detail routes; `dist/pagefind/` built with 16 pages indexed
  - Single-theme (light) site enforced via CSS removal + `<meta name="color-scheme" content="light">` — stable rendering across OS dark-mode users
affects: [phase-02-content-migration, phase-03-cms-launch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hero-stagger on index heroes — eyebrow (delay-0) → H1 (delay-100) → description (delay-200) → optional 4th (delay-300), all ≤600ms"
    - "Card-grid `.reveal` via IntersectionObserver (owned by Plan 01's `setupReveal()`; no per-page script)"
    - "RSS combines `getCollection('articles', !data.draft)` + `getCollection('events', data.upcoming)` + past events sliced to 20, sorted by `pubDate` desc"
    - "Pagefind UI mounted inside `astro:page-load` with child-node guard to prevent re-mount on view transition"
    - "Single-theme light enforcement — remove all `@media (prefers-color-scheme: dark)` CSS blocks AND declare `<meta name=\"color-scheme\" content=\"light\">` so native form controls/scrollbars also respect the choice"

key-files:
  created:
    - site/public/images/uw-w.svg.TODO
    - .planning/phases/01-complete-the-site-surface/01-03-SUMMARY.md
  modified:
    - site/src/layouts/Base.astro
    - site/src/styles/global.css
    - site/src/components/Nav.astro
    - site/src/components/Footer.astro
    - site/src/components/LinkedContentList.astro
    - site/src/components/ArticleCard.astro
    - site/src/components/EventCard.astro
    - site/src/components/PersonCard.astro
    - site/src/components/PublicationCard.astro
    - site/src/pages/index.astro
    - site/src/pages/404.astro
    - site/src/pages/ai-for-all.astro
    - site/src/pages/get-involved.astro
    - site/src/pages/search.astro
    - site/src/pages/rss.xml.ts
    - site/src/pages/articles/index.astro
    - site/src/pages/articles/[slug].astro
    - site/src/pages/events/index.astro
    - site/src/pages/events/[slug].astro
    - site/src/pages/people/index.astro
    - site/src/pages/publications/index.astro
    - site/src/pages/publications/[slug].astro

key-decisions:
  - "Dark mode removed entirely — single light theme for all OS/users, per BRD-03 checkpoint feedback"
  - "UW Block W shipped in text-only fallback mode — official SVG swap tracked via `uw-w.svg.TODO` marker until Marketing approval lands"
  - "Past events capped at 20 most recent in RSS (per RESEARCH Open Question 3 recommendation) to keep feed payload bounded"
  - "Pagefind `zero_results` copy is intentionally directive — names the four browse surfaces (Articles, Events, People, Publications) rather than generic \"try again\""
  - "`<meta name=\"color-scheme\" content=\"light\">` added to Base.astro alongside CSS removal — native form controls and scrollbars also render light under dark-OS"

patterns-established:
  - "Index-page animation contract: hero children get staggered `.animate-fade-up .animate-delay-{0..300}`; card grid items get `.reveal` for scroll-observed fade-in"
  - "Light-theme invariant: no `@media (prefers-color-scheme: dark)` CSS, no `dark:` Tailwind variants, no JS theme toggle — the codebase now has a single-theme contract"
  - "RSS self-reference pattern: `customData` includes `<atom:link rel=\"self\">` built via `new URL('/rss.xml', context.site).href` for validator compliance"

requirements-completed: [ANI-01, ANI-02, BRD-01, BRD-02, BRD-03, DISC-01, DISC-02]

# Metrics
duration: 8min
completed: 2026-04-18
---

# Phase 01 Plan 03: Surfaces + Branding + Discovery Summary

**All 8 index/utility pages carry hero-stagger + card-reveal animation; UW affiliation visible in Nav + Footer; RSS feed ships with atom self-link and 20 past events; Pagefind zero-results copy overridden; dark theme removed after BRD-03 user review — site now enforces a single light theme.**

## Performance

- **Duration:** ~8 min (includes dark-theme removal revision after checkpoint)
- **Started:** 2026-04-18T04:10:49Z
- **Completed:** 2026-04-18T05:01:23Z (with human-verify checkpoint in middle)
- **Tasks:** 4 (3 auto + 1 human-verify checkpoint with one revision cycle)
- **Files created:** 2 (`uw-w.svg.TODO`, SUMMARY.md)
- **Files modified:** 22 (layout + global.css + 5 components + 14 page files + rss.xml.ts)

## Accomplishments

- **ANI-01 + ANI-02 (animation sitewide):** `.animate-fade-up` hero stagger applied to the 7 non-homepage index/utility heroes (eyebrow → H1 → description at delays 0/100/200). `.reveal` applied to every card wrapper across the four index grids (events, articles, people, publications — including the past-events grid + grouped-by-role people sections).
- **BRD-01 (UW brand asset) — fallback mode:** UW Block W SVG download not successful → shipped the fallback path: text-only `University of Washington` affiliation in Footer + `uw-w.svg.TODO` marker file in `site/public/images/` documents the pending Marketing-approved asset swap.
- **BRD-02 (sitewide UW presence):** RAISE + `UW` mono-chip typographic lockup remains in Nav. `University of Washington` affiliation text renders in Footer on every route (3 hits in `dist/index.html`). CSS uses tokens only — no hex literals added.
- **BRD-03 (visual QA sign-off):** Human checkpoint ran against the built+preview site; user reviewed the full checklist and reported dark-theme rejection. Revision cycle removed dark mode entirely (see Deviations). Phase 1 now code-complete against all 13 requirements.
- **DISC-01 (RSS complete):** `/rss.xml.ts` rewritten — articles + upcoming events + 20 most-recent past events merged, `.id`-based URLs (no `.slug` references), feed title `RAISE — Articles & Events`, atom self-link via `new URL('/rss.xml', context.site).href`, `xmlns: { atom: 'http://www.w3.org/2005/Atom' }`. `dist/rss.xml` builds and contains both `RAISE` and `atom:link`.
- **DISC-02 (search polish):** Pagefind UI init now carries `translations: { zero_results: 'No matches for that search. Try different keywords, or browse Articles, Events, People, or Publications.' }`. All 4 detail routes verified to retain `data-pagefind-body` from Plan 02. `dist/pagefind/` directory produced by the integration (16 pages indexed).
- **Single-theme enforcement (Rule 1 deviation):** Removed 21 `@media (prefers-color-scheme: dark)` CSS blocks across the codebase + retired the now-dead `--color-border-dark` CSS token + added `<meta name="color-scheme" content="light">` in Base.astro. No Tailwind `dark:` variants exist. No JS theme toggle ever existed.

## Task Commits

Each task was committed atomically:

1. **Task 1: Hero stagger + card reveal across 8 index/utility pages** — `2468c54` (feat)
2. **Task 2: UW branding in Nav + Footer (text-only fallback)** — `fcffc36` (feat)
3. **Task 3: Complete RSS feed + Pagefind translations + verify data-pagefind-body** — `cf68b5b` (feat)
4. **Task 4 (revision — BRD-03 checkpoint feedback): Remove dark mode entirely** — `1a3fddb` (fix)

**Plan metadata:** pending final commit (SUMMARY.md + STATE.md + ROADMAP.md)

## Files Created/Modified

**Created (2):**
- `site/public/images/uw-w.svg.TODO` — fallback marker file (BRD-01 pending UW Marketing-approved SVG swap)
- `.planning/phases/01-complete-the-site-surface/01-03-SUMMARY.md` — this file

**Modified (22):**

*Foundation:*
- `site/src/layouts/Base.astro` — added `<meta name="color-scheme" content="light">` (dark-theme-removal revision)
- `site/src/styles/global.css` — removed `@media (prefers-color-scheme: dark)` body swap; retired unused `--color-border-dark` token

*Components (5):*
- `site/src/components/Nav.astro` — verified RAISE wordmark + UW mono-chip lockup intact; dark-mode block removed
- `site/src/components/Footer.astro` — added `<p class="footer-affiliation">University of Washington</p>` + `.footer-affiliation` CSS rule (body font 500 weight, 14px, `var(--color-base)`); dark-mode block removed; BRD-01 fallback comment at top
- `site/src/components/LinkedContentList.astro` — dark-mode block removed
- `site/src/components/ArticleCard.astro` — dark-mode block removed
- `site/src/components/EventCard.astro` — dark-mode block removed
- `site/src/components/PersonCard.astro` — dark-mode block removed
- `site/src/components/PublicationCard.astro` — dark-mode block removed

*Index & utility pages (8 for animation; all also had dark-mode blocks removed):*
- `site/src/pages/index.astro` — hero-stagger verified on homepage; `.reveal` confirmed on pillars/stats/upcoming/articles; dark-mode section removed
- `site/src/pages/events/index.astro` — hero stagger (3 children) + `.reveal` on upcoming and past cards; dark-mode removed
- `site/src/pages/articles/index.astro` — hero stagger + `.reveal` on every article card; dark-mode removed
- `site/src/pages/people/index.astro` — hero stagger + `.reveal` on every person card in every role group; dark-mode removed
- `site/src/pages/publications/index.astro` — hero stagger + `.reveal` on publication items only (not filter sidebar); dark-mode removed
- `site/src/pages/ai-for-all.astro` — hero stagger; dark-mode removed
- `site/src/pages/get-involved.astro` — hero stagger; dark-mode removed (including form input dark-mode styles)
- `site/src/pages/search.astro` — hero stagger + Pagefind UI `translations.zero_results` override; dark-mode removed (including Pagefind dark overrides)
- `site/src/pages/404.astro` — dark-mode block removed (light-only btn variants retained)

*Detail pages (dark-mode blocks removed only — no other changes from this plan):*
- `site/src/pages/articles/[slug].astro`
- `site/src/pages/events/[slug].astro`
- `site/src/pages/publications/[slug].astro`

*Discovery:*
- `site/src/pages/rss.xml.ts` — full rewrite per Task 3 spec

## Decisions Made

- **Dark mode removed entirely after BRD-03 user review** — the UI-SPEC and scaffold had validated dark-mode rendering, but on visual QA the user explicitly rejected it. The cheapest, most maintainable fix is removal (no theme toggle, no class switching) since the project was never committed to dual-theme as a product requirement. All 21 `@media (prefers-color-scheme: dark)` blocks removed; the `--color-border-dark` token retired as dead code; `<meta name="color-scheme" content="light">` added to Base.astro to prevent native form controls + scrollbars from rendering dark on OS-dark users.
- **UW Block W ships in text-only fallback mode** — the official UW SVG URL attempt did not produce a valid file for this commit; the plan's fallback branch was the designed path for this case. `site/public/images/uw-w.svg.TODO` marker documents the pending swap. Footer ships the text-only affiliation per BRD-02's fallback contract; the Nav lockup (RAISE + UW mono chip) already satisfies brand visibility.
- **RSS past-event cap at 20 items** — matches RESEARCH.md's Open Question 3 recommendation (keep feed payload bounded; most-recent subscriptions care about recency); combined-items sort is by `pubDate` desc so past events interleave correctly with articles + upcoming.
- **Pagefind mounts inside `astro:page-load` with child-node guard** — prevents double-mount on view transitions without adding the `data-astro-rerun` anti-pattern.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Remove dark mode entirely after user rejection at BRD-03 checkpoint**
- **Found during:** Task 4 (BRD-03 human-verify checkpoint)
- **Issue:** The checkpoint walked the full BRD-03 visual QA checklist with the user; user reported rejection of the dark theme ("do not like the dark theme"). The UI-SPEC checklist item "Dark mode: toggle OS dark mode. Verify ... render correctly" became irrelevant — the product decision was to not ship dark mode at all. Without this fix, any user on an OS-dark setting would see the rejected rendering on every visit.
- **Fix:** Removed all 21 `@media (prefers-color-scheme: dark)` CSS blocks from global.css + 4 card components + Nav + Footer + LinkedContentList + 8 index/utility pages + 4 detail pages + 404. Retired the now-dead `--color-border-dark` token from `global.css`. Added `<meta name="color-scheme" content="light">` to Base.astro so native form controls + scrollbars also render light on dark-OS users.
- **Files modified:** `site/src/layouts/Base.astro`, `site/src/styles/global.css`, all 5 components, all 14 page files (listed in Files Created/Modified above).
- **Verification:** `grep -rn "prefers-color-scheme" site/src` returns 0 hits. `grep -rn "color-border-dark" site/src` returns 0 hits. `grep -rn "dark:" site/src` (Tailwind variants) returns 0 hits. `cd site && npm run build` exits 0, 16 pages built, Pagefind indexed, `dist/index.html` contains `color-scheme` meta and zero `prefers-color-scheme` CSS.
- **Committed in:** `1a3fddb` (fix(01-03): remove dark mode — site always uses light theme)

---

**Total deviations:** 1 auto-fixed (Rule 1 — surfaced by checkpoint review)
**Impact on plan:** The BRD-03 checkpoint was designed to gate Phase 1 sign-off; catching the dark-theme rejection at this checkpoint is exactly its intended function. The plan's implicit assumption (dark mode was a product requirement to verify, not a decision to defend) proved incorrect on review. No scope creep — the removal is narrower than maintaining both themes.

## Issues Encountered

- **`prefers-color-scheme` removal surface was larger than expected** — 21 discrete CSS blocks across 21 files, not a single theme layer. Each edit had to preserve the surrounding `<style>` block's trailing `}` and follow the file's 2/4-space indentation convention. Resolved by surgical per-file Edit calls after enumerating all blocks via one Grep. No syntax breakage — build passed on first try post-removal.
- **Pre-existing `articles collection empty` warning persists** — benign, same as Plan 02 SUMMARY noted. Phase 2 migration populates the `articles` collection.

## User Setup Required

None — no external service configuration required for this plan.

A follow-up action for the project (tracked in `site/public/images/uw-w.svg.TODO`): obtain the UW Marketing-approved Block W SVG and swap the text-only fallback for the SVG image in Footer. This is a v2/content-team task, not a Phase 1 blocker.

## Next Phase Readiness

**Phase 1 is code-complete against all 13 requirements.**

- **ANI-01..05:** scroll-reveal + hero stagger + view transitions + reduced-motion + Lenis smooth scroll — all shipped and verified in build output + BRD-03 checkpoint walk-through
- **BRD-01..03:** UW affiliation in Nav + Footer + text-only fallback marker + checkpoint sign-off (after dark-theme revision)
- **DISC-01..02:** RSS with atom self-link + Pagefind with override copy + `data-pagefind-body` on all 4 detail routes
- **DET-01..03:** event + person + article detail pages shipped in Plan 02, visually signed off in Plan 03's checkpoint

**Phase 2 (Content Migration) readiness:**
- Detail-page templates are complete and `.reveal`-instrumented — real content slots directly into `publications/[slug]`, `events/[slug]`, `people/[slug]`, `articles/[slug]` without template changes
- `LinkedContentList` is kind-generic — person MDX `linkedPublications` + `linkedTalks` reference arrays will populate automatically
- RSS ingests from `getCollection('articles')` — Phase 2 article MDX files appear in the feed on next build with no code change
- Pagefind re-indexes on next build — Phase 2 content becomes searchable automatically

**Deferred items (carried forward):**
- UW Block W SVG swap (tracked: `site/public/images/uw-w.svg.TODO`) — pending Marketing approval / manual download
- Custom RAISE logomark SVG — v2 follow-up (current typographic lockup satisfies v1 BRD-02)

## Self-Check: PASSED

**Dark-mode removal verified:**
- `grep -rn "prefers-color-scheme" site/src` → 0 hits (was 21 before)
- `grep -rn "color-border-dark" site/src` → 0 hits (token retired)
- `grep -rn "dark:" site/src` → 0 hits (no Tailwind dark variants)
- `dist/index.html` contains `content="light"` (color-scheme meta rendered)
- `dist/index.html` contains 0 occurrences of `prefers-color-scheme` (CSS output clean)

**Build + artifacts verified:**
- `cd site && npm run build` exit 0
- `site/dist/rss.xml` exists and contains `RAISE` + `atom:link`
- `site/dist/pagefind/` exists (pagefind-entry.json + pagefind-component-ui.js present)
- `site/dist/404.html` exists
- `site/dist/index.html` contains `University of Washington` (3 hits — Footer affiliation + copyright + RSS title context)
- `site/public/images/uw-w.svg.TODO` exists (BRD-01 fallback marker)

**All 4 task commits present in `git log`:**
- `2468c54` feat(01-03): apply hero stagger and reveal to index surfaces
- `fcffc36` feat(01-03): ship UW branding in nav and footer
- `cf68b5b` feat(01-03): complete rss feed and pagefind translations
- `1a3fddb` fix(01-03): remove dark mode — site always uses light theme

---
*Phase: 01-complete-the-site-surface*
*Completed: 2026-04-18*
