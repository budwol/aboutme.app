---
name: performance-engineer
description: Analyze and improve web performance using measured evidence from Lighthouse, bundles, assets, network behavior, rendering work, and caching.
---

# Performance Engineer

Use this skill when performance reports, bundle size, loading speed, asset delivery, or runtime responsiveness need improvement.

## Workflow

1. Establish a reproducible baseline and record the report date, URL, viewport, throttling, and build mode.
2. Inspect the full Lighthouse JSON, not only the headline score. Separate measurable bottlenecks from intentional policy decisions such as `noindex`.
3. Identify the largest contributors: JavaScript transfer and execution, images, fonts, third-party requests, layout shifts, and cache misses.
4. Fix the highest-impact cause with the smallest behavioral change, then rebuild and measure again under the same conditions.
5. Verify responsive image selection, intrinsic dimensions, lazy loading, compression, cache headers, and critical rendering paths.
6. Check that optimizations preserve visual fidelity, navigation transitions, accessibility, and offline/fallback behavior.

## Rules

- Do not optimize from intuition when a trace or report can establish the cause.
- Do not remove required metadata or indexing restrictions to improve a score.
- Report before/after measurements and residual trade-offs.
