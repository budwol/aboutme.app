# 15. App-wide state lives in `src/state/`, separate from `src/components/`

Date: 2026-09-11

## Status

Accepted

## Context

`WnaAppContext.tsx` (the four app-wide contexts — lifecycle, layout, theme, app-data — and their `useWnaXxx` hooks) used to live directly under `src/components/`, alongside the actual UI component tree. It has 23 import sites spanning `src/app/`, `src/components/`, and `src/navigation/` — every top-level layer depends on it. Its own imports are `app-data/`, `constants/`, `theme/`, `storage/` — never a UI component.

A senior-level architecture review (2026-09-11) traced import direction across the whole tree and found the codebase otherwise keeps a clean, one-directional dependency graph: `utils/`, `constants/`, `app-data/`, `theme/`, `storage/`, `i18n/` never import upward into `components/`, `navigation/`, or `app/`. The one exception was `src/navigation/hooks/useWnaNavigationTransition.ts` reaching into `@components/WnaAppContext` purely to read lifecycle state — an artificial coupling that existed only because the state container happened to be filed under the component tree, not because navigation logic has any real dependency on UI components.

`src/components/currentAppVersion.ts` had the same kind of misplacement on a smaller scale: a pure function with no JSX, shaped exactly like the flat helpers in `src/utils/` (`cleanAndTruncate.ts`, `colorConverter.ts`), sitting under `components/` instead. Both files were also the only two sitting uncategorized at the `src/components/` root — neither fit any of the role categories from [ADR 5](0005-wna-component-module-convention.md), which was itself a signal they didn't belong in that tree.

## Decision

`WnaAppContext.tsx` (+ its test) moved to `src/state/WnaAppContext.tsx`, a new top-level module and peer to `app-data/`, `storage/`, `theme/`, `i18n/` — resolved via the generic `@/state/WnaAppContext` path (the `@/*` → `src/*` alias), the same pattern already used for those peers rather than a dedicated `@state` alias. `currentAppVersion.ts` (+ its test) moved to `src/utils/currentAppVersion.ts`.

`src/components/` now holds only the UI component tree: role-categorized folders (`buttons/`, `cards/`, `chrome/`, `screens/`, `sections/`, ...) plus `WnaApp/` (the root shell component — legitimately uncategorized, there's only one). Nothing sits at its root anymore that isn't a real, renderable component.

## Consequences

- `navigation/hooks/useWnaNavigationTransition.ts` now imports `@/state/WnaAppContext` directly — the `navigation → components` coupling is gone, not just hidden.
- A new file that isn't a renderable UI component (another cross-cutting state container, another pure app-config reader) has an obvious home: `src/state/` or `src/utils/`, not `src/components/` root.
- `src/navigation/config/wnaTabLayoutConfig.ts` still imports `iconMap` from `@components/icon/WnaIcon/WnaIconMap` — that's a pure data dictionary (icon name → SVG path), not a component, so it doesn't represent the same layering problem and wasn't moved.
