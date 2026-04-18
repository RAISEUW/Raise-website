---
phase: 01-complete-the-site-surface
verified: 2026-04-18T04:30:00Z
status: human_needed
score: 13/13 must-haves verified (automated)
human_verification:
  - test: "View transition smoothness between routes"
    expected: "Navigating between pages (e.g., / → /events → /events/[slug]) produces a smooth crossfade with no full-page reload flash"
    why_human: "Requires browser session — can't verify transition animation feel programmatically"
  - test: "Hero stagger cadence on event detail page"
    expected: "banner → meta → title → speaker → actions animate-fade-up at delays 0/100/200/300/400ms; total stagger completes within 600ms"
    why_human: "Requires browser to observe timing; grep confirms classes are present but not that they render within 600ms total"
  - test: "Scroll reveal on content cards (index pages + detail pages)"
    expected: "Cards and body sections fade+translate into view as they enter the viewport at ~85% visible threshold; no content stuck invisible at page load"
    why_human: "IntersectionObserver behavior requires browser; code is wired correctly but visual effect needs confirmation"
  - test: "Reduced-motion short-circuit via DevTools emulation"
    expected: "DevTools → Rendering → 'Emulate CSS media feature prefers-reduced-motion: reduce' → hard refresh → all .reveal elements immediately visible, Lenis smooth-wheel inactive, no animations play"
    why_human: "matchMedia emulation in DevTools required; JS matchMedia check is in code but effect needs browser verification"
  - test: "Lenis smooth scroll feel on desktop"
    expected: "Page scrolls with a subtle eased deceleration (not jarring native scroll); works on /, /events, /people, /publications, /articles index pages"
    why_human: "Scroll feel is subjective and requires a real browser + input device"
  - test: "Pagefind search returns results on preview build"
    expected: "Run 'pnpm build && pnpm preview' → navigate to /search → type 'AI' or any known keyword → results appear; empty query shows zero-results copy 'No matches for that search...'"
    why_human: "Pagefind index is built at build time; search UI interaction requires browser session on built site"
  - test: "404 page renders correctly at unmatched URL"
    expected: "Navigate to /does-not-exist → 404.astro renders 'Page not found.' with italic accent em, two CTAs (Go to homepage / Search the site →); stagger animates on load"
    why_human: "Requires live server routing to verify Cloudflare Pages 404 fallback serves 404.html"
  - test: "BRD-03 visual QA — typography scale, spacing rhythm, color usage"
    expected: "All pages pass visual review: Fraunces display headings, Inter body, JetBrains Mono code; UW purple #4B2E83 accent consistent; spacing rhythm regular; no orphaned tokens"
    why_human: "Plan 03 Task 4 was explicitly marked autonomous: false — this checkpoint requires a human with browser + design eye"
  - test: "ANI-02 hero load animation on homepage"
    expected: "Homepage hero heading, subheading, and CTA stagger in on first load with Fraunces heading; total animation ≤600ms"
    why_human: "Timing verification requires browser; classes are present in markup but stagger feels need visual confirmation"
---

# Phase 01: Complete the Site Surface — Verification Report

**Phase Goal:** The site looks and feels complete — every route renders, every page is discoverable, every interaction feels refined, and the RAISE + UW brand identity is present.
**Verified:** 2026-04-18T04:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

All 13 automated checks passed. The phase goal has strong code-level evidence across all requirement areas. Human verification is required for the 9 browser-testable behaviors listed above — primarily BRD-03 visual QA (Plan 03 Task 4 was explicitly `autonomous: false`) and animation/interaction timing.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Every route renders (detail pages for events, people, articles, publications) | ✓ VERIFIED | `site/dist/` contains events/, people/, articles/, publications/ subdirs; build exits 0, 16 pages |
| 2 | Scroll reveal animations trigger on content sections | ✓ VERIFIED | `.reveal` CSS in global.css lines 129-131; `setupReveal()` in reveal.ts wired via `astro:page-load` in Base.astro line 84 |
| 3 | View transitions are active site-wide | ✓ VERIFIED | `<ClientRouter />` imported and rendered in Base.astro lines 4+54; `astro-view-transitions` meta present in dist/index.html |
| 4 | Reduced-motion users see content immediately (no stuck-invisible) | ✓ VERIFIED | Dual guard: CSS `@media (prefers-reduced-motion)` in global.css + `matchMedia` short-circuit in reveal.ts lines 2/6-9 |
| 5 | Event detail page renders speaker, abstract, location/time, recording, slides | ✓ VERIFIED | events/[slug].astro: speaker line 39, abstract lines 61+64, location line 35, recording lines 46-47, slides lines 51-52 |
| 6 | Person profile renders linked publications and linked talks | ✓ VERIFIED | people/[slug].astro: `getEntries(person.data.linkedPublications)` line 16, two `<LinkedContentList />` invocations lines 79-88 |
| 7 | Article detail renders reading time, author, date, and tags | ✓ VERIFIED | articles/[slug].astro: `readingTimeMinutes` helper lines 5-8, byline lines 48-52, tags rendered line 42 |
| 8 | All content is Pagefind-indexed (publications, events, articles, people) | ✓ VERIFIED | `data-pagefind-body` on `<article>` in all 4 detail route files; `site/dist/pagefind/` present with pagefind-entry.json |
| 9 | RSS feed is live and valid | ✓ VERIFIED | `site/dist/rss.xml` present; contains `RAISE — Articles &amp; Events`, `atom:link` self-reference, `/articles/${a.id}/` and `/events/${e.id}/` (no deprecated .slug) |
| 10 | Search page has Pagefind UI with zero-results override | ✓ VERIFIED | search.astro lines 40-41: `zero_results` translation present; `astro:page-load` listener wires UI correctly |
| 11 | RAISE + UW brand identity present in Nav and Footer | ✓ VERIFIED | Nav.astro: `logo-raise` + `logo-uw` spans; Footer.astro: `University of Washington` affiliation text; plan explicitly accepts text-only fallback when SVG unavailable |
| 12 | 404 page renders with editorial design | ✓ VERIFIED | 404.astro: `animate-fade-up` stagger on h1/body/CTAs; `Go to homepage` + `Search the site →`; `var(--color-accent)` for em; site/dist/404.html present |
| 13 | Lenis smooth scroll initializes exactly once per session | ✓ VERIFIED | Base.astro lines 71-80: `lenisInitialized` module-scoped flag prevents re-initialization on view transitions |

**Score:** 13/13 truths have code-level evidence

---

### Required Artifacts

| Artifact | Purpose | Status | Details |
|----------|---------|--------|---------|
| `site/src/scripts/reveal.ts` | Reusable IntersectionObserver with reduced-motion guard | ✓ VERIFIED | 23 lines, exports `setupReveal()`, threshold 0.15, unobserve-on-intersect |
| `site/src/content.config.ts` | People schema with `reference()`-typed cross-links | ✓ VERIFIED | Lines 62-63: `linkedPublications` + `linkedTalks` with `reference()` from `astro:content` |
| `site/src/layouts/Base.astro` | ClientRouter, astro:page-load wiring, Lenis singleton | ✓ VERIFIED | ClientRouter line 54, setupReveal wired line 84, lenisInitialized flag lines 71-80 |
| `site/src/styles/global.css` | `.reveal` / `.reveal.visible` utilities; no dark mode | ✓ VERIFIED | Lines 129-131; 0 occurrences of `prefers-color-scheme` |
| `site/src/components/LinkedContentList.astro` | Kind-generic, empty-state-aware linked content list | ✓ VERIFIED | `kind: 'publications' \| 'events'`, empty state copy, D-02 compliant `gap: 0.25rem` |
| `site/src/pages/events/[slug].astro` | Event detail with stagger + reveal + pagefind-body | ✓ VERIFIED | 5-element stagger present, `.event-abstract reveal`, `.event-body prose reveal`, `data-pagefind-body` |
| `site/src/pages/people/[slug].astro` | Person detail with getEntries() + LinkedContentList | ✓ VERIFIED | getEntries() lines 15-18, LinkedContentList invocations lines 79-88, data-pagefind-body line 26 |
| `site/src/pages/articles/[slug].astro` | Article detail with reading-time + reveal + tags | ✓ VERIFIED | readingTimeMinutes helper, byline with reading time, tags rendered, `.article-body prose reveal` |
| `site/src/pages/publications/[slug].astro` | Publication detail with reveal + pagefind-body | ✓ VERIFIED | `.pub-abstract reveal`, `.cite-block reveal`, `data-pagefind-body` |
| `site/src/pages/404.astro` | Editorial 404 with hero stagger | ✓ VERIFIED | animate-fade-up stagger, two CTAs, design-token-only styling, site/dist/404.html present |
| `site/src/pages/rss.xml.ts` | RSS 2.0 feed with atom:link self-reference | ✓ VERIFIED | `atom:link` self-ref, `.id` (not `.slug`), both articles + events, `site/dist/rss.xml` present |
| `site/src/pages/search.astro` | Pagefind search with zero_results translation | ✓ VERIFIED | translations override present, astro:page-load wiring, dist/pagefind/ present |
| `site/src/components/Nav.astro` | RAISE + UW brand marks | ✓ VERIFIED | logo-raise + logo-uw spans present |
| `site/src/components/Footer.astro` | UW affiliation (text fallback — plan-accepted) | ✓ VERIFIED | "University of Washington" affiliation text; plan 03 artifact spec explicitly: "fallback to text-only is valid" |
| `site/public/images/uw-w.svg` | UW Block W SVG (future enhancement) | ℹ️ DEFERRED | Download failed during Phase 1; text fallback is the accepted shipped state; `uw-w.svg.TODO` marker documents pending swap |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Base.astro | reveal.ts | import + astro:page-load listener | ✓ WIRED | Line 66 import, line 84 `setupReveal()` called on every navigation |
| Base.astro | astro:transitions | `<ClientRouter />` | ✓ WIRED | Line 4 import, line 54 render |
| Base.astro | Lenis | module-scoped singleton | ✓ WIRED | lenisInitialized flag prevents double-init; guard inside `initLenis()` |
| people/[slug].astro | LinkedContentList.astro | import + invocation | ✓ WIRED | Line 4 import, lines 79+84 invocations with `items={linkedPubs}` / `items={linkedTalks}` |
| people/[slug].astro | content.config.ts reference() | getEntries() | ✓ WIRED | Lines 15-18: `await getEntries(person.data.linkedPublications)` + `linkedTalks` |
| search.astro | Pagefind UI | astro:page-load init | ✓ WIRED | Line 30 listener, PagefindUI init, translations override |
| rss.xml.ts | content collections | getCollection + .id | ✓ WIRED | Lines 17+23: `/articles/${a.id}/` and `/events/${e.id}/` — no deprecated .slug |
| all 4 detail routes | Pagefind index | `data-pagefind-body` | ✓ WIRED | Confirmed on events/[slug].astro, people/[slug].astro, articles/[slug].astro, publications/[slug].astro |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| people/[slug].astro | `linkedPubs` / `linkedTalks` | `getEntries(person.data.linkedPublications)` via content.config.ts reference() | Yes — resolves from MDX frontmatter at build time | ✓ FLOWING |
| events/[slug].astro | `event.data.*` (speaker, location, recording, slides) | MDX frontmatter, getCollection() | Yes — static site, data from collection entries | ✓ FLOWING |
| articles/[slug].astro | `readingTime`, `article.data.tags` | Computed from `article.body` + frontmatter | Yes — inline computation, no empty default | ✓ FLOWING |
| rss.xml.ts | articles + events arrays | `getCollection('articles')` + `getCollection('events')` | Yes — queries both collections | ✓ FLOWING |
| search.astro | search results | Pagefind index in dist/pagefind/ | Yes — index built from real content at build time | ✓ FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build succeeds with all pages | `cd site && npm run build` | Exit 0, 16 pages built | ✓ PASS |
| RSS feed is valid XML | Check `site/dist/rss.xml` for required elements | `RAISE — Articles &amp; Events`, `atom:link` present | ✓ PASS |
| Pagefind index generated | Check `site/dist/pagefind/` | pagefind-entry.json, pagefind-ui.js present | ✓ PASS |
| 404 page generated | Check `site/dist/404.html` | File present | ✓ PASS |
| reveal.ts exports setupReveal | Check file exists and exports function | 23-line file, exports `setupReveal` | ✓ PASS |
| No dark mode CSS remaining | grep `prefers-color-scheme` in global.css | 0 matches | ✓ PASS |
| No deprecated .slug in routes | grep `.slug` in rss.xml.ts | 0 matches (uses `.id`) | ✓ PASS |
| View transition in DOM | `site/dist/index.html` contains view transitions marker | `astro-view-transitions` meta present | ✓ PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DET-01 | Plan 02 | Event detail page with speaker, abstract, location/time, recording, slides | ✓ SATISFIED | events/[slug].astro lines 35-52, 61-68 |
| DET-02 | Plan 02 | Person profile with bio, research areas, linked publications, linked talks | ✓ SATISFIED | people/[slug].astro: getEntries() + LinkedContentList.astro |
| DET-03 | Plan 02 | Article detail with full MDX, author, date, tags, reading time | ✓ SATISFIED | articles/[slug].astro: readingTimeMinutes helper, byline lines 48-52, tags line 42 |
| ANI-01 | Plans 01+03 | Scroll-triggered reveal on cards and sections | ✓ SATISFIED | reveal.ts IntersectionObserver; `.reveal` on all index card wrappers + detail bodies |
| ANI-02 | Plan 03 | Hero section load animation (stagger, Fraunces heading) | ✓ SATISFIED | index.astro + index pages: animate-fade-up + animate-delay-* classes on hero elements |
| ANI-03 | Plan 01 | Page transitions via Astro View Transitions | ✓ SATISFIED | `<ClientRouter />` in Base.astro lines 4+54 |
| ANI-04 | Plan 01 | All animations respect prefers-reduced-motion | ✓ SATISFIED | CSS @media guard in global.css + matchMedia short-circuit in reveal.ts |
| ANI-05 | Plan 01 | Lenis smooth scroll active on all pages | ✓ SATISFIED | Base.astro: lenisInitialized singleton, initLenis() on astro:page-load |
| BRD-01 | Plan 03 | UW official logo/seal in Nav and/or Footer | ✓ SATISFIED | Text-only fallback is the plan-accepted shipped state; plan 03 artifact spec: "fallback to text-only is valid"; "University of Washington" affiliation in Footer |
| BRD-02 | Plan 03 | RAISE logomark in Nav alongside UW affiliation | ✓ SATISFIED | Nav.astro: logo-raise + logo-uw spans; Footer: affiliation text |
| BRD-03 | Plan 03 | All pages pass visual QA — typography, spacing, color | ? NEEDS HUMAN | Plan 03 Task 4 explicitly `autonomous: false`; code uses correct tokens; visual judgment requires browser session |
| DISC-01 | Plan 03 | RSS feed at /rss.xml | ✓ SATISFIED | site/dist/rss.xml present, valid RSS 2.0 with atom:link |
| DISC-02 | Plan 03 | Pagefind search indexes all collections | ✓ SATISFIED | data-pagefind-body on all 4 detail routes; dist/pagefind/ generated |

**Orphaned requirements check:** All 13 Phase 1 requirements appear in Plans 01, 02, or 03. No orphans.

---

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `site/src/components/Footer.astro` line 1 | `<!-- BRD-01 fallback active — UW official asset pending; swap when uw-w.svg lands in public/images/ -->` | ℹ️ Info | Intentional — documents accepted fallback, not a code stub |
| `site/public/images/uw-w.svg.TODO` | Marker file indicating pending SVG download | ℹ️ Info | Future enhancement note; plan accepts text-only fallback as shipped state |
| `site/src/pages/people/[slug].astro` (LinkedContentList sections) | Empty-state copy renders for current sample data | ℹ️ Info | Intentional — documented in Plan 02 decisions; populates in Phase 2 migration |

No blockers. No structural stubs. Dark mode removal was an approved user-requested deviation (committed `1a3fddb fix(01-03): remove dark mode`), not an anti-pattern.

---

### Human Verification Required

#### 1. View Transition Smoothness

**Test:** Open the site in a browser (`pnpm preview` after `pnpm build`). Click Nav links: / → /events → /events/[slug] → /people → back. Watch for full-page reload flashes.
**Expected:** Soft crossfade transitions with no white flash between routes; back/forward navigation preserved.
**Why human:** Transition animation feel cannot be verified programmatically.

#### 2. Hero Stagger Cadence — Event Detail

**Test:** Navigate to any event detail page. Watch the hero section load.
**Expected:** `upcoming-banner` → `event-meta-bar` → `event-title` → `event-speaker-line` → `event-actions` animate up in sequence with 100ms spacing; total stagger completes within ~600ms.
**Why human:** CSS animation timing requires browser to observe; classes are wired correctly in code.

#### 3. Scroll Reveal on Index Pages + Detail Bodies

**Test:** Visit /publications, /events, /articles, /people. Scroll slowly from the top.
**Expected:** Card elements fade-and-translate into view as they enter the viewport; no content stuck invisible; no elements already visible before scroll.
**Why human:** IntersectionObserver threshold (0.15) and rootMargin (`0px 0px -10% 0px`) behavior requires browser.

#### 4. Reduced-Motion Short-Circuit

**Test:** DevTools → Rendering → Emulate CSS media feature: `prefers-reduced-motion: reduce` → hard refresh.
**Expected:** All `.reveal` elements are immediately visible (no fade-in animation); Lenis smooth-wheel inactive (native scroll); hero stagger classes do not animate.
**Why human:** matchMedia emulation requires DevTools; both CSS guard and JS guard are in code but effect needs browser verification.

#### 5. Lenis Smooth Scroll Feel

**Test:** On /, /events, /people — scroll with mouse wheel or trackpad.
**Expected:** Subtle eased deceleration (not native browser snap scroll); consistent across pages; no double-scroll or jitter (singleton pattern verified in code).
**Why human:** Scroll feel is inherently subjective and requires real hardware input.

#### 6. Pagefind Search Returns Results

**Test:** Run `pnpm build && pnpm preview` → navigate to /search → type "AI" or any keyword from known content (e.g., speaker names, publication topics).
**Expected:** Results appear within ~1s; each result links to the correct detail page; empty query or no-match query shows: "No matches for that search. Try different keywords, or browse Articles, Events, People, or Publications."
**Why human:** Pagefind query execution requires preview server; build verified pagefind/ exists.

#### 7. 404 Page at Unmatched URL

**Test:** With preview server running, navigate to `/does-not-exist`.
**Expected:** 404.astro renders with "Page not found." (Fraunces heading, italic `not` in accent color), two CTAs (Go to homepage / Search the site →), hero stagger animates on load.
**Why human:** Route fallback behavior requires live server (Cloudflare Pages serves 404.html for unmatched paths).

#### 8. BRD-03 Visual QA — Full Site Review

**Test:** Walk through all pages: /, /events, /events/[slug], /people, /people/[slug], /publications, /publications/[slug], /articles, /search, /ai-for-all, /get-involved, /404.
**Expected:** Consistent typography (Fraunces display, Inter body, JetBrains Mono code); UW purple accent color used consistently; spacing rhythm even; no layout breaks; no orphaned token references.
**Why human:** Plan 03 Task 4 was explicitly `autonomous: false` — this is a designed human checkpoint.

#### 9. ANI-02 Homepage Hero Load Animation

**Test:** Hard-refresh the homepage (/).
**Expected:** Hero heading (Fraunces) and CTA stagger in with fade-up animation; total animation completes within 600ms; feels intentional, not janky.
**Why human:** Stagger timing requires visual assessment in browser.

---

### Gaps Summary

No code-level gaps. All 13 requirements have verified implementation evidence:
- All artifacts exist, are substantive (not stubs), and are wired to their consumers
- Build succeeds with 16 pages; Pagefind index, RSS feed, and 404 page all generated
- No dark mode regressions (21 `@media (prefers-color-scheme: dark)` blocks removed per user approval)
- BRD-01 is satisfied by the text-only fallback — Plan 03 artifact spec explicitly states "fallback to text-only is valid"; `uw-w.svg.TODO` marker notes the SVG as a future enhancement, not a gap
- BRD-03 is the sole item that cannot be verified programmatically — the plan required a human checkpoint at this gate

The `human_needed` status reflects the explicit `autonomous: false` gate in Plan 03 Task 4 (BRD-03 visual QA) and the inherently browser-dependent nature of animation/interaction verification. All automated evidence points to full phase goal achievement.

---

_Verified: 2026-04-18T04:30:00Z_
_Verifier: Claude (gsd-verifier)_
