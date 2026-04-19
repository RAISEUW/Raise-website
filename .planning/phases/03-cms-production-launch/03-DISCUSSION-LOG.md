# Phase 3: CMS & Production Launch - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 03-cms-production-launch
**Areas discussed:** Contact Form, Decap CMS, Redirects, Deployment

---

## Contact Form

| Option | Description | Selected |
|--------|-------------|----------|
| Formspree | Drop-in, free, no backend code | ✓ |
| Web3Forms | Similar to Formspree, more generous limits | |
| Cloudflare Pages Function | Custom function + email API, more control | |

**User's choice:** Formspree
**Notes:** User initially didn't understand why a service was needed — explained that `data-netlify="true"` only works on Netlify; a service receives the form POST and emails it to the team. User confirmed RAISE team email as recipient (configured in Formspree dashboard, not in repo).

---

## Decap CMS

| Option | Description | Selected |
|--------|-------------|----------|
| Articles only | Primary use case for non-dev editors | |
| All 4 collections | Articles + Events + People + Publications | ✓ |

**Collections:** All 4 (articles, events, people, publications)

| Option | Description | Selected |
|--------|-------------|----------|
| Hide advanced fields | Show only common fields, hide technical ones | |
| Show all fields | Expose every schema field with helper text | ✓ |

**User's choice:** Show all fields
**Notes:** User wants full field access for editors. Plan will add hint text for technical fields (DOI format, URL validation notes, etc.) to help non-technical editors.

---

## Redirects

**User's choice:** Three index-level redirects: `/talksevents/` → `/events`, `/people/*` → `/people`, `/publications/*` → `/publications`
**Notes:** User initially asked why redirects are needed. Explained: old WordPress site has been indexed by Google and bookmarked by users — without redirects, old URLs 404. True 301 redirects preserve SEO ranking. Individual post URLs will gracefully 404 (acceptable for a full redesign).

---

## Deployment

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Pages | User has GitHub, simpler to set up | |
| Cloudflare Pages | Free, native _redirects, global CDN | ✓ |

**User's choice:** Cloudflare Pages (confirmed)
**Notes:** User asked "why not just GitHub Pages?" — explained GitHub Pages has no native 301 redirect support (only JS hacks) and Cloudflare Pages is free with better CDN. User has a GitHub account; just needs a free Cloudflare account. Plan will include prerequisite setup steps.

---

## Claude's Discretion

- Decap CMS widget selection per field
- `/thanks` page design
- Lighthouse optimization specifics
- Formspree form action URL format

## Deferred Ideas

None — discussion stayed within phase scope.
