# Phase 1: Complete the Site Surface - Context

**Gathered:** 2026-04-17
**Status:** Approved — locked decisions for UI checker

<domain>
## Phase Boundary

Finish detail pages (event, person, article), animation polish (scroll reveal, hero load, page transitions, reduced-motion, Lenis tuning), branding integration (UW lockup, RAISE logomark, visual QA), and discovery plumbing (RSS feed, Pagefind search). The site looks and feels complete — every route renders, every page is discoverable, every interaction feels refined, and the RAISE + UW brand identity is present. Content migration is Phase 2; CMS + deployment is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Typography weights (locked shipped system)

- **D-01:** Typography uses **4 weights (300 / 400 / 500 / 600)** — this is the existing shipped Inter + Fraunces variable font system in `site/src/styles/global.css`. Reducing to 2 weights would regress existing components (hero heading at 300, body at 400, UI labels and eyebrows at 500, card titles and prose strong at 600). This is a formally approved exception to the "2 weights max" default. Phase 1 MUST NOT introduce any additional weights.
  - 300 — editorial hero display (hero H1 only, via `.hero-heading`)
  - 400 — body text, prose body, display default (Fraunces h1/h2/h3/h4 baseline)
  - 500 — UI labels, nav links, eyebrows, meta, kbd chips (JetBrains Mono + Inter)
  - 600 — card titles (articles, people cards), logo wordmark, `.prose strong`

### Spacing scale (locked shipped system)

- **D-02:** Spacing scale **extends** the standard checker set `{4, 8, 16, 24, 32, 48, 64}` with four additional tokens that are already shipped in `site/src/styles/global.css` and widely used across page templates. Changing these would regress shipped layout rhythm on every styled page. All values are multiples of 4. This is a formally approved exception.
  - `md: 12px` — compact button internal padding (x-axis)
  - `4xl: 80px` (`5rem`) — section vertical padding (`5rem 0` on landing sections)
  - `5xl: 96px` (`6rem`) — footer top margin, detail-page bottom padding
  - `6xl: 128px` (`8rem`) — detail-page bottom breathing room (`padding: 4rem 0 8rem`)

  Full scale in use: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128`.

### Claude's Discretion
None for typography weights and spacing scale — both are locked to the existing shipped codebase. All other UI decisions remain per the UI-SPEC.md contract.

</decisions>

<specifics>
## Specific Ideas

- The shipped `global.css` is the canonical source of truth. Any conflict between UI-SPEC.md and `global.css` should be resolved in favor of `global.css` — the spec documents what ships, it does not override it.
- "2 weights max" is a design heuristic for new design systems without existing type discipline. RAISE has a three-family variable-font system (Fraunces + Inter + JetBrains Mono) where weight differentiates role within a family. Reducing to 2 weights would erase the editorial/UI/label distinction that the heading-in-Fraunces-300 vs. card-title-in-Inter-600 contrast provides.
- "Standard spacing set" (4/8/16/24/32/48/64) is also a heuristic. RAISE's extensions are strictly multiples of 4, each tied to observed usage on shipped pages.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Typography + spacing (locked shipped systems)
- `site/src/styles/global.css` — Defines all CSS custom properties, font-family tokens, radius tokens, easing tokens, base typography (h1/h2/h3/h4 clamps + weights + letter-spacing), Lenis-compatible smooth-scroll setup, and the prefers-reduced-motion guard. This is the source of truth for D-01 and D-02.
- `.planning/phases/01-complete-the-site-surface/01-UI-SPEC.md` — Full UI design contract for Phase 1. References D-01 in the Typography section (weight policy) and D-02 in the Spacing section (exceptions).

### Phase 1 scope
- `.planning/ROADMAP.md` §"Phase 1: Complete the Site Surface" — Phase goal, requirements mapping (DET-01..03, ANI-01..05, BRD-01..03, DISC-01..02), success criteria, plan dependencies.
- `.planning/REQUIREMENTS.md` §"v1 Requirements" — 13 requirement rows for Phase 1. In particular **BRD-03** ("typography scale, spacing rhythm, color usage consistent") is the visual-QA criterion that applies across every Phase 1 page.

### Shipped components (reference, do not modify)
- `site/src/layouts/Base.astro` — Nav + Footer + Lenis + `/` keyboard shortcut + prefers-reduced-motion guard.
- `site/src/components/Nav.astro`, `Footer.astro` — BRD-01/BRD-02 current state (typographic lockup + mono UW chip).
- `site/src/components/ArticleCard.astro`, `EventCard.astro`, `PersonCard.astro`, `PublicationCard.astro` — Card-title typography choices (600 weight on articles + people, 400 on publications/events) that D-01 must preserve.
- `site/src/pages/events/[slug].astro`, `people/[slug].astro`, `articles/[slug].astro`, `publications/[slug].astro` — Detail page stubs to polish.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/src/styles/global.css` exposes: 3 font-family tokens, 6 color tokens (+ 2 border variants), 3 radius tokens, 2 easing tokens, `.animate-fade-up` + `.animate-delay-{100..400}` stagger utilities, `.reveal` / `.reveal.visible` scroll-reveal classes with prefers-reduced-motion guard.
- `site/src/pages/index.astro` has an inline IntersectionObserver for `.reveal` that Phase 1 plans to lift into `src/scripts/reveal.ts` for reuse on index + detail pages.

### Established Patterns
- **Weight-as-role:** Fraunces 300 for editorial hero italics; Fraunces 400 for structural headings; Inter 400 for body; Inter/Mono 500 for UI labels and eyebrows; Inter 600 for card titles and wordmarks. This four-weight discipline is what D-01 locks.
- **Spacing-as-rhythm:** `1.5rem` (24px) for page gutter, `5rem 0` (80px) for section padding, `4rem 0 8rem` (64px top / 128px bottom) for detail pages. This is what D-02 locks.
- **Fluid-first typography:** All structural headings use `clamp()` with a vw-scaled middle value. The UI-SPEC's 4-tier model (Display / Heading / Body / Label) treats each `clamp()` envelope as one logical size.

### Integration Points
- Phase 1 new code (`404.astro`, `src/scripts/reveal.ts`, `LinkedContentList` for DET-02, completed `rss.xml.ts`) MUST consume the existing `global.css` tokens — no new spacing or font-weight values may be introduced.
- BRD-03 visual QA (end of Phase 1) verifies typography + spacing + color consistency; that check is what D-01 and D-02 are protecting.

</code_context>

<deferred>
## Deferred Ideas

- Custom RAISE logomark SVG commission (if not obtained before Phase 1 ships, fallback to typographic lockup per UI-SPEC Branding Contract, open follow-up task for v2).
- UW official logo asset (same pattern — fallback to text-only affiliation line if asset unavailable).
- Research pillar pages (RES-01, RES-02) — explicitly v2 per ROADMAP.md.
- Destructive-action token — deferred to Phase 3 (CMS admin flows).
- Subscribe form, AI Clinic homepage card, advanced search, video embeds — all v2 per REQUIREMENTS.md.

</deferred>

---

*Phase: 01-complete-the-site-surface*
*Context gathered: 2026-04-17*
