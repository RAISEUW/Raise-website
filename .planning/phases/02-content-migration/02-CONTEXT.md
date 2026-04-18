# Phase 2: Content Migration - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Populate the site with all real RAISE content from raise.uw.edu — ~40 publications, 50+ events, and 16 people migrated to MDX with correct metadata and associated assets (author photos, PDFs). At least one article authored specifically for the new site. Content migration is complete when every detail page route renders real data and all assets load locally.

CMS setup is Phase 3. Deployment is Phase 3. Animation polish is Phase 1 (complete).

</domain>

<decisions>
## Implementation Decisions

### Extraction method
- **D-01:** Content is extracted via a **script scraper** — a Node.js or Python script that crawls raise.uw.edu, parses HTML, and emits MDX files directly into `src/content/{publications,events,people}/`. No manual copy-paste; no intermediate CSV/JSON step.
- **D-02:** The scraper writes **direct MDX output** — files land straight in `src/content/` and are review-able via `git diff` after the run. No staging format or draft: true intermediate step.
- **D-03:** When the scraper cannot find a field (e.g. no DOI on a publication, no recording on an event, no headshot URL for a person), it **omits the field entirely** from the MDX frontmatter. All affected fields (`pdf`, `doi`, `abstract`, `recording`, `slides`, `speakerPhoto`, `photo`) are already `optional` in the Zod schema — the site renders gracefully without them.

### Claude's Discretion
- Slug derivation: generate kebab-case slugs from content titles (matching existing sample pattern: `llm-opioid-reddit.mdx`, `ai-normal-technology.mdx`, `bill-howe.mdx`). Claude can handle edge cases (duplicate titles, long titles, special characters).
- Asset download strategy: download author headshots to `site/public/images/people/` and publication PDFs to `site/public/pdfs/` as part of the scraper run or as a separate asset-fetch pass.
- `linkedPublications` / `linkedTalks` on people: wire these up during migration where associations are identifiable from the existing site, leave as empty arrays otherwise.
- Sample article (MIG-04): topic and length are Claude's discretion — should be something relevant to the RAISE mission (responsible AI at UW).
- Slug uniqueness: if two publications share a near-identical title, append year or first author initial to disambiguate.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Content schemas (authoritative field definitions)
- `site/src/content.config.ts` — Zod schemas for all four collections. Required vs. optional fields, type constraints (z.string().url(), z.coerce.date(), z.enum for role), and reference() wiring for linkedPublications/linkedTalks. This is the single source of truth for what goes in each MDX file.

### MDX sample patterns (use as templates)
- `site/src/content/people/bill-howe.mdx` — Person MDX structure: frontmatter + bio prose body
- `site/src/content/events/ai-normal-technology.mdx` — Event MDX structure: frontmatter only (no prose body needed)
- `site/src/content/publications/llm-opioid-reddit.mdx` — Publication MDX structure: frontmatter only

### Phase requirements
- `.planning/ROADMAP.md` §"Phase 2: Content Migration" — Goal, requirements MIG-01..05, success criteria
- `.planning/REQUIREMENTS.md` §"Content Migration" — Acceptance criteria for MIG-01..05 with specific counts (~40 publications, 50+ events, 16 people)

### Asset output locations
- `site/public/images/` — author headshots and any image assets (people photos referenced as `/images/people/{name}.jpg` etc.)
- `site/public/pdfs/` — publication PDFs referenced as `/pdfs/{slug}.pdf`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/src/content.config.ts` — schemas define exactly what frontmatter each MDX file needs; scraper should emit fields matching these exactly
- Existing sample MDX files — 3 people, 2 events, 2 publications establish the exact frontmatter format and prose pattern to replicate

### Established Patterns
- **Slug as filename:** `kebab-case-title.mdx` — entry `.id` in Astro 6 is derived from filename (no `.slug`); keep slugs short, lowercase, hyphenated
- **Optional fields:** schema marks `pdf`, `doi`, `abstract`, `recording`, `slides`, `speakerBio`, `speakerPhoto`, `photo`, `email`, `x`, `linkedin`, `website` as optional — omit rather than leaving empty strings (would break `z.string().url()` validators)
- **`upcoming` flag on events:** boolean, default false — only set true for events with future dates
- **`order` on people:** controls display order in the people index; set based on role prominence (leadership first, lower numbers = higher position)

### Integration Points
- Scraped MDX files drop into `site/src/content/{publications,events,people,articles}/` — Astro's glob loader picks them up automatically at build time
- Asset files drop into `site/public/images/` and `site/public/pdfs/` — referenced as absolute paths `/images/...` and `/pdfs/...` in frontmatter
- `linkedPublications` and `linkedTalks` in people frontmatter must reference valid entry IDs (the filename without extension) from the publications and events collections

</code_context>

<specifics>
## Specific Ideas

- Scraper target: https://raise.uw.edu — publications, events, and people pages. The WordPress site has structured HTML that should be parseable.
- Slug pattern already established by samples: short, lowercase, hyphen-separated, derived from title keywords (not full title).
- The `role` field on people uses a strict enum: `leadership | affiliate | staff | alumni` — map existing RAISE team roles to one of these four values during scrape.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-content-migration*
*Context gathered: 2026-04-17*
