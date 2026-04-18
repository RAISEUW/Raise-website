# Roadmap: RAISE Website Redesign

**Created:** 2026-04-17
**Granularity:** coarse (3-5 phases, 1-3 plans each)
**Mode:** yolo
**Core Value:** A beautiful, fast, searchable home for RAISE's research, people, events, and articles — that anyone on the team can keep up-to-date.

---

## Phases

- [x] **Phase 1: Complete the Site Surface** — Finish detail pages, animation polish, branding integration, and discovery plumbing (RSS + Pagefind).
- [ ] **Phase 2: Content Migration** — Migrate all ~40 publications, 50+ events, and 16 people from the existing WordPress site into MDX with assets.
- [ ] **Phase 3: CMS & Production Launch** — Wire Decap CMS for non-dev editors, deploy to Cloudflare Pages with redirects, verify Lighthouse scores, and ship the contact form.

---

## Phase Details

### Phase 1: Complete the Site Surface

**Goal:** The site looks and feels complete — every route renders, every page is discoverable, every interaction feels refined, and the RAISE + UW brand identity is present.

**Depends on:** Nothing (scaffold already built)

**Requirements:** DET-01, DET-02, DET-03, ANI-01, ANI-02, ANI-03, ANI-04, ANI-05, BRD-01, BRD-02, BRD-03, DISC-01, DISC-02

**Success Criteria** (what must be TRUE):
  1. Visitor can navigate from any index page (events, people, articles) to a corresponding detail page and see full content (speaker/bio/prose, related links, metadata)
  2. Visitor sees subtle, purposeful animation across the site — hero loads with staggered reveal, content cards fade-in on scroll, transitions between pages are smooth — and all animations disable cleanly when `prefers-reduced-motion: reduce` is set
  3. Visitor sees the UW brand lockup and RAISE logomark in the Nav and Footer, visually consistent with UW brand guidelines across every page
  4. Visitor can subscribe to `/rss.xml` in any reader and receive articles + events with correct titles, dates, and links
  5. Visitor using the search page can find any publication, event, article, or person from the existing sample content by keyword (Pagefind indexes all collections at build)

**Plans:** 3/3 plans complete
- [x] 01-complete-the-site-surface/01-01-PLAN.md — Foundation: ClientRouter, scroll-reveal script, extended people schema
- [x] 01-complete-the-site-surface/01-02-PLAN.md — Detail pages: DET-01/02/03 polish, LinkedContentList, 404 page
- [x] 01-complete-the-site-surface/01-03-PLAN.md — Index surfaces, UW branding, RSS + Pagefind, BRD-03 QA checkpoint
**UI hint:** yes

---

### Phase 2: Content Migration

**Goal:** The site is populated with the full real-world RAISE content — every publication, event, and person from raise.uw.edu lives in MDX with correct metadata and associated assets.

**Depends on:** Phase 1 (detail page templates must exist before real content can render)

**Requirements:** MIG-01, MIG-02, MIG-03, MIG-04, MIG-05

**Success Criteria** (what must be TRUE):
  1. Visitor browsing `/publications` sees all ~40 real publications from raise.uw.edu with accurate title, authors, venue, date, topics, and working PDF/DOI links
  2. Visitor browsing `/events` sees all 50+ real events (upcoming + past) with accurate speaker, date, location, abstract, and recording links where available
  3. Visitor browsing `/people` sees all 16 real team members grouped by role with correct name, title, department, photo, and research areas
  4. Visitor can read at least one published article authored specifically for the new site (sample content demonstrating the article pipeline)
  5. All author photos and publication PDFs load locally from `public/images/` and `public/pdfs/` (no broken or external-only asset links)

**Plans:** TBD

---

### Phase 3: CMS & Production Launch

**Goal:** Non-technical editors can manage content through a web interface, the site is live on Cloudflare Pages with old URLs redirecting, Lighthouse confirms performance, and the contact form delivers to the team.

**Depends on:** Phase 2 (CMS collections are easier to verify with real content; deployment validates the full site)

**Requirements:** CMS-01, CMS-02, CMS-03, DEPL-01, DEPL-02, DEPL-03, DEPL-04, DEPL-05

**Success Criteria** (what must be TRUE):
  1. Non-dev editor can visit `/admin`, log in via GitHub OAuth, and create/edit/publish an article, event, person, or publication — and the change commits MDX to the repo and triggers a Cloudflare deploy
  2. Site is live at a Cloudflare Pages URL with `pnpm build` succeeding and `dist/` served (ready for DNS cutover, staged before raise.uw.edu)
  3. Visitor following an old WordPress URL (e.g., `/talksevents/`, legacy `/people/` or `/publications/` paths) lands on the correct new page via 301 redirect
  4. Homepage scores ≥ 95 on all four Lighthouse categories (Performance, Accessibility, Best Practices, SEO) measured against the deployed Cloudflare Pages URL
  5. Visitor submitting the contact form on Get Involved receives a success state and the RAISE team receives a notification (via Cloudflare Pages Function or Formspree)

**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Complete the Site Surface | 3/3 | Complete    | 2026-04-18 |
| 2. Content Migration | 0/TBD | Not started | — |
| 3. CMS & Production Launch | 0/TBD | Not started | — |

---

## Coverage Validation

- **v1 requirements total:** 26
- **Mapped to phases:** 26
- **Unmapped:** 0

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1 | DET-01, DET-02, DET-03, ANI-01, ANI-02, ANI-03, ANI-04, ANI-05, BRD-01, BRD-02, BRD-03, DISC-01, DISC-02 | 13 |
| 2 | MIG-01, MIG-02, MIG-03, MIG-04, MIG-05 | 5 |
| 3 | CMS-01, CMS-02, CMS-03, DEPL-01, DEPL-02, DEPL-03, DEPL-04, DEPL-05 | 8 |
| **Total** | | **26** |

All v1 requirements are mapped exactly once. No orphans, no duplicates.

---

## Notes

- **Scaffold is pre-complete:** The Astro 6 scaffold, design system, index pages, and publications detail page were validated in Phase 1 of the original initialization. This roadmap covers only the remaining active v1 work.
- **Pagefind dual-touch:** DISC-02 is satisfied in Phase 1 (scaffold indexes current sample content) and naturally re-verified after Phase 2 migration (full real content gets indexed on next build). If the full-corpus index verification is not satisfied by Phase 1 alone, that validation is re-run in Phase 3 Lighthouse/QA.
- **Dark mode:** Already validated in the scaffold. If visual QA in BRD-03 surfaces dark-mode regressions from new detail pages or branded assets, they are addressed as part of Phase 1 BRD-03.
- **Research pillar pages:** Deferred to v2 (RES-01, RES-02). The existing AI for All page covers the current public-facing need.

---

*Roadmap defined: 2026-04-17*
*Last updated: 2026-04-18 (Phase 1 complete)*
