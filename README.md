# RAISE website

A static site for **raise.uw.edu** — hosted on **GitHub Pages** with
self-hosted fonts, no CDN, and no build step. The Get Involved page embeds a
Google Calendar appointment schedule; all other content is served from the repository.

## Files

```
index.html            ← homepage (hero carousel + recent publications)
publications.html     ← full publications archive (filter + search)
people.html           ← leadership, affiliates, staff
talks.html            ← speaker series
ai-for-all.html       ← public programs / hack day
get-involved.html     ← Google appointment calendar + community links
.github/workflows/    ← pull-request release validation
.nojekyll             ← tells GitHub Pages to serve files as-is

data/site-data.js     ← publication data loaded by the homepage + archive
scripts/validate_site.py ← dependency-free release gate
assets/
  raise.css           ← one stylesheet (imports fonts.css)
  fonts.css           ← @font-face for the 3 self-hosted fonts
  fonts/              ← Source Serif 4, Source Sans 3, IBM Plex Mono (woff2)
  site.js             ← nav, accessible hero carousel, homepage rendering
  publications.js     ← publication filters and archive rendering
  raise-logo-uw-white.webp ← official UW/RAISE lockup used site-wide
  raise-icon.jpg      ← favicon
  people/             ← headshots
```

The homepage and publications archive load `data/site-data.js` as a local
script, so they work both on GitHub Pages and when the HTML is opened directly.
Everything else (mission, aims, leadership, partners, footer) changes rarely and
lives directly in the clearly-commented HTML.

## Deploying to GitHub Pages

1. Put all these files at the **root** of the repository (not inside a subfolder).
2. **Settings → Pages → Build and deployment → Deploy from a branch →
   `main` / `/ (root)`** → Save.
3. The committed `CNAME` configures `raise.uw.edu`; point DNS to GitHub Pages
   according to GitHub's current custom-domain instructions.
4. In **Settings → Pages**, enable **Enforce HTTPS** after the certificate is
   issued.
5. Protect `main` with a repository ruleset that requires pull-request review.

Because `.nojekyll` is present, GitHub Pages serves the files verbatim — no
Jekyll, no build.

## Updating publications

1. Edit the JSON object assigned in `data/site-data.js` directly. Array order controls display order;
   `hero: true` features up to five items in the homepage carousel and
   `selected: true` shows up to six items in Recent publications.
2. Keep `url` as the canonical paper or proceedings destination. To add secondary
   actions, use an optional ordered `resources` array; its order is preserved on
   the publication card:

   ```json
   "resources": [
     { "label": "Project site", "url": "https://example.org/project" },
     { "label": "Code", "url": "https://github.com/example/project" }
   ]
   ```

   Resource labels must be `Project site`, `Project hub`, `Open paper`, `Code`,
   or `Dataset`. URLs must be absolute HTTPS destinations and cannot be repeated
   within one publication record.
3. Add any referenced hero image to `assets/hero/` as a local WebP file.
4. Run `python3 scripts/validate_site.py`.
5. Commit the source changes on a branch and open a pull request. After review,
   merge it; GitHub Pages deploys the protected `main` branch.

## Security and release checks

- All pages enforce a self-only script Content Security Policy; inline scripts
  are not allowed.
- Publication data is schema-validated and publication URLs must use HTTPS.
- Run a secret scan before every public release and enable GitHub secret
  scanning and push protection.
- Verify time-sensitive event dates, Zoom links, Slack invitations, and shared
  document permissions before publishing.
- Confirm the Pages certificate is active and **Enforce HTTPS** remains enabled.
- Run `python3 scripts/validate_site.py` locally; the same gate runs on every
  pull request and push to `main`.

## Updating anything else

Edit the HTML directly in GitHub's web editor — each section is clearly
commented (`<!-- ===== LEADERSHIP ===== -->`, etc.). Headshots go in
`assets/people/`.
