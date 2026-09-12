---
name: frontend-quality
description: Improve and verify frontend usability, accessibility, responsive behavior, navigation, visual states, loading feedback, and interaction quality.
---

# Frontend Quality

Use this skill for frontend regressions, visual inconsistencies, responsive issues, accessibility gaps, or interaction behavior.

## Workflow

1. Read the existing design system, component conventions, routes, test helpers, and relevant product flows.
2. Verify the complete user workflow across desktop and mobile states, including loading, empty, error, focus, hover, and disabled states.
3. Check semantic roles, keyboard access, accessible names, contrast, reading order, and screen-reader-relevant state changes.
4. Check layout stability, overflow, text fitting, media loading, responsive breakpoints, and navigation transitions.
5. Prefer existing icon, typography, spacing, and motion patterns over introducing parallel styles.
6. Add interaction tests that assert user-visible behavior and visual checks only where they protect a meaningful invariant.
7. Verify that fixes do not remove background media, break transitions, or introduce console/request errors.
