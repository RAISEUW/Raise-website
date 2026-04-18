---
phase: 1
slug: complete-the-site-surface
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-17
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for Phase 1: Complete the Site Surface. Codifies the existing design system shipped in `site/src/styles/global.css` and specifies the new contracts this phase introduces (detail page polish, DET-02 cross-links, animation rules, UW/RAISE branding, RSS + 404 copy).
>
> Sources: `REQUIREMENTS.md` (13 reqs: DET-01..03, ANI-01..05, BRD-01..03, DISC-01..02), `ROADMAP.md` (Phase 1 success criteria), `.planning/phases/01-complete-the-site-surface/01-CONTEXT.md` (locked decisions D-01 typography weights, D-02 spacing extensions), existing codebase (`site/src/styles/global.css`, `site/src/components/*`, `site/src/pages/**/[slug].astro`, `site/src/layouts/Base.astro`).
>
> CONTEXT.md records two user-locked exceptions to the default checker heuristics — D-01 (4 font weights) and D-02 (4 additional spacing tokens) — both tied to the existing shipped codebase. No RESEARCH.md for this phase; technical choices are already made in the scaffold.

---

## Design System

| Property | Value | Source |
|----------|-------|--------|
| Tool | none (Astro-native, Tailwind v4 `@theme`) | Stack decision in STATE.md |
| Preset | not applicable | — |
| Component library | none (hand-authored Astro components) | `site/src/components/` |
| Icon library | none — inline SVG + Unicode glyphs (✉ 𝕏 ↗ → ←) | `Nav.astro`, `PersonCard.astro` |
| Display font | Fraunces Variable (opsz 9–144, wght 100–900, italic) | `global.css --font-display` |
| Body font | Inter Variable (wght 400/500/600) | `global.css --font-body` |
| Mono font | JetBrains Mono (wght 400/500) | `global.css --font-mono` |
| Radius tokens | `--radius-card: 12px`, `--radius-btn: 8px`, `--radius-pill: 9999px` | `global.css` |
| Easing tokens | `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)` | `global.css` |

**Registry/shadcn gate:** not applicable — Astro-native site with hand-authored components and Tailwind v4 `@theme` design tokens. No third-party component registry in use.

---

## Spacing Scale

All spacing is rem-based, convertible 1:1 to multiples of 4px (at default 16px root). Declared tokens derived from observed usage across all styled pages:

| Token | rem | px | Usage |
|-------|-----|----|-------|
| xs | 0.25 | 4 | Tag-to-tag gap, icon-text gap |
| sm | 0.5 | 8 | Meta-line gaps, tag row gap |
| md | 0.75 | 12 | Button internal padding x-axis compact |
| base | 1 | 16 | Default element spacing, card content padding |
| lg | 1.5 | 24 | Card padding, page gutter (`padding: 0 1.5rem`) |
| xl | 2 | 32 | Section-to-content gap, card grid gap (pillars) |
| 2xl | 3 | 48 | Major section breaks, detail-page container top padding |
| 3xl | 4 | 64 | Nav height (`64px`), page hero block |
| 4xl | 5 | 80 | Section vertical padding (`5rem 0`) |
| 5xl | 6 | 96 | Footer margin-top, detail-page bottom padding (`8rem` ≈ 128 also used) |
| 6xl | 8 | 128 | Detail-page bottom breathing room (`padding: 4rem 0 8rem`) |

**Container widths:**
- Detail pages: `max-width: 720–800px` (reading column; articles 720, publications/events/people 800)
- Indexes + homepage: `max-width: 1280px`
- Prose: `max-width: 72ch` (`.prose`)

**Exceptions:** `md: 12px`, `4xl: 80px`, `5xl: 96px`, `6xl: 128px` — all locked user-approved per `01-CONTEXT.md` D-02. All four tokens are multiples of 4 and already shipped in `site/src/styles/global.css`; every styled page depends on them. No additional exceptions beyond D-02.

---

## Typography

The contract declares **four semantic tiers**: Display, Heading, Body, Label. Each tier may use a `clamp()` envelope — fluid values within a tier count as a single size. Implementation-level role mappings (Page H1, Section H2, card titles, prose body, meta, eyebrows, kbd chips) are listed as notes under each tier so the executor can preserve the shipped detail. Weights follow the 4-weight system locked in `01-CONTEXT.md` D-01.

| Tier | Size | Weight | Line Height | Family |
|------|------|--------|-------------|--------|
| Display | `clamp(3rem, 8vw, 7rem)` = 48 → 112px | 300 | 1.1 | Fraunces |
| Heading | `clamp(1.25rem, 4vw, 4.5rem)` = 20 → 72px (fluid across H1/H2/H3 + card titles) | 400–600 | 1.1–1.4 | Fraunces (structural) / Inter (card titles) |
| Body | 16–17px (`1rem` default, `1.05rem` on article prose) | 400 | 1.7 | Inter |
| Label | 10–14px (eyebrow/kbd 10–11, meta/caption 13–14, UI label/nav 14) | 500 | 1–1.5 | JetBrains Mono (eyebrow/kbd) / Inter (UI label + meta) |

### Tier implementation notes

**Display tier** — single role: hero H1 only.
- Hero H1 (`.hero-heading`): `clamp(3rem, 8vw, 7rem)`, weight 300, line-height 1.1, Fraunces; italic `<em>` in the accent color (e.g. `The public good.`).

**Heading tier** — collapses structural headings + card titles; fluid envelope covers all four roles.
- Page H1 (index/detail): `clamp(2rem, 5vw, 4.5rem)` = 32 → 72px, weight 300–400, line-height 1.15–1.2, Fraunces.
- Section H2: `clamp(1.75rem, 4vw, 3.5rem)` = 28 → 56px, weight 400, line-height 1.1, Fraunces.
- Subsection H3: `clamp(1.25rem, 2.5vw, 2rem)` = 20 → 32px, weight 400, line-height 1.1, Fraunces.
- Card title: 16–20px fixed (publication/event/person 16px, article 20px), weight 400 (pub/event) or 600 (article/person), line-height 1.3–1.4. Articles and people use Fraunces; publications and events use Inter for card titles.
- All Fraunces headings use baseline `font-weight: 400`, `line-height: 1.1`, `letter-spacing: -0.02em`, overridden per surface.

**Body tier** — default reading text.
- Body: 16px (1rem), weight 400, line-height 1.7, Inter.
- Prose body: 17px (1.05rem) on article detail, 16px (1rem) on other `.prose` surfaces, weight 400, line-height 1.7, Inter. `<em>` uses Fraunces italic.

**Label tier** — all UI text below body (nav, meta, eyebrows, chips, kbd).
- UI label / nav link: 14px (0.875rem), weight 500, line-height 1.4, Inter.
- Meta / caption: 13–14px (0.8–0.875rem), weight 400–500, line-height 1.5–1.7, JetBrains Mono or Inter (mono on date/venue metadata, sans on descriptive captions).
- Eyebrow / tag / kbd: 10–11px (0.65–0.7rem), weight 500, line-height 1, JetBrains Mono uppercase with `letter-spacing: 0.1em–0.12em`. Color = `--color-accent` when a section label, `--color-muted` when a card meta label.

**Weight policy:** The design uses **four Inter/Fraunces weights** (300 / 400 / 500 / 600) — this is the existing shipped Inter + Fraunces variable-font system documented and locked as **D-01 in `01-CONTEXT.md`**. Summary: 300 for editorial hero display, 400 for body + structural headings, 500 for UI labels and eyebrows, 600 for card titles and wordmarks. Phase 1 MUST NOT introduce additional weights; reducing the set would regress shipped components. Italic is used only on `<em>` in the hero heading (via Fraunces italic) and on `.prose em`.

---

## Color

Tokens defined in `global.css @theme`:

```
--color-base: #0A0A0B       /* near-black, foreground in light mode / background in dark */
--color-surface: #FAFAF7    /* off-white, background in light mode / foreground in dark */
--color-accent: #4B2E83     /* UW purple */
--color-accent-muted: #7C5CBF
--color-muted: #6B7280      /* neutral text */
--color-border: #E5E5E3
--color-border-dark: #1F1F20
```

| Role | Value | Usage |
|------|-------|-------|
| Dominant (≈60%) | `#FAFAF7` (`--color-surface`) | Body background, hero background, content surfaces |
| Secondary (≈30%) | `color-mix(in srgb, --color-base 3–6%, --color-surface)` + borders `#E5E5E3` | Footer bg (`base 3%`), stats bg (`accent 4%`), CTA box (`accent 3%`), card tints (`base 4–6%`), nav blur (`surface 85%` + backdrop-blur), card borders |
| Accent (≈10%) | `#4B2E83` (`--color-accent`) | **Reserved elements only — see list below** |
| Accent muted | `#7C5CBF` (`--color-accent-muted`) | Card hover border (`pillar-card:hover`, `event-card:hover`, `article-card:hover`, `person-card:hover`); hero orb secondary gradient |
| Text primary | `--color-base` light / `--color-surface` dark | Default body text |
| Text muted | `--color-muted` (`#6B7280`) | Secondary meta, breadcrumbs, footer links, descriptions |
| Destructive | **N/A in Phase 1** | No destructive actions in Phase 1 surface. CMS (Phase 3) will introduce; defer the destructive token to that phase. |

**Accent reserved for** (explicit list — not "all interactive"):
1. Section eyebrow labels (`.section-label`) — `color: var(--color-accent)`
2. Tag chips (`.tag`) — `background: accent 12%`, `color: accent`, `border: accent 20%`
3. Upcoming event badges + banners (`.upcoming-badge`, `.upcoming-banner`) — accent text, accent border, accent 4% bg when full card
4. Hero heading `<em>` — `.hero-heading em { color: var(--color-accent) }`
5. Person initials fallback — accent text on `accent 15%` background circle
6. Logo-UW mono chip (`.logo-uw`) — accent text + accent border
7. Blockquote left border in prose (`.prose blockquote`) — `border-left: 3px solid accent`
8. Primary button hover state — background shifts to accent on hover only (baseline primary btn is `--color-base`)
9. Stats section subtle wash — `accent 4%` background
10. CTA box subtle wash — `accent 3%` background
11. Pillar number eyebrow (`.pillar-num`) — accent text
12. Pagefind search result highlights (inherits from existing Pagefind UI overrides)

**Accent is NOT used for:** baseline button backgrounds, baseline link color (links inherit), card borders (those use `--color-border` with `--color-accent-muted` on hover), body text.

**Dark mode:** Every color token has a dark-mode media query counterpart (`@media (prefers-color-scheme: dark)`). Accent hex (`#4B2E83`) is the same in both modes per UW brand; pair with `--color-border-dark` (`#1F1F20`) and `--color-surface`/`--color-base` swapped.

---

## Copywriting Contract

Phase 1 introduces copy for detail pages, branding, RSS, search empty/404, and animation polish. No destructive actions in this phase.

### Primary CTAs (per surface)

| Surface | CTA Label | Style |
|---------|-----------|-------|
| Homepage hero | `Our Research` + `Get Involved →` | `btn-primary` + `btn-ghost` |
| Homepage CTA box | `Get Involved` + `Join Slack ↗` | `btn-primary` + `btn-ghost` |
| Upcoming event detail | `Register →` | `action-btn--primary` |
| Past event detail | `Watch Recording ↗` + `View Slides ↗` | `action-btn--primary` + `action-btn` |
| Publication detail | `Download PDF ↗` + `View on DOI ↗` | `action-btn--primary` + `action-btn` |
| Article detail | (none — content-only page) | — |
| Person detail | `✉ {email}`, `𝕏 @{handle}`, `LinkedIn ↗`, `Website ↗` (stacked contact links, not buttons) | `.person-contact-link` |
| Breadcrumb back-link | `← Events` / `← People` / `← Articles` / `← Publications` | `.breadcrumb a` muted → base on hover |

**CTA rule:** External links append `↗`, internal forward-links append `→`, breadcrumb back-links prepend `←`. All three glyphs render at body font size inline; no icon swap required.

### Labels and Eyebrows

| Element | Copy | Style |
|---------|------|-------|
| Section eyebrow (events page) | `Community` | `.section-label` accent mono |
| Section eyebrow (publications page) | `Research` | same |
| Section eyebrow (articles page) | `From the Center` | same |
| Section eyebrow (people page) | `Team` | same |
| Event past-events heading | `Past Events` | `.events-section-title` mono |
| Event upcoming heading | `Upcoming` | same |
| People group headings | `Leadership` / `Affiliate Faculty` / `Staff` / `Alumni` (map from `role` enum) | same |
| Publication abstract label | `Abstract` | uppercase mono |
| Publication citation label | `Cite as` | uppercase mono |

### Empty States

| Surface | Heading | Body |
|---------|---------|------|
| Events past (no past events) | — (existing) | `No past events yet.` italic muted |
| Events upcoming (no upcoming) | — | Hide section entirely (no empty copy) — current behavior, keep |
| Articles index (no articles) | `No articles yet.` | `Check back soon — the team publishes new pieces regularly.` |
| People linked publications (DET-02) | `No linked publications yet.` | italic muted, small |
| People linked talks (DET-02) | `No linked talks yet.` | italic muted, small |
| Publications index (no matches in filter) | `No publications match that filter.` | `Try a different topic or year.` |
| Search page (no results) | (inherits Pagefind default: `No results found.`) | — |

### Error / 404 Copy

Phase 1 adds a 404 page (needed for RSS and deployed site). Use minimal editorial tone matching the hero.

| Element | Copy |
|---------|------|
| 404 heading | `Page not found.` (Fraunces, 300 weight, italic on `not`) |
| 404 body | `That page may have moved. Try the main navigation or search for what you're looking for.` |
| 404 CTA | `Go home` (`btn-primary`) + `Search the site →` (`btn-ghost`, links to `/search`) |

### RSS Metadata (DISC-01)

| Field | Value |
|-------|-------|
| Feed title | `RAISE — Articles & Events` |
| Feed description | `Latest articles and upcoming talks from the UW Center for Responsibility in AI Systems and Experiences.` |
| Feed site | `Astro.site` (canonical site URL) |
| Feed language | `en-us` |
| Item title pattern (articles) | `{title}` |
| Item title pattern (events) | `{speaker}: {title}` |
| Item pubDate | `data.date` (Date) |
| Item description (articles) | `{excerpt ?? title}` |
| Item description (events) | `{abstract ?? "Upcoming talk at RAISE."}` |

### Destructive Actions

**None in Phase 1.** No delete, remove, unpublish, or irreversible actions exist on the public surface. Phase 3 (CMS) will introduce admin-side destructive flows and must declare its own destructive token + confirmation pattern at that time.

---

## Branding Contract (BRD-01 / BRD-02 / BRD-03)

### Nav Lockup

Existing Nav displays a text-only lockup: `RAISE` (Fraunces 600 weight, tracked tight) + `UW` (mono chip, accent border and text). This satisfies BRD-02 without official asset.

**BRD-01 (UW official logo) strategy with fallback:**
- **Preferred:** UW "W" mark or signature purple logotype in SVG form, placed in the **Footer** `.footer-brand` block (beside or below the `RAISE` wordmark), max height 32px, preserves UW brand clear-space.
- **Fallback (if UW asset not available at implementation):** retain the existing `RAISE` + `UW` mono-chip lockup in Nav, and add a text-only affiliation line in Footer: `University of Washington` rendered in `--font-body` 500 weight, 14px, `--color-base` (inherits dark mode).
- **Fallback must state in frontmatter comment:** `// BRD-01 fallback — UW official asset pending` until asset is swapped in.

**RAISE logomark (BRD-02):**
- **Preferred:** custom RAISE logomark SVG, max height 24px in Nav, 32px in Footer, alongside wordmark.
- **Fallback:** keep current `RAISE` Fraunces wordmark in Nav (already in place, already on brand). Document as "typographic logomark" until custom mark is commissioned.

**BRD-03 visual QA checklist** (applied across every page at end of Phase 1):
- All headings use Fraunces — no Inter-as-heading regressions
- All eyebrows use JetBrains Mono uppercase with `0.1em+` letter-spacing
- Accent `#4B2E83` appears only in the reserved-for list above
- Cards have `border-radius: 12px` (`--radius-card`), buttons `8px` (`--radius-btn`), pills `9999px`
- Dark mode swap verified on: homepage, all 4 indexes, all 4 detail pages, AI for All, Get Involved, Search, 404
- Spacing rhythm: page gutter `1.5rem`, section padding `5rem 0`, detail padding `4rem 0 8rem`

### Favicon

- `favicon.svg` exists; verify it uses the RAISE mark or `R` Fraunces letterform in UW purple — if not, update to match.

---

## Animation Contract (ANI-01 / ANI-02 / ANI-03 / ANI-04 / ANI-05)

### Duration + Easing Caps

| Property | Value |
|----------|-------|
| Maximum duration | 600ms (hard cap per `REQUIREMENTS.md ANI-01/ANI-02`) |
| Default easing | `var(--ease-out-expo)` = `cubic-bezier(0.16, 1, 0.3, 1)` |
| Secondary easing | `var(--ease-out-quart)` = `cubic-bezier(0.25, 1, 0.5, 1)` |
| UI micro-transitions (hover, color) | 200ms linear or 200ms `ease-out-expo` |

### Hero Load Animation (ANI-02)

Pattern: stagger text reveal via `.animate-fade-up` + `.animate-delay-{100|200|300|400}` classes, already defined in `global.css`. Applies to:
- `.hero-label` (immediate)
- `.hero-heading` (delay 100ms)
- `.hero-sub` (delay 200ms)
- `.hero-actions` (delay 300ms)

Keyframe: `translateY(20px) + opacity 0` → `translateY(0) + opacity 1`, duration 600ms, easing `--ease-out-expo`. No modification needed for the homepage; **replicate the same pattern on each index page hero** (publications, events, articles, people, AI for All, Get Involved, Search — use 2-step stagger minimum: eyebrow + heading + description).

### Scroll Reveal (ANI-01)

Pattern: `.reveal` class starts at `opacity: 0, translateY(24px)`, `.reveal.visible` transitions to `opacity: 1, translateY(0)` over 600ms `--ease-out-expo`. Observed via IntersectionObserver with `{ threshold: 0.15 }` — already implemented inline on homepage (`src/pages/index.astro` bottom script).

**Phase 1 action:** lift the IntersectionObserver script from `index.astro` into a shared client script (suggested path: `src/scripts/reveal.ts`), and apply `.reveal` class to:
- Pillar cards (already applied)
- Stats (already applied)
- Event cards on events index
- Article cards on articles index
- Person cards on people index
- Publication cards on publications index
- Section `<section>` wrappers on detail pages (abstract, citation, linked content blocks)

### Page Transitions (ANI-03)

Use Astro `<ViewTransitions />` component in `Base.astro` head. Default browser fade-and-swap transition — no custom per-route animation in Phase 1. Ensure view-transition-name is set on the Nav header so it persists across navigation.

### Reduced Motion (ANI-04)

Already enforced globally in `global.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Lenis is disabled conditionally in `Base.astro`: `if (!prefersReducedMotion) { new Lenis(...) }`. This remains the pattern — **do not move Lenis init outside the reduced-motion check.**

Also: the IntersectionObserver should set `.visible` immediately on mount when `prefers-reduced-motion: reduce` is set (no fade), so content is not stuck invisible.

### Lenis Smooth Scroll Tuning (ANI-05)

Current config: `new Lenis({ lerp: 0.09, smoothWheel: true })`. Acceptance contract:
- `lerp: 0.09` — mildly smooth, not "greasy"
- `smoothWheel: true` — mouse wheel smoothed
- **Do not enable `smoothTouch` on touch devices** (causes janky scroll on iOS)
- Verify no hash-link (`#anchor`) regressions — Lenis must still scroll to hash targets

### Hover Micro-Interactions

Existing patterns (keep, do not redesign):
- Cards: `translateY(-2px)` to `-4px` on hover, `border-color: --color-accent-muted`, 250–300ms `--ease-out-expo`
- Buttons: `translateY(-1px)` on hover, 200ms `--ease-out-expo`
- Article cover images: `transform: scale(1.04)` on card hover, 400ms `--ease-out-expo`
- Links: underline appears on hover (`text-underline-offset: 3px`)

---

## Detail Page Contracts

### DET-01: Event Detail

**Already stubbed** at `src/pages/events/[slug].astro`. Phase 1 polish:
- Add scroll-reveal to `.event-abstract` and `.event-body`
- Add `<ViewTransitions />` tag for ANI-03
- Ensure `time` data attribute formatting is consistent
- Hero block (title + speaker + meta bar) should use `.animate-fade-up` stagger like homepage hero

Fields rendered: breadcrumb, `Upcoming` banner (if `upcoming`), date/time/location meta-bar, title (H1 clamp), speaker line, speaker bio (blockquoted), action buttons (Recording, Slides, Register), Abstract section, MDX body.

### DET-02: Person Profile

**Already stubbed** at `src/pages/people/[slug].astro`. Phase 1 polish + **new "linked content" section**:

New section below `.person-body` MDX:
- Heading 1: `.linked-section-label` eyebrow mono uppercase: `Selected Publications`
- List: stack of 3–5 publication titles + venue/year in mono meta (reuse `.pub-card` compact variant or new `.linked-pub-item`)
- Heading 2: eyebrow mono: `Talks`
- List: stack of event titles + date mono meta
- Empty state copy as defined above

**Linking convention is a planner decision** — currently `people` collection has no `publicationIds` or `eventIds` field. The planner must choose between:
  1. **Name-match** — runtime filter of `publications.data.authors` and `events.data.speaker` by `person.data.name` (string match). Simpler, no schema change, but fragile to name variants.
  2. **Explicit ID field** — add `linkedPublications: z.array(z.string()).default([])` and `linkedTalks: z.array(z.string()).default([])` to the `people` schema; reference publication/event `id`s.

This contract assumes the link resolves; the visual design is the same either way. **Flag to planner: resolve linking strategy before implementation.**

### DET-03: Article Detail

**Already stubbed** at `src/pages/articles/[slug].astro`. Phase 1 polish:
- **Add reading-time estimate** computed from MDX body word count (Astro `render()` already returns remark plugins output — use `remark-reading-time` or inline word-count helper). Render in `.article-byline` after date: `{author} · {date} · {readingTime} read`.
- Add scroll-reveal to `.article-body`
- Add `<ViewTransitions />` tag
- Keep cover image hero at `max-height: 480px`, unchanged

### DET-04 (implied): Publication Detail

**Already fully styled and functional.** Phase 1 touch: add scroll-reveal + View Transitions only. No structural change.

---

## Discovery Contracts

### DISC-01: RSS Feed

- Route: `/rss.xml` (already stubbed at `src/pages/rss.xml.ts`)
- Content: articles (non-draft) + upcoming + recent past events (last 20)
- Metadata per RSS Metadata table above
- Already linked in `Base.astro` head: `<link rel="alternate" type="application/rss+xml" ... href="/rss.xml" />`
- Verify feed validates at `https://validator.w3.org/feed/`

### DISC-02: Pagefind Search

- Already integrated via `astro-pagefind` in `package.json`
- Search page: `src/pages/search.astro` (Pagefind UI with design-system overrides)
- Indexes: publications, events, articles, people at build time
- Keyboard shortcut `/` already wired in `Base.astro`
- Phase 1 action: verify index is built after `astro build` and that `data-pagefind-body` attributes exist on each collection's render wrapper. If missing, add `<div data-pagefind-body>` wrapper around each detail-page `<Content />`.

---

## Component Inventory (Phase 1)

| Component | Path | Status | Phase 1 Action |
|-----------|------|--------|----------------|
| `Base.astro` | `src/layouts/` | Shipped | Add `<ViewTransitions />` + lift reveal script |
| `Nav.astro` | `src/components/` | Shipped | Branding swap (if UW asset arrives) |
| `Footer.astro` | `src/components/` | Shipped | Branding swap (if UW asset arrives) |
| `ArticleCard.astro` | `src/components/` | Shipped | No change |
| `EventCard.astro` | `src/components/` | Shipped | No change |
| `PersonCard.astro` | `src/components/` | Shipped | No change |
| `PublicationCard.astro` | `src/components/` | Shipped | No change |
| `events/[slug].astro` | `src/pages/` | Stubbed | Polish + animations |
| `people/[slug].astro` | `src/pages/` | Stubbed | Polish + animations + linked content section |
| `articles/[slug].astro` | `src/pages/` | Stubbed | Polish + reading time + animations |
| `publications/[slug].astro` | `src/pages/` | Validated | Animation hook only |
| `404.astro` | `src/pages/` | **Missing — NEW** | Create per 404 copy contract |
| `scripts/reveal.ts` | `src/scripts/` | **Missing — NEW** | Extract from homepage |
| `LinkedContentList.astro` (or inlined) | `src/components/` | **Missing — NEW** | For DET-02 linked pubs/talks |
| `rss.xml.ts` | `src/pages/` | Stubbed | Complete per DISC-01 contract |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable (Astro-native site, no registry consumers) |
| Third-party registries | none | not applicable |

This phase does not introduce any external component registries. All components are hand-authored Astro/TypeScript in-repo.

---

## Open Items for Planner

1. **DET-02 linking strategy** — name-match vs. explicit `linkedPublications`/`linkedTalks` ID fields in `people` schema. Planner decides; UI contract is identical either way.
2. **UW official logo availability** — if asset obtained before implementation, place in Footer per BRD-01 preferred; otherwise ship typographic fallback and open follow-up task.
3. **Reading-time dependency** — decide between `remark-reading-time` (adds MDX plugin) vs. inline `Math.ceil(wordCount / 200)` helper. UI shows result either way.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
