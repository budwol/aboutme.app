# 12. Component tests use react-test-renderer, not `@testing-library/react-native`

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

Component tests need to (a) assert on rendered props/config of child components and (b) simulate user interaction (pressing a button) and assert on the resulting side effect (navigation, a callback). Two different libraries can do this in this codebase's toolchain: `react-test-renderer` (already a dependency of `react`/Expo's test preset) and `@testing-library/react-native` (RNTL), which was present as a devDependency but only used in 2 of 38 component test files.

## Decision

All component tests use `react-test-renderer`, not RNTL. Child components (especially leaf UI primitives like `WnaButtonHeader`) are mocked with `jest.mock` to render as a tagged host element via `createElement("WnaXxx", props)`, so the test can locate them with `tree.root.findByType("WnaXxx")` and assert directly on `.props` (text, icon, style) or invoke `.props.onPress()` inside `act(...)` to simulate a press — no `fireEvent`, no `render`/`screen` queries, no text-content-based element lookup. `act()` wraps every render, update, and simulated interaction.

## Consequences

- One interaction-testing style across the whole suite: locate the mocked child by type, read or call its props directly. A reviewer never has to ask "why does this one test use `fireEvent.press` and `screen.getByText` instead of `props.onPress()`."
- `@testing-library/react-native` is not a dependency of this project. If a future test genuinely needs DOM-realistic event simulation or accessibility-role queries that `react-test-renderer` can't provide, that's a deliberate, documented exception to this ADR — not a quiet second convention living alongside the first.
- Mocking child components by tag name means these tests verify _this_ component's wiring (props passed down, callbacks invoked), not the child's own rendered output — that's the child's own test file's job.
