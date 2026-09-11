# 17. Naming avoids C#/Java conventions; overlapping type names are disambiguated by owner

Date: 2026-09-11

## Status

Accepted

## Context

A naming review (2026-09-11) found a handful of C#/Java-flavored patterns that don't match the rest of the codebase's idiomatic TypeScript style, plus a few component/type names that were either ambiguous, word-order-inconsistent, or collided with an unrelated type of the same name in the same category:

- `src/utils/logger.ts` and `src/utils/loggerBase/index.ts` were the only two files anywhere under `src/` using `class` with only `public static` methods, never instantiated — the classic C#/Java "static utility class" shape.
- `src/utils/loggerBase/index.ts` used a numeric `enum LogPrefix` — the only `enum` anywhere in `src/`; everywhere else the codebase uses string-literal union types (`WnaRouteLang = "de" | "en"`, `RepoVisibility = "private" | "public"`, ...).
- `src/utils/stringHelper.ts` used the vague `Helper` suffix common to `.NET`/Java utility classes (`StringHelper`, `DateHelper`); it exports exactly one function, `cleanAndTruncate`.
- `src/utils/appConfig/shared.ts` was a generic, content-free filename (see [ADR 14](0014-wna-side-file-naming-convention.md), which already flagged this pattern for component side-files).
- `IWnaCardSmallVerticalProps` and `IWnaCardVerticalWithImageProps` were the only two type declarations anywhere in `src/components/` using an `I`-prefix — C#/Java interface Hungarian notation. 26 other components declare `type XxxProps = {...}`; these two used `interface IXxx extends ... {...}` instead.
- `WnaBasePressable`'s own prop/state types were named `WnaPressableProps`/`WnaPressableState` — identical names to, but a different shape than, `WnaPressable.tsx`'s own `WnaPressableProps`/`WnaPressableState` (its public-facing parent). The "Base" direction itself is correct — `WnaBasePressable` is genuinely the simpler primitive `WnaPressable` composes on top of — only the type names collided.
- A few component names didn't say what they do clearly, or overlapped with a sibling's name: `WnaButtonIconInnerIcon` (double "Icon"), `WnaCardSmallVertical`/`WnaCardVerticalWithImage` (inconsistent modifier order), `WnaSectionFooterAction` (repeats its own category name), `WnaMenuHeaderRight`/`WnaNavigationHeaderButtonRight` (both "something in the header-right slot", not distinguishable by name alone — one opens the drawer, the other navigates to a fixed route).

## Decision

- `Logger`/`LoggerBase` are now plain exported objects of functions (`const Logger = { info(...) {}, ... }; export default Logger;`), not classes. Call sites (`Logger.info(...)`) are unchanged.
- `LogPrefix` enum replaced with `export type LogLevel = "log" | "info" | "warn" | "error"`; the internal switch is now a named export `writeLog(level, msg, methodName?)` instead of a private static method — which also made the "unrecognized level falls back to plain log" test case safely reachable through the public API (`writeLog("log", ...)`) instead of needing a cast-and-call around TypeScript's `private`.
- `stringHelper.ts` → `cleanAndTruncate.ts` (named after its one export). `appConfig/shared.ts` → `appConfig/siteUrl.ts` (named after what it validates/normalizes).
- The two `I`-prefixed interfaces became `type WnaCardVerticalSmallProps`/`type WnaCardVerticalImageProps` (see the renames below), dropping both the `I` prefix and `interface`/`extends` in favor of `type` + intersection (`&`), matching the dominant pattern.
- `WnaBasePressable`'s types renamed to `WnaBasePressableProps`/`WnaBasePressableState` (files: `wnaBasePressableProps.ts`/`wnaBasePressableState.ts`) — owner-prefixed per ADR 14, no longer colliding with `WnaPressable.tsx`'s own types.
- Component renames (old → new, folder + file + component + exported Props type + test + every import site + every `jest.mock` string):
  - `WnaButtonIconInnerIcon` → `WnaButtonIconBadge` (renders the circular colored badge + icon glyph, not just "an icon")
  - `WnaCardSmallVertical` → `WnaCardVerticalSmall`, `WnaCardVerticalWithImage` → `WnaCardVerticalImage` (consistent `WnaCard<Orientation><Variant>` order)
  - `WnaSectionFooterAction` → `WnaFooterActionLink` (drops the redundant "Section")
  - `WnaMenuHeaderRight` → `WnaMenuToggleButton` (opens the drawer), `WnaNavigationHeaderButtonRight` → `WnaHeaderRouteButton` (navigates to a fixed route) — names now say what each one actually does instead of both saying "header right"

`WnaSurfaceCard` was investigated and left unrenamed: it looked like it might be a shared base the other `cards/` components build on, but its only consumers are top-level screens and `WnaNavigationItem` — it's a standalone generic surface/panel, not a base class, so "Surface" is accurate as-is.

- 2026-09-11 follow-up (locality pass, same day): `sections/` held five components ending in `Card` (`WnaProfileCard`, `WnaContactCard`, `WnaExperienceCard`, `WnaTechStackCard`, `WnaProjectsCard`) — full page-content sections that happen to render as a card — sitting alongside `cards/`, the category for the actual generic card primitives (`WnaSurfaceCard`, `WnaCardTextContent`, `WnaCardVerticalSmall`, `WnaCardVerticalImage`). The role-based split itself is intentional (confirmed in the 2026-09-09 audit), but "Card" in a name gave no hint which of the two categories a component actually lived in. Renamed to `WnaProfileSection`, `WnaContactSection`, `WnaExperienceSection`, `WnaTechStackSection`, `WnaProjectsSection` — same folder/file/type/test/`jest.mock` treatment as the renames above, done together with the locality pass in ADR 5 since most of these also lost their (extra-file-free) directory in the same commit.

## Consequences

- No `class`, `enum`, `I`-prefixed interface, or `Helper`-suffixed file remains anywhere under `src/`.
- Every renamed component's folder, file, exported symbol, test file, and every `jest.mock(...)` string were updated together in the same pass — grep for any of the old names across `src/`, `tests/`, and `adr/` returns nothing (aside from `adr/0014` and this file's own "old → new" history above, which name the old form on purpose).
- Full verification after each rename group (not just at the end): `tsc`, `eslint` (including the ADR 16 boundary rule), `madge --circular`, `jest --coverage src` (100/100 throughout), `jest tests/integration`, `prettier --check .`.
