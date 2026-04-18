# Phase 2: Content Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 02-content-migration
**Areas discussed:** Extraction method

---

## Extraction method

### Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Script scraper | Write a Node/Python script to crawl raise.uw.edu, parse HTML, emit MDX files | ✓ |
| Manual copy-paste | Hand-author each MDX file by reading raise.uw.edu | |
| Hybrid | Script extracts raw fields, human reviews and fills gaps | |

**User's choice:** Script scraper

---

### Output format

| Option | Description | Selected |
|--------|-------------|----------|
| Direct MDX | Script writes MDX files straight into src/content/ | ✓ |
| JSON/CSV intermediate | Script dumps data file first, human reviews, then second pass converts | |
| Draft MDX + review flag | Script writes MDX with draft: true frontmatter, unflagged after review | |

**User's choice:** Direct MDX

---

### Missing field handling

| Option | Description | Selected |
|--------|-------------|----------|
| Omit the field | Leave optional fields out of frontmatter entirely | ✓ |
| Placeholder comment | Write YAML comment # TODO: fill in doi | |
| Empty string / null | Write doi: '' or doi: null | |

**User's choice:** Omit the field

---

## Claude's Discretion

- Slug derivation (kebab-case from title, matching existing sample pattern)
- Asset download strategy (headshots to public/images/, PDFs to public/pdfs/)
- linkedPublications / linkedTalks wiring (where identifiable from existing site)
- Sample article topic and length (MIG-04)

## Deferred Ideas

None.
