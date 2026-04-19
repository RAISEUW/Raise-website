---
phase: 03-cms-production-launch
plan: 02
subsystem: deployment
tags: [forms, redirects, formspree, cloudflare-pages, contact]
dependency_graph:
  requires:
    - Phase 01 site scaffold (Base.astro, design tokens, get-involved.astro)
    - User-provided Formspree endpoint (collected at Task 1 checkpoint)
  provides:
    - /thanks success page (Formspree post-submit target)
    - Contact form wired to real Formspree endpoint
    - Cloudflare Pages 301 redirect rules for legacy WordPress URLs
  affects:
    - site/src/pages/get-involved.astro (form action + hidden inputs changed)
    - site/public/ (now ships a _redirects file verbatim to dist/)
tech_stack:
  added: []
  patterns:
    - Formspree _next hidden input for post-submit redirect
    - Cloudflare Pages _redirects syntax (source destination status)
    - 404.astro-style success page (Base + container + animate-fade-up + .btn primary/ghost)
key_files:
  created:
    - site/src/pages/thanks.astro
    - site/public/_redirects
    - .planning/phases/03-cms-production-launch/deferred-items.md
  modified:
    - site/src/pages/get-involved.astro
decisions:
  - Formspree endpoint https://formspree.io/f/xlgaljyb hardcoded in form action (recipient email configured dashboard-side per D-02)
  - _redirects catch-alls for /people/* and /publications/* send to index pages (not graceful 404) — consistent with D-11
  - Copied config files (astro.config.mjs, tsconfig.json) from main tree into worktree locally to verify build; deferred the commit of those files to a later plan since they are pre-existing missing repo artifacts out of this plan's scope
metrics:
  duration_minutes: 3
  completed_date: "2026-04-19"
  tasks_completed: 4
  files_touched: 3
  commits: 3
---

# Phase 3 Plan 2: Form + /thanks + Redirects Summary

**One-liner:** Contact form POSTs to Formspree (xlgaljyb), lands on a branded /thanks page, and three 301 redirect rules at Cloudflare Pages forward legacy WordPress URLs to the new indexes.

## What Got Built

### Task 1 (checkpoint — human-action)

User-gate: collected Formspree endpoint URL `https://formspree.io/f/xlgaljyb`. The URL was validated against `^https://formspree\.io/f/[a-zA-Z0-9]+$` (passed) and stored for use in Task 3. No commit — this task only gates Task 3.

### Task 2 — /thanks success page — commit `c782424`

- `site/src/pages/thanks.astro` created
- Layout: `Base.astro` with `title="Thanks — RAISE"` and meta description
- Structure: `.thanks` section → centered `.container` → `.section-label` ("Message received") → italic-accent `h1` ("Thanks for reaching *out*.") → body paragraph → two CTAs (Back to homepage / See upcoming events)
- Animation: `.animate-fade-up` with staggered 100ms delays on label, heading, body, actions
- Styling: `.btn`/`.btn-primary`/`.btn-ghost` defined in page-scoped style block (mirrors 404.astro — there is no global `.btn` in global.css; each page defines its own button treatment)
- Design tokens only: `--color-accent`, `--color-muted`, `--color-base`, `--color-surface`, `--color-border`, `--font-display`, `--font-mono`, `--radius-btn`, `--ease-out-expo`
- Build output: `site/dist/thanks/index.html` contains "Message received" — ✓

### Task 3 — Formspree wiring — commit `b5e2b8e`

- `site/src/pages/get-involved.astro` form block (lines 57-64) modified
- `action` changed from `/thanks` → `https://formspree.io/f/xlgaljyb`
- Removed: `data-netlify="true"` attribute (Netlify-specific, no longer used)
- Removed: `<input type="hidden" name="form-name" value="contact" />` (Netlify-specific)
- Added: `<input type="hidden" name="_next" value="/thanks" />` (Formspree post-submit redirect target per D-03)
- Added: `<input type="hidden" name="_subject" value="New RAISE contact form submission" />` (helpful subject line for the RAISE inbox per D-01)
- Preserved: form-row/form-field markup, all 4 named fields (name, email, org, message), submit button ("Send message →"), every CSS rule, channels-grid section, page-hero section

### Task 4 — Cloudflare Pages redirects — commit `4f7500c`

- `site/public/_redirects` created with three 301 rules:
  ```
  # Legacy WordPress URL redirects (per D-11)
  /talksevents/*           /events          301
  /people/*                /people          301
  /publications/*          /publications    301
  ```
- Splat (`*`) captures the remainder of the path; individual old slugs (e.g. `/talksevents/ai-ageism-studying-age-discrimination-in/`) resolve to the index
- `/admin*` and `/rss.xml` deliberately NOT redirected — Decap CMS and RSS must serve normally
- Astro copies `public/` verbatim to `dist/` at build: `site/dist/_redirects` was present post-build and `diff` between public and dist showed no differences

## Decisions Made

| Decision | Rationale |
|---|---|
| Formspree endpoint literal hardcoded in form action | Formspree IDs are not secrets — they are URL path fragments; matches D-01 approach |
| Form recipient email NOT in repo (configured in Formspree dashboard) | Per D-02: keeps PII out of source; allows editors to change recipient without a commit |
| `_next=/thanks` instead of Formspree's default success page | Per D-03: branded confirmation, better continuity of design system |
| /people/* and /publications/* catch-all to indexes | Per D-11: old individual slugs redirect to the relevant index rather than 404; user still finds related content |
| /admin NOT in redirects list | Decap CMS must serve normally at /admin for editors |

## Verification Results

All task acceptance criteria passed:

**Task 2:**
- `site/src/pages/thanks.astro` exists ✓
- `import Base from '../layouts/Base.astro'` → 1 match ✓
- `Thanks for reaching` → 1 match ✓
- `var(--color-accent)` → 4 matches ✓
- `var(--font-display)` → 1 match ✓
- `site/dist/thanks/index.html` exists ✓
- `Message received` in dist → 1 match ✓

**Task 3:**
- `action="https://formspree.io/f/` → 1 match ✓
- `data-netlify` → 0 matches ✓
- `name="form-name"` → 0 matches ✓
- `name="_next"` → 1 match ✓
- `value="/thanks"` → 1 match ✓
- `name="_subject"` → 1 match ✓
- name/email/org/message fields → 4 matches ✓
- `Send message` → 1 match ✓
- `FORMSPREE_ENDPOINT` placeholder → 0 matches ✓

**Task 4:**
- `site/public/_redirects` exists ✓
- `site/dist/_redirects` exists after build ✓
- `/talksevents/*`, `/people/*`, `/publications/*` → 1 match each ✓
- `" 301$"` → 3 matches ✓
- `/admin` → 0 matches ✓
- `diff public/_redirects dist/_redirects` → no differences ✓

**Overall build:** `cd site && npm run build` exits 0; 100 pages built; Pagefind index generated.

## Deviations from Plan

### [Rule 3 — Blocking issue] Missing astro.config.mjs in worktree

- **Found during:** Task 2 build verification
- **Issue:** `site/astro.config.mjs` and `site/tsconfig.json` were absent from the worktree (they exist in the developer's main tree at `/Users/mayuri/Projects/RAISE/site/` but have never been committed to git; they are also not listed in `.gitignore`). Without `astro.config.mjs`, `Astro.site` is undefined, causing `new URL(canonicalURL)` in `Base.astro` to throw `TypeError: Invalid URL` and the build to abort.
- **Fix:** Copied `astro.config.mjs`, `tsconfig.json`, and `site/.gitignore` from the main tree into the worktree purely to verify the build. Did NOT commit these files — they are outside plan 03-02's scope (files_modified list) and committing them would silently expand the plan.
- **Logged to:** `.planning/phases/03-cms-production-launch/deferred-items.md` — flagged for Plan 03-03 (deployment) since Cloudflare Pages build will fail without the config in the repo.
- **Commit:** n/a (no code fix applied; deferred)

## Known Stubs

None. All form wiring, success page, and redirect rules are wired to real targets (real Formspree endpoint, real /thanks page, real index routes).

## Authentication Gates

**Task 1 checkpoint (human-action):** Formspree endpoint URL collected from user. Account creation and form setup at formspree.io was a prerequisite manual step. User provided `https://formspree.io/f/xlgaljyb` which passed the regex validation.

No other auth gates occurred during Tasks 2-4.

## Files of Record

- Created: `site/src/pages/thanks.astro`
- Created: `site/public/_redirects`
- Created: `.planning/phases/03-cms-production-launch/deferred-items.md`
- Modified: `site/src/pages/get-involved.astro`

## Commits

| Hash | Task | Message |
|---|---|---|
| c782424 | 2 | feat(03-02): add /thanks success page |
| b5e2b8e | 3 | feat(03-02): wire contact form to Formspree endpoint |
| 4f7500c | 4 | feat(03-02): add Cloudflare Pages _redirects for legacy WordPress URLs |

## Self-Check: PASSED

- site/src/pages/thanks.astro — FOUND
- site/public/_redirects — FOUND
- site/src/pages/get-involved.astro — FOUND (modified)
- .planning/phases/03-cms-production-launch/deferred-items.md — FOUND
- .planning/phases/03-cms-production-launch/03-02-SUMMARY.md — FOUND
- Commit c782424 — FOUND
- Commit b5e2b8e — FOUND
- Commit 4f7500c — FOUND
