# RAISE website

A fully static site for **raise.uw.edu** — hosted on **GitHub Pages** with
**zero external dependencies** (fonts self-hosted, no CDN, no build step) and
updated through a simple in-browser form.

## Files

```
index.html            ← homepage (hero carousel + recent publications)
research-aims.html    ← the three research aims
publications.html     ← full publications archive (filter + search)
people.html           ← leadership, affiliates, staff
talks.html            ← speaker series
ai-for-all.html       ← public programs / hack day
get-involved.html     ← contact form + community links
admin.html            ← in-browser editor for publications & hero
.nojekyll             ← tells GitHub Pages to serve files as-is

data/site-data.json   ← the publications data the homepage + archive read
assets/
  raise.css           ← one stylesheet (imports fonts.css)
  fonts.css           ← @font-face for the 3 self-hosted fonts
  fonts/              ← Source Serif 4, Source Sans 3, IBM Plex Mono (woff2)
  site.js             ← nav, hero carousel, publications rendering
  raise-logo*.png     ← official logo (white / purple / ink)
  raise-icon.jpg      ← favicon
  people/             ← headshots
```

The homepage and publications archive read `data/site-data.json` at load time.
Everything else (mission, aims, leadership, partners, footer) changes rarely and
lives directly in the clearly-commented HTML.

## Deploying to GitHub Pages

1. Put all these files at the **root** of the repository (not inside a subfolder).
2. **Settings → Pages → Build and deployment → Deploy from a branch →
   `main` / `/ (root)`** → Save.
3. The site goes live at `https://<user>.github.io/<repo>/` in ~1 minute.
4. Custom domain: add `raise.uw.edu` in Settings → Pages, and create a `CNAME`
   file (or DNS record) per GitHub's instructions.

Because `.nojekyll` is present, GitHub Pages serves the files verbatim — no
Jekyll, no build.

## Updating publications (the easy way)

1. Open **admin.html** (on the live site or locally).
2. Add / edit / reorder publications. Tick *Feature in homepage hero* (max 5)
   and *Show in Recent publications* as needed.
3. Save with one of:
   - **Publish to GitHub** — paste a fine-grained token (this repo only,
     Contents: read/write) and the editor commits `data/site-data.json`.
   - **Download JSON** — replace `data/site-data.json` and commit via GitHub's
     web UI (Add file → Upload files).

## Updating anything else

Edit the HTML directly in GitHub's web editor — each section is clearly
commented (`<!-- ===== LEADERSHIP ===== -->`, etc.). Headshots go in
`assets/people/`.
