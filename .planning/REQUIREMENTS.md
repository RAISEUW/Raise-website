# Requirements: RAISE Website Redesign

**Defined:** 2026-04-17
**Core Value:** A beautiful, fast, searchable home for RAISE's research, people, events, and articles — that anyone on the team can keep up-to-date.

---

## Already Complete (Validated)

The following are built and working in `/Users/mayuri/Projects/RAISE/site/`:

- ✓ Astro 6 + Tailwind v4 + MDX + Pagefind scaffold
- ✓ Content Collections (publications, events, articles, people — Zod schemas, glob loaders)
- ✓ Global design system (Fraunces + Inter + JetBrains Mono, UW purple #4B2E83, CSS design tokens)
- ✓ Base layout (Nav, Footer, Lenis smooth scroll, `/` keyboard shortcut for search)
- ✓ Homepage (animated hero, pillars, upcoming events, recent articles, stats, partners, CTA)
- ✓ Publications index (year + topic filter sidebar)
- ✓ Publications detail page (slug routing, MDX render, PDF/DOI links)
- ✓ Events index (upcoming + past sections)
- ✓ Articles index (tag filter)
- ✓ People index (grouped by role)
- ✓ Search page (Pagefind UI with design system overrides)
- ✓ AI for All page
- ✓ Get Involved page (contact channels, form placeholder)
- ✓ Sample MDX content (3 people, 2 publications, 2 events)
- ✓ Dark mode across all pages

---

## v1 Requirements

### Detail Pages

- [ ] **DET-01**: Visitor can view an event detail page with speaker, abstract, location/time, recording link, and slides link
- [ ] **DET-02**: Visitor can view a person profile page with full bio, research areas, linked publications, and linked talks
- [ ] **DET-03**: Visitor can view an article detail page with full MDX prose, author, date, tags, and reading time

### Content Migration

- [ ] **MIG-01**: All ~40 publications from raise.uw.edu are migrated to MDX with accurate frontmatter (title, authors, venue, date, topics, PDF, DOI)
- [ ] **MIG-02**: All 50+ events from raise.uw.edu are migrated to MDX with accurate frontmatter (title, speaker, date, location, abstract, recording, upcoming flag)
- [ ] **MIG-03**: All 16 people from raise.uw.edu are migrated to MDX with accurate frontmatter (name, role, title, dept, photo, researchAreas)
- [ ] **MIG-04**: At least 1 article is authored and published as a sample (new content, not migrated)
- [ ] **MIG-05**: Author photos and publication PDFs are downloaded to public/images/ and public/pdfs/

### Animation & Polish

- [ ] **ANI-01**: Scroll-triggered reveal animations on content cards and sections (IntersectionObserver + Motion, ≤600ms, subtle translate+fade)
- [ ] **ANI-02**: Hero section has a load animation (stagger text reveal, ≤600ms, Fraunces heading)
- [ ] **ANI-03**: Page transitions use Astro View Transitions between routes
- [ ] **ANI-04**: All animations respect `prefers-reduced-motion: reduce` — disabled when set
- [ ] **ANI-05**: Lenis smooth scroll is active on all pages (already started, needs tuning)

### Branding

- [ ] **BRD-01**: UW official logo/seal is integrated in Nav and/or Footer (per UW brand guidelines)
- [ ] **BRD-02**: RAISE logomark is displayed in Nav alongside UW affiliation
- [ ] **BRD-03**: All pages pass visual QA — typography scale, spacing rhythm, color usage consistent

### CMS

- [ ] **CMS-01**: Decap CMS is accessible at /admin — non-dev editors can log in via GitHub OAuth
- [ ] **CMS-02**: Decap CMS can create, edit, and publish articles (commits MDX to repo, triggers Cloudflare deploy)
- [ ] **CMS-03**: Decap CMS can create and edit events, people, and publications entries

### Feed & Discovery

- [ ] **DISC-01**: RSS feed is published at /rss.xml (includes articles + events with correct metadata)
- [ ] **DISC-02**: Pagefind search indexes all content collections at build time — visitor can find any publication, event, article, or person by keyword

### Deployment

- [ ] **DEPL-01**: Site builds successfully on Cloudflare Pages (build command: `pnpm build`, output: `dist/`)
- [ ] **DEPL-02**: Site is live at a Cloudflare Pages URL (staging before DNS cutover)
- [ ] **DEPL-03**: Old WordPress URLs redirect correctly: `/talksevents/` → `/events`, `/people/` → `/people`, `/publications/` → `/publications`
- [ ] **DEPL-04**: Lighthouse scores ≥ 95 on Performance, Accessibility, Best Practices, SEO on homepage
- [ ] **DEPL-05**: Contact form submits successfully and sends a notification to the RAISE team

---

## v2 Requirements

### Research Section

- **RES-01**: Dedicated research pillar pages at /research/[pillar] with full descriptions, related publications, and affiliated people
- **RES-02**: Publications linked to research pillar pages

### Newsletter & Subscribe

- **SUB-01**: Email subscribe form on homepage and footer (Buttondown or similar, not just a mailto link)

### AI Clinic Integration

- **CLIN-01**: AI Clinic card on homepage and nav links to aiclinic.uw.edu with a brief description

### Advanced Search

- **SRCH-01**: Filter publications by author name in addition to topic/year
- **SRCH-02**: Filter events by speaker name

### Talks Archive

- **TLKS-01**: Video embed for recorded talks on event detail pages (YouTube/Vimeo embed)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI Clinic site redesign | Separate site at aiclinic.uw.edu — link only |
| WordPress plugin migration | Static replacement — no dynamic WordPress features |
| User accounts / login for visitors | No user-generated content on this site |
| Comments section | Not needed for research center site |
| Newsletter system | Keep existing UW mailman list; link to it |
| Server-side rendering / API routes | Static site only; Cloudflare Functions for form only |
| Events ticketing / RSVP | Link to external systems (Eventbrite etc.) |
| Mobile app | Web only |

---

## Traceability

Updated by roadmapper. To be filled in.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DET-01 | — | Pending |
| DET-02 | — | Pending |
| DET-03 | — | Pending |
| MIG-01 | — | Pending |
| MIG-02 | — | Pending |
| MIG-03 | — | Pending |
| MIG-04 | — | Pending |
| MIG-05 | — | Pending |
| ANI-01 | — | Pending |
| ANI-02 | — | Pending |
| ANI-03 | — | Pending |
| ANI-04 | — | Pending |
| ANI-05 | — | Pending |
| BRD-01 | — | Pending |
| BRD-02 | — | Pending |
| BRD-03 | — | Pending |
| CMS-01 | — | Pending |
| CMS-02 | — | Pending |
| CMS-03 | — | Pending |
| DISC-01 | — | Pending |
| DISC-02 | — | Pending |
| DEPL-01 | — | Pending |
| DEPL-02 | — | Pending |
| DEPL-03 | — | Pending |
| DEPL-04 | — | Pending |
| DEPL-05 | — | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 0 (roadmapper will fill)
- Unmapped: 26 ⚠️

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-17 after initial definition*
