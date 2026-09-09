# 5. Components follow a `WnaXxx` directory-with-barrel convention

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

The component tree under `src/components/` and `src/navigation/components/` is large and needs a predictable shape so any component can be found, imported, and tested the same way.

## Decision

Every non-trivial component is named `WnaXxx` (the app's `Wna` prefix) and, when it has its own concerns (props, tests), lives in its own directory: `WnaXxx/WnaXxx.tsx` + `WnaXxx/WnaXxx.test.tsx` + `WnaXxx/index.ts` re-exporting the default. Simple leaf components/utilities that don't need a directory are single files directly under their category folder (e.g. `src/components/text/WnaSectionTitle.tsx`). Categories are organized by role, not by feature: `buttons/`, `cards/`, `screens/`, `sections/`, `display/`, `images/`, `effects/`, `feedback/`, `icon/`, `text/`, `theme/`.

## Consequences

- Import paths are always `@components/<category>/WnaXxx` (or `@/navigation/components/WnaXxx`), resolved via the `@components`/`@` path aliases in `tsconfig.json`/`jest.config.cjs`, never relative deep imports.
- A reviewer can predict where a new component belongs from its role alone, and predict that `WnaXxx.test.tsx` sits next to it.
- No violations of the naming/placement convention were found during the 2026-09-09 audit.
