---
phase: 03-cms-production-launch
plan: 01
subsystem: cms

tags: [decap-cms, github-oauth, content-management, mdx, static-spa]

requires:
  - phase: 01-complete-the-site-surface
    provides: "Zod content schemas + reference() fields for linkedPublications/linkedTalks that Decap relation widgets target"
  - phase: 02-content-migration
    provides: "Populated src/content/{articles,events,people,publications}/ directories — relation widgets search these for slugs"
provides:
  - "Decap CMS SPA at /admin loading from unpkg CDN (v3)"
  - "config.yml covering all 4 collections with every Zod field mapped to the correct Decap widget"
  - "GitHub OAuth auth flow via Decap Cloud proxy (no custom server, no Cloudflare Worker)"
  - "Media library pointing to site/public/images/uploads"
  - "Relation widgets for people.linkedPublications + people.linkedTalks"
  - "Select widget for people.role enum (leadership/affiliate/staff/alumni)"
affects:
  - 03-cms-production-launch plans 02-03 (deployment registers Cloudflare domain with Decap Cloud)
  - Future content edits by non-technical editors (articles, events, people, publications CRUD)

tech-stack:
  added:
    - "decap-cms v3 (loaded from unpkg CDN; no npm dependency)"
    - "Decap Cloud OAuth proxy (api.decapcms.org) — zero-config GitHub auth"
  patterns:
    - "Static SPA at /admin — site/public/admin/{index.html,config.yml} copied by Astro to dist/ at build (no Astro processing)"
    - "Schema-first config: every Zod field in content.config.ts has a matching Decap widget; MDX body mapped via widget: markdown"
    - "Required flag parity: Zod .optional() → required: false, no-.optional() → required: true"
    - "hint strings on technical fields (date format, DOI format, twitter handle format) to guide non-dev editors"

key-files:
  created:
    - "site/public/admin/index.html — Decap CMS CDN loader, noindex meta, no Base.astro layout"
    - "site/public/admin/config.yml — backend + 4 collections + 48 total field definitions"
  modified: []

key-decisions:
  - "Dropped events.image field from config.yml — not present in content.config.ts schema (plan interfaces section was stale)"
  - "backend.repo set to 'mayuri-tech/RAISE' placeholder — no git remote configured yet; will be updated when repo is pushed in Plan 03-03"
  - "Markdown body widget added to each collection — maps to MDX content body (not frontmatter), needed for editor to write article/event/bio content"
  - "site_domain intentionally omitted from backend config — Decap Cloud infers from referrer for public repos (per D-06)"

patterns-established:
  - "Content-schema → CMS-config parity audit: count Zod fields, count Decap fields, confirm 1:1 (minus MDX body which is implicit)"
  - "Plan verification via main-repo build when worktree lacks untracked config files (astro.config.mjs not tracked in git but required for build)"

requirements-completed:
  - CMS-01
  - CMS-02
  - CMS-03

duration: 8min
completed: 2026-04-19
---

# Phase 03 Plan 01: Decap CMS Wiring Summary

**Decap CMS SPA at /admin with config.yml exposing all 4 content collections (articles, events, people, publications) via GitHub OAuth through Decap Cloud proxy — every Zod field from content.config.ts has a matching Decap widget including relation widgets for linkedPublications/linkedTalks and select widget for role enum.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-19T23:04:00Z
- **Completed:** 2026-04-19T23:12:50Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- `/admin` now loads the Decap CMS SPA from the official unpkg CDN (v3.8+), with `noindex` meta to keep the admin UI out of search engines
- `config.yml` wires all 4 collections (articles, events, people, publications) with every Zod field mapped to the correct Decap widget
- `people.role` uses a `select` widget with the exact enum from Zod (`leadership`, `affiliate`, `staff`, `alumni`)
- `people.linkedPublications` and `people.linkedTalks` use `relation` widgets referencing the publications and events collections by slug — mirrors the Phase 01 decision to use `reference()` instead of string arrays
- Backend configured for GitHub OAuth via Decap Cloud proxy (`https://api.decapcms.org`) — no custom auth server required
- Media library pointed at `site/public/images/uploads` with public URL `/images/uploads`
- Build in main repo produces `dist/admin/config.yml` and `dist/admin/index.html` as expected

## Task Commits

1. **Task 1: Create Decap CMS SPA loader at site/public/admin/index.html** — `8a1e5e1` (feat)
2. **Task 2: Create Decap CMS config.yml exposing all 4 collections with every field mapped** — `f2f7da9` (feat)

## Files Created/Modified

- `site/public/admin/index.html` — 14-line static HTML loading `decap-cms@^3.8.0` from unpkg CDN; `<meta name="robots" content="noindex">`; no site chrome (Decap renders its own SPA UI).
- `site/public/admin/config.yml` — 117-line Decap config. Backend block (GitHub via Decap Cloud), media folders, 4 collections:
  - `articles` — 8 fields (title, date, author, tags, cover, excerpt, draft, body)
  - `events` — 12 fields (title, speaker, speakerBio, speakerPhoto, date, time, location, abstract, recording, slides, upcoming, body)
  - `people` — 14 fields (name, role-as-select, title, department, email-with-regex-pattern, x, linkedin, website, photo, researchAreas, order-as-int, linkedPublications-as-relation, linkedTalks-as-relation, body)
  - `publications` — 9 fields (title, authors, venue, date, topics, pdf, doi, abstract, body)

## Decisions Made

- **Schema is source of truth for field presence.** Plan interfaces section listed `image: string (optional)` for events, but `site/src/content.config.ts` has no such field. Including it would let editors write frontmatter that Astro's Zod validator would reject on the next build, breaking the site. Dropped — this is a Rule 1 (Bug) fix against the plan's stale interfaces section.
- **Field counts adjusted to match schema.** Plan claimed events=13, people=15; actual schema gives events=12, people=14 (body widget counted per collection). Plan acceptance criterion for `datetime >= 4 matches` was also off — only 3 collections have a `date` field (articles, events, publications); people has `order: number` instead. Followed schema, documented discrepancy.
- **backend.repo is a placeholder.** Plan's instruction to verify via `git remote get-url origin` returned no remote (worktree has none; main has none). Kept the plan's default `mayuri-tech/RAISE` as a placeholder — Plan 03-03 (deployment) will push to GitHub and must update this value before Decap Cloud OAuth works.
- **`body` widget per collection (markdown).** Zod schemas don't list body explicitly — MDX body is implicit. Added `widget: markdown` for each collection so editors can write article/event/bio content, not just frontmatter.
- **`site_domain` omitted.** Per D-06, Decap Cloud infers site domain from the referrer for public repos. The Cloudflare Pages URL will be registered in the Decap Cloud dashboard as a one-time step in Plan 03.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan interfaces section listed non-existent events.image field**
- **Found during:** Task 2 (schema-vs-plan audit before writing config.yml)
- **Issue:** Plan's `<interfaces>` block included `image: string (optional)` for events, but `site/src/content.config.ts` (declared as "SOURCE OF TRUTH" by the plan itself) has no image field. Adding it to Decap would let editors save frontmatter that Zod rejects, causing the next Astro build to fail with "Unknown keys: image".
- **Fix:** Dropped events.image from config.yml. Events collection has 12 fields (11 frontmatter + 1 markdown body widget) matching the schema exactly.
- **Files modified:** site/public/admin/config.yml
- **Verification:** `grep -c "^      - " site/public/admin/config.yml` in the events section = 12; build in main repo succeeds.
- **Committed in:** f2f7da9 (Task 2 commit)

**2. [Rule 3 - Blocking] Build verification environment missing config files in worktree**
- **Found during:** Task 2 (running the plan's `cd site && pnpm build` verification)
- **Issue:** Git-worktree checkout lacks `site/astro.config.mjs` and `site/tsconfig.json` — these files exist in the main repo working directory but are untracked (not in git). The worktree's `npm run build` fails on `/404 Invalid URL` because Base.astro needs the `site` config that only astro.config.mjs supplies. This blocks the plan's literal verification command but is unrelated to the Decap config being written.
- **Fix:** Verified causally-clean by copying the two new admin files to the main repo's `site/public/admin/` directory and running `npm run build` there. Result: exit 0, 99 pages built, `dist/admin/config.yml` and `dist/admin/index.html` both present. Worktree's build break is pre-existing environment drift, not a regression from Plan 03-01.
- **Files modified:** (none — verification-only)
- **Verification:** `cd /Users/mayuri/Projects/RAISE/site && npm run build 2>&1 | tail` shows `[build] Complete!` with no errors; `dist/admin/` contains both files.
- **Committed in:** N/A (not a code change)

---

**Total deviations:** 2 (1 Rule-1 bug in plan, 1 Rule-3 environmental blocker)
**Impact on plan:** Both fixes required to ship a working /admin. Schema mismatch would have caused runtime build failures on first CMS save; environmental build failure required main-repo verification to prove causal cleanliness. No scope creep — both strictly inside the plan's goal.

## Issues Encountered

- `pnpm` not available on the machine — used `npm run build` instead (equivalent). Not a deviation; npm is the fallback runner when pnpm is absent.
- Worktree lacked `node_modules` — symlinked from main repo (`ln -s /Users/mayuri/Projects/RAISE/site/node_modules node_modules`). Enabled local build attempts without a fresh install.

## Self-Check

### Files

- FOUND: site/public/admin/index.html
- FOUND: site/public/admin/config.yml

### Commits

- FOUND: 8a1e5e1 (Task 1)
- FOUND: f2f7da9 (Task 2)

## Self-Check: PASSED

## User Setup Required

**External services require manual configuration** (documented here until USER-SETUP.md exists for Phase 03):

1. **Push the repo to GitHub.** `backend.repo: mayuri-tech/RAISE` in `config.yml` is a placeholder. Once the repo is pushed to its final GitHub owner/name, update `backend.repo` to match `{owner}/{name}` from `git remote get-url origin`. Plan 03-03 covers this.

2. **Register the Cloudflare Pages domain with Decap Cloud.** Per D-06, once the Cloudflare Pages deploy is live, visit https://decapcms.org and register the deployed domain so Decap Cloud can issue OAuth redirects. This is a one-time dashboard step.

3. **Authorize the GitHub OAuth app.** First-time editors visiting `/admin` will see a GitHub OAuth prompt; they must click "Authorize Decap Cloud" to grant commit access. Repo collaborators (push access) can edit; read-only users cannot save.

## Next Phase Readiness

- `/admin` is shipped in the build output — deploying via Plan 03-02 (Cloudflare Pages) will serve it at `https://{pages-url}/admin/`.
- Plan 03-02 (_redirects + Formspree + thanks page) and Plan 03-03 (Cloudflare deploy + Lighthouse + DNS prep) can now proceed in parallel with respect to this plan — no runtime cross-dependencies.
- Known follow-up: update `backend.repo` before Decap Cloud OAuth can succeed; tracked as a user-setup item, not a code change.

---
*Phase: 03-cms-production-launch*
*Completed: 2026-04-19*
