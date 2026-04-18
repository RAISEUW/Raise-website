# Phase 1: Complete the Site Surface — Research

**Researched:** 2026-04-17
**Domain:** Astro 6 static site polish (View Transitions, scroll reveal, Lenis, Pagefind UI, `@astrojs/rss`, UW brand integration)
**Confidence:** HIGH

## Summary

Phase 1 is a **polish pass on an already-built Astro 6 scaffold** — not a greenfield build. The stack, design tokens, typography, spacing, colors, routes, content schemas, card components, and even the Pagefind + Lenis + RSS wiring are already shipped. CONTEXT.md (D-01 four-weight typography, D-02 extended spacing scale) and the UI-SPEC lock the design decisions; this research's job is to resolve the handful of **API-level unknowns** that would otherwise block the planner.

Three of those unknowns matter more than all others combined:

1. **The UI-SPEC calls the View Transitions component `<ViewTransitions />`.** That name is stale. In Astro 6.1.7 (the installed version) the component is `<ClientRouter />`, imported from `astro:transitions`. Using the old name will not compile. This is the single most important correction the planner must apply.
2. **Scripts do not re-run across View Transitions by default.** The existing `src/pages/index.astro` IntersectionObserver will silently stop working on subsequent navigations unless it is re-architected with `data-astro-rerun` (for `is:inline` scripts) or via the `astro:page-load` event (for bundled module scripts). The UI-SPEC assumes the reveal script just moves into `src/scripts/reveal.ts` — that is necessary but not sufficient.
3. **DET-02 linking strategy** is open. Recommendation: **add `linkedPublications` / `linkedTalks` fields to the `people` schema using Astro 6's `reference()` helper** (not name-match, not raw string arrays). Name-match is brittle across author-order variants ("J. Smith" vs "Jane Smith"); `reference()` is the canonical Astro 6 pattern and catches typos at build time.

All other polish work — scroll reveal CSS utility, `.animate-fade-up` stagger on index page heroes, 404 page, RSS item shape, Pagefind `translations.zero_results` override, Lenis touch-device rule — maps cleanly onto existing shipped primitives.

**Primary recommendation:** Treat this phase as *wire existing scaffold into remaining surfaces, correct the one stale API name, and add two missing new files (`src/scripts/reveal.ts` and `src/pages/404.astro`), plus one new schema extension for DET-02*. No new design decisions, no new dependencies, no rebuilds.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Typography uses 4 weights (300 / 400 / 500 / 600)** — this is the existing shipped Inter + Fraunces variable-font system in `site/src/styles/global.css`. A formally approved exception to the "2 weights max" default. Phase 1 MUST NOT introduce any additional weights.

- 300 — editorial hero display (hero H1 only, via `.hero-heading`)
- 400 — body text, prose body, display default (Fraunces h1/h2/h3/h4 baseline)
- 500 — UI labels, nav links, eyebrows, meta, kbd chips (JetBrains Mono + Inter)
- 600 — card titles (articles, people cards), logo wordmark, `.prose strong`

**D-02: Spacing scale extends the standard checker set** `{4, 8, 16, 24, 32, 48, 64}` with four additional tokens already shipped in `site/src/styles/global.css`. Changing these regresses shipped layout rhythm on every styled page. All values are multiples of 4. A formally approved exception.

- `md: 12px` — compact button internal padding (x-axis)
- `4xl: 80px` (`5rem`) — section vertical padding (`5rem 0` on landing sections)
- `5xl: 96px` (`6rem`) — footer top margin, detail-page bottom padding
- `6xl: 128px` (`8rem`) — detail-page bottom breathing room (`padding: 4rem 0 8rem`)

Full scale in use: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128`.

### Claude's Discretion

**None for typography weights and spacing scale** — both locked to the existing shipped codebase. All other UI decisions remain per the UI-SPEC.md contract. Within the UI-SPEC, the planner may still choose between viable implementations where the spec explicitly flags an open decision (DET-02 linking strategy, reading-time helper, UW brand asset availability).

### Deferred Ideas (OUT OF SCOPE)

- Custom RAISE logomark SVG commission — if not obtained before Phase 1 ships, fall back to typographic lockup per UI-SPEC Branding Contract; open follow-up task for v2.
- UW official logo asset — same fallback pattern; fall back to text-only affiliation line if asset unavailable.
- Research pillar pages (RES-01, RES-02) — explicitly v2 per ROADMAP.md.
- Destructive-action token — deferred to Phase 3 (CMS admin flows).
- Subscribe form, AI Clinic homepage card, advanced search, video embeds — all v2 per REQUIREMENTS.md.

---

## Phase Requirements

| ID | Description | Research Support (file path → what it enables) |
|----|-------------|------------------------------------------------|
| DET-01 | Event detail: speaker, abstract, location/time, recording, slides | `site/src/pages/events/[slug].astro` is stubbed — `.event-abstract` and `.event-body` need `.reveal` class; hero block needs `.animate-fade-up` stagger. No structural change. |
| DET-02 | Person profile: bio, research areas, linked publications, linked talks | **NEW linking strategy required.** Recommended: add `linkedPublications` / `linkedTalks` to `people` Zod schema in `site/src/content.config.ts`; new `LinkedContentList.astro` component renders below `.person-body`. See §DET-02 Linking Strategy below. |
| DET-03 | Article detail: prose, author, date, tags, reading time | `site/src/pages/articles/[slug].astro` is stubbed — needs reading-time computation (recommended: inline word-count helper — see §Reading Time below), `.reveal` on `.article-body`, `<ClientRouter />` via `Base.astro`. |
| ANI-01 | Scroll reveal on content cards and sections (IntersectionObserver + Motion, ≤600ms) | Existing `.reveal` CSS + inline IntersectionObserver in `site/src/pages/index.astro` already works. Phase 1 lifts it to `src/scripts/reveal.ts` and applies `.reveal` to event/article/person/publication cards on their index pages. |
| ANI-02 | Hero load animation (stagger text reveal, ≤600ms, Fraunces heading) | Existing `.animate-fade-up` + `.animate-delay-{100..400}` already work on homepage hero. Apply same pattern to `.page-hero` on all index pages (events, articles, people, publications, AI for All, Get Involved, Search). |
| ANI-03 | Page transitions via Astro View Transitions | **API CORRECTION REQUIRED.** In Astro 6 the component is `<ClientRouter />` from `astro:transitions` — NOT `<ViewTransitions />`. Added to `Base.astro <head>`. See §Standard Stack. |
| ANI-04 | Respect `prefers-reduced-motion: reduce` | Global CSS guard already in `global.css` (animation/transition durations → 0.01ms). Two additions required: (a) `.reveal` observer must set `.visible` immediately on mount when reduced-motion is set (otherwise content stays invisible); (b) Lenis already skipped conditionally in `Base.astro` — keep. |
| ANI-05 | Lenis smooth scroll active on all pages, tuned | Already wired in `Base.astro` with `{ lerp: 0.09, smoothWheel: true }`. Do NOT enable `smoothTouch`. Verify hash-link scroll not broken. |
| BRD-01 | UW official logo in Nav/Footer | UW brand assets publicly downloadable at `www.washington.edu/brand/brand-elements/logos/` (SVG + PNG, no auth required, departmental use permitted). Prefer Block W mark in Footer; fall back to text-only affiliation line if asset skip. |
| BRD-02 | RAISE logomark in Nav | Existing typographic lockup (`RAISE` Fraunces 600 + `UW` mono chip) in `site/src/components/Nav.astro` already satisfies this. Custom logomark is deferred (v2). |
| BRD-03 | Visual QA — typography, spacing, color consistent | Final-step checklist against D-01/D-02 and UI-SPEC color contract. No new code; verification task only. |
| DISC-01 | RSS feed at `/rss.xml` | Existing `site/src/pages/rss.xml.ts` needs: (a) title copy update to "RAISE — Articles & Events" per UI-SPEC, (b) event title pattern `{speaker}: {title}`, (c) include past events (last 20) not only upcoming, (d) include `<atom:link>` self-reference via `xmlns` + `customData`. |
| DISC-02 | Pagefind indexes all collections | `astro-pagefind` already in `astro.config.mjs`. Gap: verify every detail route wraps `<Content />` in `<div data-pagefind-body>`. Pagefind runs only on `astro build`, not `astro dev`. Add `translations.zero_results` override to `src/pages/search.astro`. |

---

## Standard Stack

### Core (already installed, verified via installed `package.json` + `node_modules`)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | 6.1.7 | Static site generator, routing, content collections, `<ClientRouter />` | Project-level decision (STATE.md). No alternatives. |
| `@astrojs/mdx` | 5.0.3 | MDX rendering for articles/publications/events/people | Standard Astro content authoring path. |
| `@astrojs/rss` | 4.0.18 | Feed generator — `rss({ title, description, site, items })` | Official Astro package; do not hand-roll RSS XML. |
| `astro-pagefind` | 1.8.6 | Pagefind integration — build-time indexing + dev middleware | Current blessed pattern (community integration, actively maintained). |
| `pagefind` | 1.5.2 | Static-site search engine (UI + index) | Zero-config, zero-backend. |
| `tailwindcss` | 4.2.2 | Utility-first CSS with `@theme {}` design tokens | Locked by STATE.md. |
| `@tailwindcss/vite` | 4.2.2 | Tailwind v4 Vite plugin (default export; named export throws) | Locked via `tsconfig` validation. |
| `lenis` | 1.3.23 | Smooth scroll (wheel smoothing) | Shipped. Do not replace. |
| `motion` | 12.38.0 | Animation library (unused in Phase 1 surface code — `.reveal` is CSS-only; keep as future option) | Reserved for complex sequences if needed; not required for ANI-01/ANI-02. |
| `zod` | 4.3.6 | Content Collections schema validation | Required by Astro content config. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `fast-xml-parser` | (transitive via `@astrojs/rss`) | RSS XML generation internals | Do not import directly; use via `rss()`. |
| `@vueuse/motion` | 3.0.3 | Vue motion utilities (listed in `package.json`) | **Unused.** Project has no Vue islands. Safe to leave but do not introduce in Phase 1. Flag for removal in later cleanup. |
| `sirv` | (transitive via `astro-pagefind`) | Static-file serving for `/pagefind/*` during `astro dev` | Used automatically. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lenis | Native `scroll-behavior: smooth` + CSS scroll snap | Native has no wheel smoothing; feels less refined. Lenis locked by ANI-05 and already shipped. |
| Pagefind | Algolia DocSearch, Typesense, MiniSearch client-side | Pagefind is zero-backend and fits the "free forever" CLAUDE.md constraint. Locked by STATE.md. |
| `<ClientRouter />` | MPA with no client-side routing (full-page reloads) | View Transitions enable cross-route element continuity (Nav persistence) and smoother animations. ANI-03 mandates. |
| `@astrojs/rss` | Hand-rolled RSS XML string | RSS 2.0 spec has subtle correctness traps (pubDate format, CDATA escaping, `<atom:link>` self-reference). Do not hand-roll. |
| Inline IntersectionObserver in every page | Lift to `src/scripts/reveal.ts` (single load, one observer) | One observer per page is fine individually; the lift matters for View Transitions — one loaded script beats N re-registrations per navigation. |

**Installation status:** All dependencies already installed. No new `npm install` required for Phase 1 unless UW brand integration pulls a specific SVG path.

**Version verification:** Confirmed against installed tree (`node_modules/{pkg}/package.json`) on 2026-04-17. These are exact versions in the lockfile.

---

## Architecture Patterns

### Recommended Project Structure (existing; extend — do not restructure)

```
site/
├── src/
│   ├── layouts/
│   │   └── Base.astro              ← add <ClientRouter /> here
│   ├── components/
│   │   ├── Nav.astro               ← add UW logo SVG (BRD-01) if asset obtained
│   │   ├── Footer.astro            ← add UW affiliation line / logo (BRD-01)
│   │   ├── ArticleCard.astro       ← no change
│   │   ├── EventCard.astro         ← no change
│   │   ├── PersonCard.astro        ← no change
│   │   ├── PublicationCard.astro   ← no change
│   │   └── LinkedContentList.astro ← NEW (DET-02: linked pubs/talks block)
│   ├── scripts/                    ← NEW directory
│   │   └── reveal.ts               ← NEW (ANI-01: extracted from index.astro)
│   ├── pages/
│   │   ├── index.astro             ← remove inline reveal script (lifted)
│   │   ├── 404.astro               ← NEW (per UI-SPEC 404 copy)
│   │   ├── rss.xml.ts              ← complete per DISC-01 contract
│   │   ├── search.astro            ← add translations.zero_results override
│   │   ├── articles/index.astro    ← add .animate-fade-up hero + .reveal on cards
│   │   ├── articles/[slug].astro   ← add reading time + .reveal on body
│   │   ├── events/index.astro      ← add .animate-fade-up hero + .reveal on cards
│   │   ├── events/[slug].astro     ← add .reveal; NO structural change
│   │   ├── people/index.astro      ← add .animate-fade-up hero + .reveal on cards
│   │   ├── people/[slug].astro     ← add LinkedContentList below .person-body
│   │   ├── publications/index.astro← add .animate-fade-up hero + .reveal on cards
│   │   └── publications/[slug].astro← add .reveal on .pub-abstract + .cite-block
│   ├── content/
│   │   ├── articles/               ← empty — Phase 2 migration
│   │   ├── events/                 ← 2 samples
│   │   ├── people/                 ← 3 samples
│   │   └── publications/           ← 2 samples
│   ├── content.config.ts           ← extend `people` schema with linkedPublications/linkedTalks
│   └── styles/
│       └── global.css              ← DO NOT modify (locked by D-01/D-02)
└── public/
    ├── favicon.svg                 ← verify matches RAISE mark (BRD-03)
    ├── images/                     ← UW logo SVG lands here if BRD-01 asset obtained
    └── fonts/                      ← empty (Google Fonts CDN is the delivery path)
```

### Pattern 1: View Transitions in shared layout (ANI-03)

**What:** Register `<ClientRouter />` in the shared `<head>` to enable client-side routing with CSS View Transitions.
**When to use:** Once, in `Base.astro <head>` — affects every route that renders through the layout.
**Example:**

```astro
---
// site/src/layouts/Base.astro
import { ClientRouter } from 'astro:transitions';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';
// ... props ...
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    {/* ... existing head tags ... */}
    <ClientRouter />
  </head>
  <body>
    <Nav transition:persist />
    <main id="main-content"><slot /></main>
    <Footer transition:persist />
    {/* ... existing scripts ... */}
  </body>
</html>
```

Source: [Astro View Transitions docs](https://docs.astro.build/en/guides/view-transitions/) — component verified present in installed `site/node_modules/astro/components/ClientRouter.astro`.

**`transition:persist` on `<Nav />` and `<Footer />`** keeps the header and footer DOM nodes across navigation (no flash, scroll position preserved on Lenis'd body). This is the Astro 6 idiom for the persistent-chrome pattern.

### Pattern 2: Script re-execution across View Transitions (ANI-04 consequence)

**What:** Scripts bundled by Astro run once per full page load. After a View Transition they are skipped. `is:inline` scripts may or may not re-run depending on the `data-astro-rerun` opt-in.
**When to use:** Any client-side script that must hook new DOM (IntersectionObserver, Pagefind UI init, hamburger toggle).
**Example (preferred — module script with page-load event):**

```astro
<!-- site/src/layouts/Base.astro (body end) -->
<script>
  // Runs on initial load and on every view transition
  import { setupReveal } from '../scripts/reveal';
  document.addEventListener('astro:page-load', setupReveal);
</script>
```

```ts
// site/src/scripts/reveal.ts
export function setupReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll<HTMLElement>('.reveal:not(.visible)');

  if (prefersReducedMotion) {
    // ANI-04: don't leave content invisible
    reveals.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.15 }
  );
  reveals.forEach((el) => observer.observe(el));
}
```

**Example (alternative — inline script with `data-astro-rerun`):**

```astro
<script is:inline data-astro-rerun>
  // This inline tag re-executes after every ClientRouter navigation.
</script>
```

Source: Astro docs (["Client-side scripts" section](https://docs.astro.build/en/guides/view-transitions/#clientside-navigation-process)) — verified.

**Pitfall:** The current `site/src/pages/index.astro` contains an inline IntersectionObserver at the bottom (`<script>` without `is:inline` — it's a bundled module). That script runs once. After navigating away and back via View Transitions, the observer is not re-registered on the new DOM's `.reveal` nodes; content stays invisible. The lift to `src/scripts/reveal.ts` + `astro:page-load` listener is the fix.

### Pattern 3: Scroll-reveal CSS utility (existing — do not modify)

**What:** A CSS class pair (`.reveal` → initial hidden state, `.reveal.visible` → animated-in state) that a JavaScript IntersectionObserver toggles.
**When to use:** Any card/section that should fade-up on scroll.
**Already shipped in** `site/src/pages/index.astro` (scoped) — needs promotion to `global.css` to be available across pages.

**Move from** `index.astro`'s `<style>` **to** `global.css`:

```css
/* site/src/styles/global.css — append */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo);
}
.reveal.visible {
  opacity: 1;
  transform: none;
}
```

This is the only `global.css` edit required in Phase 1 beyond its current content. It is purely a lift — adds zero new tokens. (D-02 protects against new spacing tokens; D-01 protects against new weights; neither applies here.)

### Pattern 4: Hero-load stagger on index page heroes (ANI-02)

**What:** Apply `.animate-fade-up` + `.animate-delay-{100..400}` classes (already in `global.css`) to the 2-to-4 elements inside a `.page-hero` block.
**Example — `src/pages/events/index.astro`:**

```astro
<section class="page-hero">
  <div class="container">
    <span class="section-label animate-fade-up">Community</span>
    <h1 class="animate-fade-up animate-delay-100">Talks & Events</h1>
    <p class="page-desc animate-fade-up animate-delay-200">
      Weekly talks, hack days, and symposia on responsible AI — open to all.
    </p>
  </div>
</section>
```

No CSS additions — reuses shipped keyframes. Apply to all index pages + AI for All + Get Involved + Search + 404.

### Pattern 5: RSS feed with self-referencing `<atom:link>` (DISC-01)

**What:** `@astrojs/rss` with `xmlns` for the atom namespace and `customData` for the atom self-link.
**When to use:** Every time — feeds without self-reference fail validator warnings.
**Example:**

```ts
// site/src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const upcomingEvents = await getCollection('events', ({ data }) => data.upcoming);
  const pastEvents = (await getCollection('events', ({ data }) => !data.upcoming))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 20);

  const items = [
    ...articles.map((a) => ({
      title: a.data.title,
      pubDate: a.data.date,
      description: a.data.excerpt ?? a.data.title,
      link: `/articles/${a.id}/`,
    })),
    ...[...upcomingEvents, ...pastEvents].map((e) => ({
      title: `${e.data.speaker}: ${e.data.title}`,
      pubDate: e.data.date,
      description: e.data.abstract ?? 'Upcoming talk at RAISE.',
      link: `/events/${e.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'RAISE — Articles & Events',
    description:
      'Latest articles and upcoming talks from the UW Center for Responsibility in AI Systems and Experiences.',
    site: context.site!,
    items,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en-us</language>
      <atom:link href="${new URL('/rss.xml', context.site).href}" rel="self" type="application/rss+xml" />`,
  });
}
```

Source: [`@astrojs/rss` README + installed `dist/index.d.ts`](https://docs.astro.build/en/recipes/rss/) — `RSSOptions.xmlns` and `RSSOptions.customData` verified.

**Note:** Current stub uses `a.slug` and `e.slug`. In Astro 6 content is `entry.id`, not `entry.slug` — STATE.md flags this as a validated breaking change. The existing file still uses `.slug`; it may already be broken at runtime. Verify + fix during implementation.

### Pattern 6: Pagefind `data-pagefind-body` on detail routes (DISC-02)

**What:** Wrap detail-page content in `<div data-pagefind-body>` so Pagefind picks up only the article body, not navigation chrome.
**Example:**

```astro
<!-- site/src/pages/articles/[slug].astro -->
<article class="article-detail" data-pagefind-body>
  <!-- existing content -->
</article>
```

Or optionally scope indexing fields:

```astro
<h1 data-pagefind-meta="title">{article.data.title}</h1>
<div data-pagefind-filter="tag">{article.data.tags.join(', ')}</div>
```

Source: [Pagefind indexing docs](https://pagefind.app/docs/indexing/) — attributes verified.

**Dev vs build behavior:** `astro-pagefind` integration runs index generation in the `astro:build:done` hook (verified in installed `node_modules/astro-pagefind/src/pagefind.ts` line 43-70). During `astro dev`, an empty `/pagefind/` middleware is served but **no search results will appear until `astro build` has been run at least once** — flag this to the executor so "search doesn't work" during local dev is expected and non-blocking.

### Pattern 7: Pagefind UI `translations.zero_results` override (UI-SPEC copy)

**What:** Pass a `translations` object to the `PagefindUI` constructor with keys matching `pagefind_ui/translations/en.json`.
**Example:**

```astro
<!-- site/src/pages/search.astro -->
<script>
  // Bundled module script. Listens to `astro:page-load` (fires on initial load AND after
  // every view transition), so Pagefind UI is re-initialized whenever the user lands on
  // /search via any navigation path. `PagefindUI` is loaded globally by the inline
  // loader tag above.
  //
  // Do NOT use `is:inline data-astro-rerun` here — `astro:page-load` already handles
  // re-execution; pairing the two causes double-initialization on every transition.
  document.addEventListener('astro:page-load', () => {
    const searchEl = document.querySelector('#search');
    if (!searchEl || searchEl.hasChildNodes()) return; // only on /search, and only once per mount

    new PagefindUI({
      element: '#search',
      showSubResults: true,
      showImages: false,
      resetStyles: false,
      translations: {
        zero_results:
          'No matches for that search. Try different keywords, or browse Articles, Events, People, or Publications.',
      },
    });
    document.querySelector<HTMLInputElement>('#search input')?.focus();
  });
</script>
```

Source: [Pagefind UI docs](https://pagefind.app/docs/ui/) — `translations.zero_results` key verified.

### Anti-Patterns to Avoid

- **`<ViewTransitions />` import from `astro:transitions`** — this is the old (Astro ≤4) name. Use `<ClientRouter />` in Astro 6. The UI-SPEC states the wrong name; the planner must correct.
- **Bundled module `<script>` without `astro:page-load` listener** — silently stops working after View Transitions. The existing `src/pages/index.astro` observer has this bug latent; the lift to `src/scripts/reveal.ts` + listener is the fix.
- **`is:inline` script without `data-astro-rerun`** — also silently stops. If you must use inline, add `data-astro-rerun`.
- **`data-astro-rerun` on a script that binds `document`-level listeners** — causes listener accumulation (one new handler per navigation). Use a plain bundled `<script>` (fires once at page load) or an `astro:page-load` listener (fires per load, but bind listeners inside a one-shot guard). Never combine `data-astro-rerun` with `astro:page-load` — double-fire.
- **Name-match linking for DET-02** — brittle across "J. Smith" vs "Jane Smith" vs "Jane D. Smith". Schema-based IDs survive content migration.
- **Enabling Lenis `smoothTouch: true`** — causes jank on iOS; UI-SPEC prohibits. Keep wheel-only.
- **Moving Lenis init outside the `prefersReducedMotion` guard** — ANI-04 regression.
- **Introducing new font weights or spacing tokens** — D-01 / D-02 locked.
- **Registering an IntersectionObserver per page** after `src/scripts/reveal.ts` exists — wastes the abstraction.
- **Passing `entry.slug` in Astro 6** — `entry.id` is the correct field; `.slug` is gone from the Content Layer API.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RSS XML generation | Custom XML string with `<rss>`, `<item>` tags | `@astrojs/rss` | Date format (RFC 822 vs ISO), CDATA escaping, `<atom:link>` self-reference, character encoding — all traps. |
| Site search index | Custom JSON-based fuzzy search | `pagefind` via `astro-pagefind` | Multi-lingual tokenization, stemming, BM25 ranking, WASM-backed speed. Already installed. |
| Smooth scroll | Custom `requestAnimationFrame` lerp | `lenis` | Handles touchpad inertia, hash anchors, RAF cleanup, multi-scroller. Already installed. |
| View Transitions | Custom `document.startViewTransition()` + fetch + swap | `<ClientRouter />` | Fallback handling for unsupported browsers, route announcer for a11y, script re-execution events, prefetch integration. |
| IntersectionObserver per page | Copy-paste observer into every `.astro` `<script>` | One `src/scripts/reveal.ts` + `astro:page-load` listener | One observer per DOM; script re-execution across transitions handled centrally. |
| Word-count / reading-time | Manual `.split(' ').length` in each article template | One helper function called from `[slug].astro` | DRY; one implementation of "200 wpm" heuristic. See §Reading Time below. |
| Favicon generation | Multiple PNG sizes for every platform | Single SVG favicon (already in `site/public/favicon.svg`) | SVG scales everywhere; modern browsers (and all current mobile platforms) accept it. |

**Key insight:** The scaffold is explicitly designed to avoid custom implementations of these primitives. Every library listed is "the blessed option for Astro 6 static sites" (Astro docs, Pagefind docs, Lenis README); the `astro-pagefind` integration exists specifically so project authors don't hand-roll the `createIndex → writeFiles` flow.

---

## Runtime State Inventory

> Phase 1 is pure code/config polish on a pre-built Astro scaffold. **Not a rename/refactor/migration phase.** No stored data, live-service config, OS-registered tasks, secrets, or compiled artifacts are being renamed or migrated. The shipped `site/dist/` build artifact will naturally regenerate on the next `npm run build` after Phase 1 code changes land. **Section intentionally short — no pre-existing runtime state is affected.**

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no databases, KV stores, or persistent state | — |
| Live service config | None — no external service with this phase's identifiers in live config | — |
| OS-registered state | None — no scheduled tasks, systemd units, or pm2 processes | — |
| Secrets / env vars | None — no keys renamed or introduced in Phase 1 | — |
| Build artifacts | `site/dist/` and `site/.astro/` — regenerated by `astro build`; no manual migration | Run `npm run build` post-change to refresh |

---

## DET-02 Linking Strategy (open decision — recommendation)

UI-SPEC flags this as "planner decision." Two candidates:

| | **A. Name-match** (runtime filter) | **B. Explicit ID fields** (schema change) |
|---|---|---|
| **Implementation** | In `people/[slug].astro`, filter `publications.data.authors.includes(person.data.name)` and `events.data.speaker === person.data.name` | Add `linkedPublications: z.array(reference('publications')).default([])` and `linkedTalks: z.array(reference('events')).default([])` to `people` schema using `reference()` from `astro:content`; in `people/[slug].astro`, call `getEntries(person.data.linkedPublications)` directly |
| **Content file burden** | None (authors/speaker fields already exist) | Editor must populate `linkedPublications` / `linkedTalks` arrays with exact publication/event `id`s when authoring a person entry |
| **Robustness** | **Fragile.** "Tanushree Mitra" vs "Tanu Mitra" (see `people/tanu-mitra.mdx`) vs "T. Mitra" all break silently. Pubs' `authors` contain "Tanushree Mitra" — `person.data.name` is "Tanu Mitra" in shipped file. Name-match would find zero matches. | Robust. Editor chooses the IDs explicitly. |
| **Migration impact (Phase 2)** | MIG-01/02 publication authors are scraped from WordPress — author-name format is inconsistent in the source data. Phase 2 would need a name-normalization pass, which is extra work and never complete. | MIG-03 person authors populate `linkedPublications` from the publication IDs they're known to author. One-time manual step during migration, then stable. |
| **CMS impact (Phase 3)** | Decap CMS users manage author names in two places (publication entry + person entry). Typos propagate. | Decap CMS offers a `relation` widget: publications/events ID fields become a searchable dropdown. Higher authoring quality. |
| **Initial-load performance** | Every person-page render filters the full pubs + events collections — O(N) per page, N ≈ 40 pubs + 50+ events. Trivial at this scale. | `getEntries(ids)` is O(k) where k is the linked count per person (~5). Slightly faster, immaterial. |

**Recommendation: B (explicit ID fields).** The cost is a small schema extension and a one-time editor population during Phase 2 content migration. The benefit is a correct, stable DET-02 surface and a CMS authoring experience that doesn't decay. Name-match is tempting because it needs zero content work today, but it fails on the very first sample (`tanu-mitra.mdx` has `name: Tanu Mitra` while `llm-opioid-reddit.mdx` lists author `Tanushree Mitra` — already mismatched).

**Schema edit (recommended — use `reference()` not raw string arrays):**

```ts
// site/src/content.config.ts
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const people = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/people' }),
  schema: z.object({
    // ... existing fields ...
    linkedPublications: z.array(reference('publications')).default([]),
    linkedTalks: z.array(reference('events')).default([]),
  }),
});
```

**Why `reference()` over `z.array(z.string())`:**
- Build-time validation: a typo in a linked ID fails `astro build`, not runtime render.
- Typed entries: `getEntries(person.data.linkedPublications)` returns `CollectionEntry<'publications'>[]` with correct types.
- CMS-friendly: Decap CMS (Phase 3) `relation` widget targets collection references natively — editors pick from a dropdown, not type IDs.
- Canonical Astro 6 pattern. Verified in installed `site/.astro/content.d.ts` — `reference<C>(collection: C)` is exported from `astro:content`.

**Frontmatter in a person MDX file:**

```yaml
---
name: Bill Howe
# ...
linkedPublications:
  - llm-opioid-reddit        # matches publication entry.id
  - ml-fairness-computational
linkedTalks:
  - ai-normal-technology
---
```

**Query pattern in `src/pages/people/[slug].astro`:**

```ts
import { getEntries } from 'astro:content';

const linkedPubs = person.data.linkedPublications.length
  ? await getEntries(person.data.linkedPublications)
  : [];
const linkedTalks = person.data.linkedTalks.length
  ? await getEntries(person.data.linkedTalks)
  : [];
```

No manual `{ collection, id }` mapping — `reference()` already encodes that shape.

**Planner cascading decision:** Phase 1 ships the schema + UI component with empty arrays. Phase 2 (content migration) populates the arrays. Phase 1 success criteria is "the section renders with empty state when arrays are empty" — no blocker.

---

## Reading Time (open decision — recommendation)

UI-SPEC flags two options for DET-03.

**Recommendation: inline word-count helper** (not `remark-reading-time`).

Rationale:
- `remark-reading-time` adds a `remarkPlugin` to `astro.config.mjs` and a dependency to `package.json`. For a single helper called from one template, that's over-kill.
- Astro 6's `render(entry)` returns `{ Content, headings, remarkPluginFrontmatter }` — **and `entry.body` contains the raw markdown string**, so the helper can run at template time without a plugin.
- The "200 words per minute" heuristic is a 3-line function; no benefit from externalizing.

**Helper implementation:**

```ts
// inline in site/src/pages/articles/[slug].astro frontmatter, or extract to src/lib/readingTime.ts
function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// usage
const readingTime = `${readingTimeMinutes(article.body ?? '')} min read`;
```

**Byline render:**

```astro
<div class="article-byline">
  <span>{article.data.author}</span>
  <span>·</span>
  <time datetime={article.data.date.toISOString()}>{formattedDate}</time>
  <span>·</span>
  <span>{readingTime}</span>
</div>
```

**Caveat:** Astro 6's `entry.body` is the raw MDX source including frontmatter-free markdown. This includes code blocks and MDX syntax; for a "time to read," the ~5% noise from inline JSX is ignorable. If the editor wants tighter numbers, strip code fences before counting. Ship the simple version.

---

## UW Brand Integration (BRD-01 availability check)

**Source verified:** [UW Brand → Logos](https://www.washington.edu/brand/brand-elements/logos/) — publicly accessible, no NetID required.

**Available SVG assets (per fetched page content):**
- Block W logo — SVG + PNG, in white/purple/gold/black variants
- University wordmark ("WASHINGTON") — SVG + PNG
- Department signature generator — produces SVG (2-color) for approved department names

**Rules (quoted):**
- Block W minimum: 18 px web / 0.25″ print
- Wordmark minimum: 72 px web / 1″ print
- Clear area: equivalent to the height of the serif on the Block W; no text or images may overlap

**Recommendation for BRD-01:**
- **Primary:** download Block W (purple variant, SVG) into `site/public/images/uw-w.svg`; render at 24 px in Nav's `.logo-uw` chip (replacing the text `UW`) OR at 32 px in Footer alongside the existing `RAISE` wordmark. Preserve 1× serif-height clear space.
- **Fallback (already in UI-SPEC):** keep text-only `RAISE + UW` chip in Nav + add an affiliation line in Footer: `University of Washington` in body font at 14 px weight 500. Flag the file with a frontmatter comment `// BRD-01 fallback — UW official asset pending`.

**Departmental guidance caveat:** The UW brand page states that unit/department websites should use the **department signature generator** (which appends the unit name to the Block W). RAISE as a UW research center could legitimately use either (a) plain Block W (since RAISE is sub-branded) or (b) a generated "Center for Responsibility in AI Systems and Experiences" signature. Option (a) is cleaner given the existing typographic lockup already carries the RAISE wordmark. **Flag to the planner:** confirm with the RAISE team which approach UW Marketing has approved for `raise.uw.edu` before committing to one.

---

## Common Pitfalls

### Pitfall 1: `<ViewTransitions />` is not a component in Astro 6

**What goes wrong:** Build fails with `Cannot resolve import { ViewTransitions } from "astro:transitions"` or the component renders nothing.
**Why it happens:** Astro 5 renamed the component to `<ClientRouter />`; Astro 6 removed the old name entirely. UI-SPEC was written citing the pre-5 name.
**How to avoid:** Import `{ ClientRouter }` from `astro:transitions` (not `ViewTransitions`). The installed file is `site/node_modules/astro/components/ClientRouter.astro`; there is no `ViewTransitions.astro`.
**Warning signs:** TypeScript/Astro build-time error on the import line. If the old name happens to compile in some patch version, runtime will fail silently.

### Pitfall 2: Bundled module scripts don't re-run across View Transitions

**What goes wrong:** Scroll-reveal stops working after any navigation via `<ClientRouter />`. Cards appear but don't animate in. Or: Pagefind UI on `/search` renders a blank area on second visit.
**Why it happens:** Astro deduplicates bundled module scripts — each script executes once per full page load, never on a transitioned navigation.
**How to avoid:** Wrap any DOM-binding logic in a function and call it from both initial load and the `astro:page-load` event in `Base.astro` or at the page level. Alternatively, use `<script is:inline data-astro-rerun>`.
**Warning signs:** Feature works on hard refresh, fails after soft navigation. Easily missed because local dev often uses refresh.

### Pitfall 3: `.reveal` content stays invisible for reduced-motion users

**What goes wrong:** A user with `prefers-reduced-motion: reduce` opens the site; `.reveal` elements never transition to `.visible` (because the CSS transition is effectively zero duration, and the `.visible` class still needs to be set by JS); reduced-motion users see a sparse, mostly-blank site.
**Why it happens:** The IntersectionObserver pattern toggles `.visible`; with `transition-duration: 0.01ms` forced by the global reduced-motion guard, the transition from `opacity: 0` → `opacity: 1` on `.visible` is instant *if* the class is set. But if the observer is never fired (element out of viewport, or reduced-motion also disables some browsers' scroll-triggered observer callbacks), content stays invisible.
**How to avoid:** In `src/scripts/reveal.ts`, check `prefers-reduced-motion` first. If set, iterate `.reveal` elements and add `.visible` unconditionally (no observer). See the code snippet in Pattern 2.
**Warning signs:** Accessibility QA reports "content invisible" on reduced-motion system setting.

### Pitfall 4: Pagefind returns no results during `astro dev`

**What goes wrong:** Developer visits `/search`, types a query, sees nothing; assumes the integration is broken.
**Why it happens:** `astro-pagefind` builds the index in the `astro:build:done` hook — it runs on `astro build`, not `astro dev`. Dev mode serves a middleware that handles `/pagefind/*` routes, but the index JSON doesn't exist until a build has run.
**How to avoid:** Run `npm run build` then `npm run preview` to exercise search. Or: ignore search on `dev` and verify only in preview mode. Document this in a developer note alongside the commit.
**Warning signs:** "Pagefind doesn't work" reports that disappear after running a build.

### Pitfall 5: `entry.slug` breaks in Astro 6 Content Collections

**What goes wrong:** `getCollection()` returns entries with `.id` but not `.slug`. Code calling `entry.slug` throws `undefined` or passes `undefined` into a URL template.
**Why it happens:** Astro 6's Content Layer API dropped the `.slug` field in favor of `.id`. STATE.md already documents this as a validated breaking change.
**How to avoid:** Use `entry.id` everywhere. The existing `src/pages/rss.xml.ts` references `a.slug` and `e.slug` — fix during DISC-01 polish. `src/pages/index.astro` references `event.slug` and `article.slug` — also fix.
**Warning signs:** Homepage event/article links point to `/events/undefined/` or `/articles/undefined/`.

### Pitfall 6: Lenis + hash-anchor in-page links

**What goes wrong:** Clicking `<a href="#section-2">` does nothing, or scrolls to the wrong position.
**Why it happens:** Lenis hijacks `scroll-behavior`; native hash-navigation doesn't trigger Lenis's smooth-scroll.
**How to avoid:** (a) Phase 1 has no in-page anchor links on the shipped surfaces — verify this holds. If added later, call `lenis.scrollTo('#section-2')` explicitly on click. (b) Current config `{ lerp: 0.09, smoothWheel: true }` does not intercept anchor navigation; confirm in QA.
**Warning signs:** Manual anchor test on any page fails.

### Pitfall 7: Lenis `smoothTouch: true` on iOS

**What goes wrong:** Scroll feels "juddery" or "laggy" on iPhone/iPad.
**Why it happens:** iOS Safari has native momentum scroll that conflicts with Lenis' RAF loop.
**How to avoid:** Current config does NOT enable `smoothTouch`. Do not add it. UI-SPEC already flags this explicitly.
**Warning signs:** Touch-device QA reports jank.

### Pitfall 8: `<atom:link>` self-reference missing from RSS feed

**What goes wrong:** [W3C feed validator](https://validator.w3.org/feed/) reports `missing atom:link with rel="self"`; some aggregators (e.g., Feedly) reject the feed.
**Why it happens:** RSS 2.0 + Atom namespace best practice requires a self-reference so aggregators can detect the canonical feed URL.
**How to avoid:** Pass `xmlns: { atom: 'http://www.w3.org/2005/Atom' }` + `customData: '<atom:link ... />'` to `rss()`. See Pattern 5 above.
**Warning signs:** Feed validator warnings; subscribers report "feed invalid."

### Pitfall 9: Pagefind `data-pagefind-body` missing on a collection's detail route

**What goes wrong:** Search returns results pointing to `/publications/foo/`, but clicking shows the page; subsequent queries never match publication body text.
**Why it happens:** Without a `data-pagefind-body` wrapper, Pagefind indexes the whole page including Nav/Footer boilerplate; relevance ranking then buries actual content.
**How to avoid:** Add `data-pagefind-body` to the outermost `<article>` or `<main>` wrapper on every detail route (`articles/`, `events/`, `people/`, `publications/`). The index routes should NOT need it — they're listing pages, not content pages.
**Warning signs:** Search scores look inverted (Nav page ranked above content page).

### Pitfall 10: Package-manager mismatch (`pnpm` vs `npm`)

**What goes wrong:** CLAUDE.md says `build command: 'pnpm build'`; `package-lock.json` is present, `pnpm-lock.yaml` is not; `pnpm` is not installed on the dev machine. Contributors following CLAUDE.md will hit `command not found: pnpm`.
**Why it happens:** Project was scaffolded with npm but CLAUDE.md copy-paste assumed pnpm.
**How to avoid:** Either (a) flag to the planner that the build command is `npm run build`, not `pnpm build`, and update CLAUDE.md accordingly in a later task; or (b) install pnpm on the deployment environment and migrate the lockfile. Simpler: use `npm run build`. The Cloudflare Pages deployment command (Phase 3) should match whichever is chosen.
**Warning signs:** `pnpm: command not found` in CI or developer shell.

---

## Code Examples

Verified patterns from installed source + official docs.

### Register View Transitions in `Base.astro`

```astro
---
// site/src/layouts/Base.astro
import { ClientRouter } from 'astro:transitions';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props { title?: string; description?: string; ogImage?: string; }
const { title, description, ogImage = '/og-default.png' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <!-- existing meta/og/link tags -->
    <ClientRouter />
  </head>
  <body>
    <Nav transition:persist />
    <main id="main-content"><slot /></main>
    <Footer transition:persist />
    <script>
      import { setupReveal } from '../scripts/reveal';
      import Lenis from 'lenis';

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Lenis: only initialize once (persistent across transitions via transition:persist bodies don't apply here; the script is re-imported but the Lenis instance should be module-scoped).
      let lenisInitialized = false;
      function initLenis() {
        if (lenisInitialized || prefersReducedMotion) return;
        const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        lenisInitialized = true;
      }

      // Initial load + every view transition
      document.addEventListener('astro:page-load', () => {
        initLenis();
        setupReveal();
      });
    </script>
    <script>
      // Keyboard shortcut — bound to `document`, which persists across view transitions.
      // A bundled module script runs ONCE on initial load; do NOT use `data-astro-rerun`
      // here, and do NOT bind inside an `astro:page-load` listener. Either would cause
      // listener accumulation (one new keydown handler per navigation → `/` fires N times
      // after N transitions). One-shot binding at module load is correct.
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('[data-pagefind-ui] input');
          if (searchInput) searchInput.focus();
          else window.location.href = '/search';
        }
      });
    </script>
  </body>
</html>
```

### Scroll-reveal module (`src/scripts/reveal.ts`)

```ts
// site/src/scripts/reveal.ts
export function setupReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll<HTMLElement>('.reveal:not(.visible)');
  if (!reveals.length) return;

  if (prefersReducedMotion) {
    reveals.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );
  reveals.forEach((el) => observer.observe(el));
}
```

### Reading-time helper

```ts
// inline in src/pages/articles/[slug].astro frontmatter, or at src/lib/readingTime.ts
export function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
```

### LinkedContentList component (DET-02)

```astro
---
// site/src/components/LinkedContentList.astro
import type { CollectionEntry } from 'astro:content';

interface Props {
  label: string;
  items: CollectionEntry<'publications'>[] | CollectionEntry<'events'>[];
  kind: 'publications' | 'events';
  emptyCopy: string;
}
const { label, items, kind, emptyCopy } = Astro.props;
---

<section class="linked-section">
  <h2 class="linked-section-label">{label}</h2>
  {items.length === 0 ? (
    <p class="linked-empty">{emptyCopy}</p>
  ) : (
    <ul class="linked-list" role="list">
      {items.map((item) => (
        <li class="linked-item">
          <a href={`/${kind}/${item.id}/`}>
            <span class="linked-title">{item.data.title}</span>
            <span class="linked-meta">
              {kind === 'publications'
                ? `${(item as CollectionEntry<'publications'>).data.venue} · ${item.data.date.getFullYear()}`
                : `${item.data.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )}
</section>

<style>
.linked-section { padding: 2rem 0; border-top: 1px solid var(--color-border); margin-top: 3rem; }
.linked-section-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 1rem;
  font-weight: 500;
}
.linked-empty { color: var(--color-muted); font-style: italic; font-size: 0.875rem; }
.linked-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.linked-item a {
  display: flex; flex-direction: column; gap: 0.2rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  transition: padding-left 0.2s var(--ease-out-expo);
}
.linked-item a:hover { padding-left: 0.25rem; text-decoration: none; }
.linked-title { font-size: 0.95rem; color: var(--color-base); }
.linked-meta { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-muted); }
@media (prefers-color-scheme: dark) {
  .linked-section { border-top-color: var(--color-border-dark); }
  .linked-item a { border-bottom-color: var(--color-border-dark); }
  .linked-title { color: var(--color-surface); }
}
</style>
```

Sources: `site/src/pages/publications/[slug].astro` (existing color/font patterns), UI-SPEC §Typography Label tier, D-02 spacing tokens.

### 404 page (`src/pages/404.astro`)

```astro
---
// site/src/pages/404.astro
import Base from '../layouts/Base.astro';
---

<Base title="Page not found — RAISE" description="The page you're looking for doesn't exist.">
  <section class="not-found">
    <div class="container">
      <h1 class="not-found-heading animate-fade-up">
        Page <em>not</em> found.
      </h1>
      <p class="not-found-body animate-fade-up animate-delay-100">
        That page may have moved. Try the main navigation or search for what you're looking for.
      </p>
      <div class="not-found-actions animate-fade-up animate-delay-200">
        <a href="/" class="btn btn-primary">Go to homepage</a>
        <a href="/search" class="btn btn-ghost">Search the site →</a>
      </div>
    </div>
  </section>
</Base>

<style>
.not-found { min-height: 70vh; display: flex; align-items: center; padding: 5rem 1.5rem; }
.container { max-width: 720px; margin: 0 auto; text-align: center; }
.not-found-heading {
  font-family: var(--font-display);
  font-size: clamp(3rem, 7vw, 6rem);
  font-weight: 300;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}
.not-found-heading em { font-style: italic; color: var(--color-accent); }
.not-found-body {
  font-size: clamp(1rem, 2vw, 1.15rem);
  color: var(--color-muted);
  max-width: 50ch;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
}
.not-found-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
/* .btn styles lifted from index.astro or moved to global.css as a follow-up */
.btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.75rem 1.5rem; border-radius: var(--radius-btn);
  font-size: 0.95rem; font-weight: 500; text-decoration: none;
  transition: all 0.2s var(--ease-out-expo); cursor: pointer;
}
.btn-primary { background: var(--color-base); color: var(--color-surface); border: 1px solid var(--color-base); }
.btn-primary:hover { background: var(--color-accent); border-color: var(--color-accent); text-decoration: none; transform: translateY(-1px); }
.btn-ghost { background: transparent; color: var(--color-base); border: 1px solid var(--color-border); }
.btn-ghost:hover { border-color: var(--color-base); text-decoration: none; transform: translateY(-1px); }
@media (prefers-color-scheme: dark) {
  .btn-primary { background: var(--color-surface); color: var(--color-base); border-color: var(--color-surface); }
  .btn-ghost { color: var(--color-surface); border-color: var(--color-border-dark); }
  .btn-ghost:hover { border-color: var(--color-surface); }
}
</style>
```

**Note:** The homepage `.btn` styles are currently scoped inside `src/pages/index.astro`. For 404 and future shared button use, either (a) lift `.btn`/`.btn-primary`/`.btn-ghost` to `global.css` as a one-time op, or (b) duplicate locally (short-term). Recommendation: lift to `global.css` in the same task as the `.reveal` lift — both are one-time CSS moves.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<ViewTransitions />` from `astro:transitions` | `<ClientRouter />` from `astro:transitions` | Astro 5 (2024) → deprecation completed by Astro 6 | UI-SPEC citations are stale; planner must use new name. |
| `entry.slug` on content collection entries | `entry.id` on content collection entries | Astro 6 Content Layer API | STATE.md already flags this; existing code has lingering `.slug` references (rss.xml.ts, index.astro). |
| `astro:transitions`-managed scripts just worked | Scripts require `astro:page-load` event or `data-astro-rerun` | Astro 5+ | Implicit in all reactive client code; easy to miss. |
| Remark plugin for reading time | Inline word-count helper using `entry.body` | Astro 6 exposes raw body string cleanly | Zero-dep path. |
| `z.array(z.string())` for cross-collection links | `z.array(reference('collection'))` from `astro:content` | Astro 5 (stable in 6) | Build-time ID validation, typed `getEntries()` return, CMS relation widget support. |

**Deprecated / outdated:**
- `<ViewTransitions />` — removed from Astro 6 API.
- Tailwind v3 `tailwind.config.js` — Tailwind v4 uses `@theme {}` in CSS. Project already on v4.
- Inline per-page IntersectionObserver — still works but fragile with View Transitions.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro build | ✓ | v25.2.1 (>= 22.12.0 required) | — |
| npm | Package install + `npm run build` | ✓ | 11.6.2 | — |
| pnpm | CLAUDE.md references `pnpm build` | ✗ | — | Use `npm run build` (project has `package-lock.json`, no `pnpm-lock.yaml`) |
| `astro` 6.1.7 | Entire site | ✓ | 6.1.7 | — |
| `@astrojs/mdx` 5.0.3 | Content rendering | ✓ | 5.0.3 | — |
| `@astrojs/rss` 4.0.18 | DISC-01 feed | ✓ | 4.0.18 | — |
| `astro-pagefind` 1.8.6 + `pagefind` 1.5.2 | DISC-02 search | ✓ | 1.8.6 / 1.5.2 | — |
| `lenis` 1.3.23 | ANI-05 smooth scroll | ✓ | 1.3.23 | — |
| `motion` 12.38.0 | Reserved for future animation | ✓ | 12.38.0 | Unused in Phase 1 — `.animate-fade-up` is pure CSS. Do not pull into Phase 1 code. |
| UW Block W SVG asset | BRD-01 preferred | ✓ (publicly downloadable) | — | UI-SPEC already specifies text-only fallback |
| Custom RAISE logomark SVG | BRD-02 preferred | ✗ (not commissioned) | — | Existing typographic lockup (Fraunces wordmark) stays — UI-SPEC fallback path |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:**
- `pnpm` → use `npm` (drop-in — same `package.json` scripts).
- Custom RAISE logomark → typographic lockup (already shipping).
- UW official asset → also has text-only fallback if Block W download is skipped for any reason.

**Note for planner:** CLAUDE.md references `pnpm build` for Cloudflare Pages — Phase 3 will either need to match (install pnpm there) or update the build command to `npm run build`. Safer: use `npm run build` everywhere for Phase 1 verification; flag CLAUDE.md update as a Phase 3 concern.

---

## Project Constraints (from CLAUDE.md)

CLAUDE.md directives the planner must honor:

- **Budget:** Free forever. No paid APIs/services in Phase 1 implementation. (Nothing Phase 1 touches is paid; Google Fonts is free; no CDN fees for self-hosted font files either.)
- **Tech stack:** Astro 6 + Tailwind v4 + MDX + Pagefind + Decap CMS + Lenis + Motion. **No substitutions.** (Already enforced by `package.json`.)
- **Animation:** Subtle & refined; every animation has a purpose; **none exceeds 600ms**; `prefers-reduced-motion` respected. (UI-SPEC §Animation Contract enforces; all existing durations are ≤600ms.)
- **Accessibility:** No JS required for content. Astro islands only for interactive UI (filter, search, CMS). (Phase 1 content renders entirely in static HTML; JS is used only for scroll reveal, Lenis, view transitions, search UI, and nav hamburger — all progressive enhancement.)
- **DNS constraint:** `raise.uw.edu` is UW subdomain; DNS cutover requires UW IT. Deploy to Cloudflare URL first. (Phase 3 concern, not Phase 1, but flag noted.)
- **Editors:** 3-4 non-technical collaborators via `/admin`. (Phase 3 — Decap CMS — but `src/content.config.ts` schema extensions in Phase 1 must remain CMS-friendly, i.e., ID-based `relation` fields for DET-02 linking, which matches the Recommendation §DET-02.)
- **GSD workflow enforcement:** Before file changes, start work through a GSD command. Phase 1 executes via `/gsd:execute-phase 1` — no ad-hoc edits.
- **Folder conventions (global CLAUDE.md):** Source in `src/`, tests colocated or in `tests/`, no `temp_*`/`test2*`/`new_*`/`copy_*`/`*_backup*` files. (Phase 1 adds `src/scripts/reveal.ts` and `src/pages/404.astro` and `src/components/LinkedContentList.astro` — all within convention.)
- **Commit style:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). Planner task actions should use these.

No CLAUDE.md directive contradicts any RESEARCH.md recommendation.

---

## Open Questions

1. **Should the UW Block W logo actually ship in Phase 1, or defer to v2?**
   - What we know: Asset is publicly downloadable; clear-space/min-size rules are defined; departmental usage is permitted.
   - What's unclear: Whether the RAISE team has secured approval from UW Marketing for a specific lockup on `raise.uw.edu`, and whether a custom "RAISE" department signature should be generated via the UW signature generator instead of using the standalone Block W.
   - Recommendation: Planner creates a task with a branch point — if the team confirms approval + asset choice before the task runs, ship the SVG path; otherwise ship the text-fallback path and open a v2 follow-up. Either way, the UI design is unchanged; only the asset file swaps.

2. **Should the homepage inline IntersectionObserver be removed in the same task as `src/scripts/reveal.ts` extraction, or in a dedicated cleanup task?**
   - What we know: The inline script duplicates what `src/scripts/reveal.ts` will do.
   - What's unclear: Whether leaving both registered causes any observable double-binding issue (it does not, because `unobserve` is called on first intersect, but it's dead weight).
   - Recommendation: Remove inline in the same task — atomic change, no risk of forgetting.

3. **Should the `/rss.xml` feed include past events (last 20) or only articles + upcoming events?**
   - What we know: UI-SPEC says "articles + events with correct titles, dates, and links" (ROADMAP success criterion 4). It doesn't distinguish upcoming vs past.
   - What's unclear: Whether a subscriber wants to see past event recordings in their feed (useful for archives) or only upcoming (calendar-style).
   - Recommendation: Include articles + upcoming + last 20 past events, sorted by date desc. Matches UI-SPEC RSS metadata table which uses `data.date` generically.

---

## Sources

### Primary (HIGH confidence)

- **Astro 6 View Transitions docs** — [docs.astro.build/en/guides/view-transitions/](https://docs.astro.build/en/guides/view-transitions/) — verified `<ClientRouter />` name, `astro:page-load` event, `data-astro-rerun` attribute, `transition:persist` directive.
- **Installed Astro source** — `site/node_modules/astro/components/ClientRouter.astro` (6.1.7) — component file exists; `ViewTransitions.astro` does not.
- **Installed `@astrojs/rss` types** — `site/node_modules/@astrojs/rss/dist/index.d.ts` (4.0.18) — `RSSOptions` shape with `xmlns`, `customData`, `RSSFeedItem` fields confirmed.
- **Installed `astro-pagefind` source** — `site/node_modules/astro-pagefind/src/pagefind.ts` (1.8.6) — integration behavior confirmed: index built on `astro:build:done`, dev middleware for `/pagefind/*`.
- **Pagefind UI docs** — [pagefind.app/docs/ui/](https://pagefind.app/docs/ui/) — `translations.zero_results` key verified, constructor options list verified.
- **Pagefind Indexing docs** — [pagefind.app/docs/indexing/](https://pagefind.app/docs/indexing/) — `data-pagefind-body`, `data-pagefind-meta`, `data-pagefind-filter`, `data-pagefind-ignore` attributes verified.
- **UW Brand Logos** — [washington.edu/brand/brand-elements/logos/](https://www.washington.edu/brand/brand-elements/logos/) — public access confirmed, SVG availability confirmed, clear-space and minimum-size rules confirmed.
- **Project ground truth** — `site/src/styles/global.css`, `site/src/layouts/Base.astro`, `site/src/pages/**`, `site/src/components/**`, `site/src/content.config.ts`, `site/astro.config.mjs`, `site/package.json`, `site/node_modules/*/package.json` — shipping code and locked versions.

### Secondary (MEDIUM confidence)

- **Astro RSS recipe** — [docs.astro.build/en/recipes/rss/](https://docs.astro.build/en/recipes/rss/) — cross-referenced for atom self-link pattern; conforms to installed types.
- **UW signature/logo usage search** — multiple UW department pages (iSchool, Engineering) show consistent Block W usage on sub-sites; confirms pattern precedent.

### Tertiary (LOW confidence — flag for validation)

- **None.** All recommendations are grounded in HIGH-confidence sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — all versions verified against installed `node_modules/*/package.json`; all APIs verified against installed `.d.ts` files or official docs.
- Architecture: **HIGH** — existing code is the architecture; Phase 1 is additive polish, not design.
- Pitfalls: **HIGH** — `<ClientRouter />` rename, `entry.id` vs `.slug`, and script re-execution are all concrete traps verified against the shipped Astro source and docs.
- DET-02 recommendation: **HIGH** — driven by existing content data (`tanu-mitra.mdx` vs `llm-opioid-reddit.mdx` name mismatch) which deterministically proves name-match fails.
- Reading-time recommendation: **MEDIUM** — inline helper is lower cost; `remark-reading-time` would also work; preference is aesthetic.
- UW brand: **HIGH** on availability; **MEDIUM** on whether the team has approval to ship — this is an organizational gate outside of research scope.

**Research date:** 2026-04-17
**Valid until:** 2026-07-17 (90 days for stable Astro 6.x minor line; re-verify on any major-version bump).

---
*Phase: 01-complete-the-site-surface*
*Research complete: 2026-04-17*
