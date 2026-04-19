# Deferred Items — Phase 03 CMS Production Launch

## Out-of-Scope Discoveries During Plan 03-02

### site/astro.config.mjs and site/tsconfig.json are not tracked in git

**Discovered:** Plan 03-02 execution (build verification for Tasks 2-4)
**Symptom:** `cd site && npm run build` fails with `TypeError: Invalid URL` at `new URL(Astro.url.pathname, Astro.site)` because `Astro.site` is undefined when `astro.config.mjs` is missing (site field defines `https://raise.uw.edu`).
**Root cause:** `site/astro.config.mjs` and `site/tsconfig.json` exist in the developer's main working tree at `/Users/mayuri/Projects/RAISE/site/` but were never committed. They are also not in `.gitignore`. Any fresh clone / worktree / CI environment will fail `npm run build`.
**Impact:** Blocks Plan 03-03 deployment (Cloudflare Pages build will fail on first push).
**Workaround used in 03-02:** Copied files from main tree into worktree locally to verify the build for Plan 03-02 tasks; did NOT commit the config files (out of this plan's scope).
**Action required:** In Plan 03-03 or a dedicated follow-up — commit `site/astro.config.mjs` and `site/tsconfig.json` to the repo so CI / Cloudflare Pages can build. Consider whether `.gitignore` inadvertently masks them, or whether they were lost in a prior force-checkout.
