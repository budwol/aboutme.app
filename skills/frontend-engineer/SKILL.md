---
name: frontend-engineer
description: Implement maintainable frontend features and fixes across components, screens, navigation, responsive layouts, accessibility, loading states, and visual interactions.
---

# Frontend Engineer

Use this skill when implementing or changing frontend functionality. Read the existing design system, route structure, state model, test helpers, and platform conventions before editing.

## Workflow

1. Trace the user flow and identify the owning screen, component, state, data contract, and navigation boundary.
2. Reuse existing components, tokens, icons, layout primitives, and motion conventions before creating new ones.
3. Implement the complete behavior, including loading, empty, error, disabled, focus, keyboard, hover, responsive, and reduced-motion states where relevant.
4. Keep text inside stable containers, preserve layout dimensions, and verify mobile and desktop behavior.
5. Preserve existing navigation transitions, background media, caching, and platform-specific behavior unless the task explicitly changes them.
6. Use semantic elements and accessible names; ensure interactive controls are reachable and usable without a pointer.
7. Add focused tests for the new behavior and edge cases. Prefer user-visible assertions over implementation details.
8. Run formatting, linting, type checks, focused tests, and the relevant integration/E2E flow.

## Design Rules

- Follow the repository's visual language instead of introducing a parallel design system.
- Use familiar icons for icon-only actions and provide accessible labels/tooltips for unfamiliar controls.
- Keep repeated content scannable and avoid unnecessary nested cards, decorative clutter, or marketing-style layouts in product surfaces.
- Use real responsive image assets and verify that all referenced variants exist.
- Treat console errors, failed local requests, white backgrounds replacing required media, and broken transitions as implementation failures.

## Completion

Before finishing, verify the changed flow at relevant viewport sizes, confirm there are no browser or request errors, and report any environment-dependent checks that could not be executed.
