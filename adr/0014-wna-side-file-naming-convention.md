# 14. Non-component side-files (types/styles/state) are `camelCase`, prefixed with their owner

Date: 2026-09-11

## Status

Accepted

## Context

Components are always `WnaXxx.tsx` (see [ADR 5](0005-wna-component-module-convention.md)). But a component or a category often needs a non-component side-file too — extracted prop/state types, or a `StyleSheet.create` block. Before this ADR, three incompatible patterns had grown up side by side for that case:

- category-flat, `camelCase`: `src/components/buttons/wnaButtonTypes.ts`, `wnaButtonStyles.ts`; `src/components/cards/wnaCardTypes.ts`, `wnaCardStyles.ts`, `wnaCardLayoutStyles.ts`
- component-folder, `PascalCase`-prefixed: `WnaBasePressable/WnaPressableProps.ts`, `WnaPressableState.ts`; `WnaImageElement/WnaImageElementTypes.ts`; `src/components/sections/WnaSectionProps.ts`
- component-folder, generic/unprefixed: `WnaExperienceCard/types.ts` + `styles.ts`; `WnaProjectDetailsRoute/types.ts` + `styles.ts`

Three names for the same problem made it impossible to predict, from the convention alone, what a new types/styles file should be called.

## Decision

A non-component `.ts` side-file is named `wna<Owner><Kind>.ts` — always `camelCase` (the leading lowercase letter is what marks it as "not a component" at a glance, mirroring `.tsx` vs `.ts`), prefixed with the name of the thing it belongs to (its category when shared across a category, e.g. `wnaButtonTypes.ts`, or its component when private to one component's folder, e.g. `wnaExperienceCardTypes.ts`), and suffixed with what it holds (`Types`, `Styles`, `Props`, `State`, ...). The type/const names exported from the file are unaffected by this — only the filename changes.

Applied in this pass:

- `WnaBasePressable/WnaPressableProps.ts` → `wnaPressableProps.ts`, `WnaPressableState.ts` → `wnaPressableState.ts`
- `WnaImageElement/WnaImageElementTypes.ts` → `wnaImageElementTypes.ts`
- `src/components/sections/WnaSectionProps.ts` → `wnaSectionProps.ts`
- `WnaExperienceCard/types.ts` → `wnaExperienceCardTypes.ts`, `styles.ts` → `wnaExperienceCardStyles.ts`
- `WnaProjectDetailsRoute/types.ts` → `wnaProjectDetailsRouteTypes.ts`, `styles.ts` → `wnaProjectDetailsRouteStyles.ts`

Note: `src/components/buttons/WnaPressable.tsx` (the flat, public component) separately declares its own `WnaPressableProps`/`WnaPressableState` types inline, distinct from `WnaBasePressable/wnaPressableProps.ts` — two differently-shaped types sharing the same exported name in the same category. That naming collision was a pre-existing readability hazard this ADR did not resolve at the time.

- 2026-09-11 follow-up: resolved. `WnaBasePressable`'s own types were renamed to `wnaBasePressableProps.ts`/`wnaBasePressableState.ts` (`WnaBasePressableProps`/`WnaBasePressableState`), matching the file-owner-prefix rule above. `WnaPressable.tsx` keeps `WnaPressableProps`/`WnaPressableState` as its own, now-unambiguous public prop/state types — the collision is gone, not just relocated. (The "Base" direction itself was re-examined and found correct: `WnaBasePressable` genuinely is the simpler primitive `WnaPressable` composes on top of, not the other way around.)

## Consequences

- One rule instead of three: the file's name alone tells a reader whether it's a component (`WnaXxx.tsx`) or a types/styles side-file (`wnaXxxTypes.ts`/`wnaXxxStyles.ts`), and whether it's shared category-wide or private to one component, by comparing the prefix to the enclosing folder name.
- `src/app-data/types.ts` is intentionally out of scope — it's a data-layer module, not part of the `src/components/`/`src/navigation/components/` component convention this ADR and ADR 5 cover.
