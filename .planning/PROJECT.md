# RAISE Website Redesign

## What This Is

A complete redesign of raise.uw.edu — the UW RAISE Center's public website — replacing the existing WordPress site with a modern, minimal, animated static site built on Astro 6. The site serves researchers, students, faculty, civic organizations, and the general public interested in responsible AI at the University of Washington. Non-technical faculty and staff can edit content through a Decap CMS web interface without touching code.

## Core Value

A beautiful, fast, searchable home for RAISE's research, people, events, and articles — that anyone on the team can keep up-to-date.

## Requirements

### Validated

- ✓ Astro 6 + Tailwind v4 + MDX + Pagefind site scaffold — Phase 1
- ✓ Content Collections for publications, events, articles, people — Phase 1
- ✓ Global design system (Fraunces + Inter + JetBrains Mono, UW purple #4B2E83 accent) — Phase 1
- ✓ Base layout with sticky glassmorphism Nav, Footer, Lenis smooth scroll — Phase 1
- ✓ Homepage with animated hero, pillars, upcoming events, recent articles — Phase 1
- ✓ Publications index with year + topic filter sidebar — Phase 1
- ✓ Publications detail page ([slug].astro) — Phase 1
- ✓ Events index (upcoming + past sections) — Phase 1
- ✓ Articles index with tag filter — Phase 1
- ✓ People index grouped by role — Phase 1
- ✓ Search page with Pagefind UI — Phase 1
- ✓ AI for All page — Phase 1
- ✓ Get Involved page with contact channels — Phase 1
- ✓ Sample MDX content (people, publications, events) — Phase 1

### Active

- [ ] Events detail pages ([slug].astro) with speaker bio, abstract, recording link, slides
- [ ] People detail pages ([slug].astro) with full bio, linked publications, talks
- [ ] Articles detail pages ([slug].astro) with MDX prose, author, tags
- [ ] Full content migration — all ~40 publications, 50+ events, 16 people scraped from raise.uw.edu to MDX
- [ ] RSS feed at /rss.xml (articles + events)
- [ ] Decap CMS setup at /admin — web interface for non-dev editors
- [ ] Animation polish — scroll reveals (IntersectionObserver + Motion), hero load animation, View Transitions tuning
- [ ] Cloudflare Pages deployment — connect repo, build command, custom domain prep
- [ ] 301 redirects for old WordPress URLs (/talksevents/ → /events, etc.)
- [ ] Research section (3 pillars as proper pages)
- [ ] UW logos and RAISE branding assets integrated (UW seal/wordmark + RAISE logomark)
- [ ] Contact form working (Cloudflare Pages Function or Formspree)
- [ ] Dark mode verified across all pages
- [ ] Lighthouse 95+ on all four categories

### Out of Scope

- AI Clinic (aiclinic.uw.edu) — separate site, link-only from RAISE
- Newsletter/subscription system — keep existing UW mailman list, link to it
- WordPress migration of dynamic features (comments, forms) — static replacement only
- Blog with user-generated content — MDX-only articles authored by team
- Events registration/ticketing — link to external registration systems
- Database or server-side rendering — static site only

## Context

The current site is WordPress (raise.uw.edu), published and indexed. The new site is being built in `/Users/mayuri/Projects/RAISE/site/` — an Astro 6 project with the scaffold, design system, and index pages already complete. Build passes locally. The Astro site uses the Content Layer API (glob loaders, not the old `type: 'content'` API), Tailwind v4 with `@import "tailwindcss"` and `@theme {}` tokens, and entry IDs via `.id` not `.slug`.

The site will be hosted on Cloudflare Pages (free forever, unlimited bandwidth, preview deploys per PR). The raise.uw.edu subdomain is managed by UW IT — DNS cutover will need coordination. During development the site can be staged at a Cloudflare Pages URL.

Non-technical faculty and staff will edit content through Decap CMS at /admin, which commits MDX files to GitHub. The Astro build then deploys automatically via Cloudflare Pages.

## Constraints

- **Budget**: Free forever — Cloudflare Pages (hosting), Decap CMS (git-based, no DB cost), Google Fonts (typography)
- **Tech stack**: Astro 6 + Tailwind v4 + MDX + Pagefind + Decap CMS + Lenis + Motion (already chosen, site scaffold built)
- **Animation**: Subtle & refined — every animation has a purpose, none exceeds 600ms, prefers-reduced-motion respected
- **Accessibility**: No JS required for content — Astro islands only for interactive UI (filter, search, CMS)
- **DNS**: raise.uw.edu is a UW subdomain — DNS cutover requires UW IT coordination; deploy at Cloudflare URL first
- **Editors**: 3-4 non-technical collaborators must be able to add content through /admin without touching code

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro 6 (not Next.js, SvelteKit, Hugo) | Zero-JS for content pages, native MDX, Content Collections, View Transitions | — Pending (in use) |
| Tailwind v4 (`@import` + `@theme {}`) | Fastest iteration, no runtime CSS, design tokens via CSS vars | — Pending |
| Cloudflare Pages (not Vercel Hobby, GitHub Pages) | Free forever, unlimited bandwidth, preview URLs per PR; Vercel Hobby ToS is non-commercial-only (gray area for UW research center) | — Pending |
| Decap CMS (not Contentlayer, Sanity, Forestry) | Free, git-based, no vendor lock-in, commits MDX to repo, zero monthly cost | — Pending |
| Pagefind (not Algolia, Lunr) | Zero-config static search, indexes at build time, no API key or backend | — Pending |
| [slug].astro routing (not [...slug].astro) | Spread slug routes conflicted with index pages in Astro 6; single-segment routes are correct for this structure | ✓ Good |
| `.id` not `.slug` for collection entries | Astro 6 Content Layer API breaking change — `.slug` removed | ✓ Good |
| `import tailwindcss from '@tailwindcss/vite'` (default export) | Named export `{ tailwindcss }` errors in Tailwind v4 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after initialization*
