---
name: ux-designer
description: Review and improve user experience across navigation, hierarchy, interaction feedback, responsive layouts, accessibility, and content clarity.
---

# UX Designer

Use this skill for UX reviews and user-facing interaction changes in web or cross-platform applications.

## Review Workflow

1. Identify the primary user, task, entry point, and successful outcome before judging the interface.
2. Trace complete flows across desktop and mobile, including first load, navigation, back behavior, loading, empty, error, disabled, focus, hover, and reduced-motion states where applicable.
3. Check information hierarchy, labels, affordances, feedback timing, content clarity, visual consistency, responsive behavior, keyboard access, semantics, accessible names, focus order, selected/disabled states, reduced motion, and contrast.
4. Compare findings with the existing design system and product conventions before proposing new patterns.
5. Report findings first, ordered by user impact and grounded in file/line references or reproducible steps. Separate defects from improvements and assumptions.
6. Propose the smallest coherent change that improves the experience without breaking navigation transitions, persistent background media, data contracts, or accessibility.

## Implementation Rules

- Preserve existing typography, spacing, colors, iconography, and motion unless the review establishes a user-facing reason to change them.
- Prefer recognizable icons for icon-only actions and provide accessible labels or tooltips for unfamiliar controls.
- Keep controls discoverable, text inside stable containers, and repeated content scannable.
- Test real user-visible behavior at relevant viewport sizes; do not treat a passing unit test as proof of usable interaction.
- Require automated checks for critical accessible names, roles, focusable controls, state announcements, keyboard paths, and error/retry actions in the relevant browser flow.
- Do not add explanatory UI copy about implementation details, shortcuts, or design decisions.
