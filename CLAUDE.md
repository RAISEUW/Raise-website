<!-- GSD:project-start source:PROJECT.md -->
## Project

**RAISE Website Redesign**

A complete redesign of raise.uw.edu — the UW RAISE Center's public website — replacing the existing WordPress site with a modern, minimal, animated static site built on Astro 6. The site serves researchers, students, faculty, civic organizations, and the general public interested in responsible AI at the University of Washington. Non-technical faculty and staff can edit content through a Decap CMS web interface without touching code.

**Core Value:** A beautiful, fast, searchable home for RAISE's research, people, events, and articles — that anyone on the team can keep up-to-date.

### Constraints

- **Budget**: Free forever — Cloudflare Pages (hosting), Decap CMS (git-based, no DB cost), Google Fonts (typography)
- **Tech stack**: Astro 6 + Tailwind v4 + MDX + Pagefind + Decap CMS + Lenis + Motion (already chosen, site scaffold built)
- **Animation**: Subtle & refined — every animation has a purpose, none exceeds 600ms, prefers-reduced-motion respected
- **Accessibility**: No JS required for content — Astro islands only for interactive UI (filter, search, CMS)
- **DNS**: raise.uw.edu is a UW subdomain — DNS cutover requires UW IT coordination; deploy at Cloudflare URL first
- **Editors**: 3-4 non-technical collaborators must be able to add content through /admin without touching code
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
