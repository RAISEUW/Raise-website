# Phase 3: CMS & Production Launch - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire Decap CMS at /admin for non-technical editors (all 4 collections), deploy the site to Cloudflare Pages with 301 redirects for old WordPress URLs, verify Lighthouse scores ≥ 95, and ship the contact form to a real destination via Formspree.

Content migration is Phase 2 (complete). Animation polish is Phase 1 (complete). This phase is purely CMS setup + deployment pipeline + contact form plumbing.

</domain>

<decisions>
## Implementation Decisions

### Contact Form
- **D-01:** Use **Formspree** as the form backend. Change the current `action="/thanks"` and `data-netlify="true"` on the Get Involved form to a Formspree endpoint URL. No backend code required. Free tier (~50 submissions/month) is sufficient for a research center.
- **D-02:** Recipient email is the RAISE team email address (e.g. raise@uw.edu or a shared inbox). This is configured in the Formspree dashboard — **not hardcoded in the repo**. The planner should include a note that the team must configure the recipient in Formspree after setup.
- **D-03:** Add a `/thanks` page (currently referenced as the form action) — a simple success state page confirming submission. If using Formspree redirect after submission, this page should exist.

### Decap CMS
- **D-04:** All **4 collections** are exposed in the CMS: articles, events, people, publications.
- **D-05:** **All fields shown** — do not hide technical or optional fields. Editors see the full schema. Use Decap CMS field `hint` properties to add helper text for technical fields (e.g. "Format: https://doi.org/...").
- **D-06:** Use **Decap Cloud** for authentication — the free managed OAuth proxy at `https://api.decapcms.org`. This handles GitHub OAuth without a custom server or Cloudflare Worker. Backend config: `name: github`, repo pointing to the project repo, `site_domain` pointing to the Cloudflare Pages URL.
- **D-07:** The CMS `/admin` route is a static HTML page at `site/public/admin/index.html` with a `config.yml` at `site/public/admin/config.yml`. No Astro integration needed — Decap loads as a standalone SPA.

### Deployment
- **D-08:** Deploy to **Cloudflare Pages** (free). User needs to create a free Cloudflare account and connect the GitHub repo to Cloudflare Pages. Build command: `pnpm build` (maps to `astro build`). Output directory: `dist/`.
- **D-09:** Pagefind index is generated at build time via the `astro-pagefind` integration already in `astro.config.mjs` — no special Cloudflare build step needed.
- **D-10:** Use a `_redirects` file at `site/public/_redirects` for 301 redirects. Cloudflare Pages natively reads this file.

### Redirects
- **D-11:** Three index-level 301 redirects (all old WordPress section pages):
  - `/talksevents/` → `/events`
  - `/people/*` → `/people` (catch-all for old individual people URLs)
  - `/publications/*` → `/publications` (catch-all for old publication URLs)
  - Individual old post URLs not covered by the above will gracefully 404 — acceptable for this redesign.

### Lighthouse
- **D-12:** Lighthouse ≥ 95 target applies to all four categories (Performance, Accessibility, Best Practices, SEO) measured on the deployed Cloudflare Pages URL. The planner should include a Lighthouse audit step and address any failures before marking the phase complete.

### Claude's Discretion
- Decap CMS config.yml field order and widget choices — Claude can choose appropriate Decap widgets (string, text, markdown, datetime, image, number, relation) for each schema field.
- `/thanks` page design — minimal success state, consistent with site design system.
- Lighthouse optimization specifics — image compression, preload hints, meta descriptions — Claude can identify and fix bottlenecks.
- Formspree form action URL format — standard `https://formspree.io/f/{id}` pattern.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing contact form
- `site/src/pages/get-involved.astro` — Current contact form with `data-netlify="true"` and `action="/thanks"`. D-01 requires replacing these with Formspree. Form fields: name (required), email (required), org (optional), message (required).

### Content schemas (CMS field source of truth)
- `site/src/content.config.ts` — Zod schemas for all 4 collections. Every field, type, and optional/required status. Decap CMS config.yml widgets must match these schemas exactly.

### Build configuration
- `site/astro.config.mjs` — Current Astro config with `astro-pagefind` integration. Build produces `dist/` output.
- `site/package.json` — Build script is `astro build`. Deploy command for Cloudflare Pages: `pnpm build`.

### Phase requirements
- `.planning/ROADMAP.md` §"Phase 3: CMS & Production Launch" — Goal, requirements CMS-01..03, DEPL-01..05, success criteria.
- `.planning/REQUIREMENTS.md` §"CMS" and §"Deployment" — Acceptance criteria for all 8 Phase 3 requirements.

### Prior phase context
- `.planning/phases/01-complete-the-site-surface/01-CONTEXT.md` — Typography and spacing decisions (locked). CMS editor UI must not introduce new type weights or spacing tokens.
- `site/src/styles/global.css` — Design tokens. `/thanks` page and any CMS-adjacent pages must use these tokens.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/src/layouts/Base.astro` — All new pages (`/thanks`, `/admin` if needed) should use this layout for consistent nav/footer.
- `site/src/styles/global.css` — Design tokens available globally. The `/thanks` page should use `var(--color-accent)`, `var(--font-display)`, etc.
- Existing page hero pattern (`page-hero` class, `section-label` + `h1` + `page-desc`) — reuse for the `/thanks` page.

### Established Patterns
- **Static files in `site/public/`** — anything in `public/` is served as-is. Decap's `admin/index.html` and `admin/config.yml` go here; no Astro processing needed.
- **`_redirects` in `public/`** — Cloudflare Pages reads `_redirects` from the root of `dist/` (which Astro copies from `public/`).
- **Pagefind integration** — already wired via `astro-pagefind`. No additional build step needed.

### Integration Points
- `site/public/admin/` — Create this directory with `index.html` (Decap CMS CDN loader) and `config.yml` (collection definitions).
- `site/public/_redirects` — Create this file for Cloudflare Pages 301 redirects.
- `site/src/pages/get-involved.astro` — Modify the `<form>` element to use Formspree action URL and remove `data-netlify` attributes.
- `site/src/pages/thanks.astro` — Create this new page as the post-submission success state.

</code_context>

<specifics>
## Specific Ideas

- **Decap Cloud auth** requires registering the site's domain (the Cloudflare Pages URL) in the Decap Cloud dashboard. This is a one-time step the user does after deployment.
- **Formspree setup**: user creates a free account at formspree.io, creates a form, gets an endpoint URL like `https://formspree.io/f/xpwdabcd`, replaces the current form action. Recipient email configured in the Formspree dashboard.
- The user asked about GitHub Pages vs Cloudflare Pages — chose Cloudflare Pages because it natively supports `_redirects` (true 301s) and is faster on Cloudflare's CDN. GitHub Pages has no native redirect support.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-cms-production-launch*
*Context gathered: 2026-04-19*
