---
status: partial
phase: 01-complete-the-site-surface
source: [01-VERIFICATION.md]
started: 2026-04-18T00:00:00Z
updated: 2026-04-18T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. View Transition Smoothness
expected: Nav link clicks between routes fade softly — no full-page flash
result: [pending]

### 2. Hero Stagger Cadence
expected: Event/article/person detail hero 5-element stagger completes within 600ms
result: [pending]

### 3. Scroll Reveal
expected: Cards on index and detail pages fade in at viewport threshold (0.15)
result: [pending]

### 4. Reduced-Motion Short-Circuit
expected: DevTools prefers-reduced-motion: reduce → all content immediately visible, Lenis inactive
result: [pending]

### 5. Lenis Smooth Scroll
expected: Mouse-wheel scroll feels eased/smoothed on desktop
result: [pending]

### 6. Pagefind Search
expected: /search → keyword returns results; nonsense query shows "No matches for that search."
result: [pending]

### 7. 404 Page
expected: /does-not-exist renders 404.astro with hero-stagger and CTAs
result: [pending]

### 8. BRD-03 Visual QA
expected: Typography/spacing/color consistent across all pages; light theme only
result: [pending]

### 9. ANI-02 Homepage Hero
expected: Hard-refresh / → stagger animation fires within 600ms
result: [pending]

## Summary

total: 9
passed: 0
issues: 0
pending: 9
skipped: 0
blocked: 0

## Gaps
