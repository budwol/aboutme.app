# 16. Layer boundaries are enforced by ESLint and a CI circular-dependency gate, not just documented

Date: 2026-09-11

## Status

Accepted

## Context

[ADR 15](0015-app-wide-state-lives-outside-components.md) established a one-directional layer order (`utils/constants` → `app-data/storage/theme/i18n` → `state` → `components`/`navigation` → `app`) and fixed the one place it was violated. The same review pass also found and fixed a circular import (`WnaImage` ↔ `WnaImageElement`, closed through a shared type file) via `madge --circular`. Both were real defects that existed despite the ADRs describing the intended shape — documentation alone doesn't stop a future change from quietly reintroducing either kind of problem, and neither issue produces a TypeScript or runtime error on its own.

## Decision

Two automated gates back the documented layering:

- **`eslint.config.cjs`** adds an `import/no-restricted-paths` block (via `eslint-plugin-import`, already a transitive dependency of `eslint-config-expo` — no new dependency needed) scoped to `src/**/*.{ts,tsx}`, with three zones mirroring ADR 15's order: foundational modules (`utils`, `constants`, `app-data`, `storage`, `theme`, `i18n`) may never import `state`, `components`, `navigation`, or `app`; `state` may never import `components`, `navigation`, or `app`; and `components`/`navigation` may never import `app`. `components` and `navigation` are deliberately left free to import each other in both directions — `components/screens/*Route.tsx` needs route-path helpers from `navigation/routes/`, and `navigation/components/*` (drawer, tab chrome) needs base UI from `components/buttons`, `components/images`, etc. — that's a real, necessary sibling relationship, not a layering violation, and forcing a total order between them would just break working code for no benefit.
- **`npm run test:circular`** (`madge --circular --extensions ts,tsx --ts-config tsconfig.json src`) runs as its own step in `ci-lint-prettier.yml` (after `types`), in `scripts/ci-local.sh`, and in `npm run test:all` — anywhere the existing `lint`/`test:types` gate runs, `test:circular` runs alongside it.

## Consequences

- A PR that reintroduces the `navigation → components` state coupling ADR 15 removed, or any other upward import across the zones above, now fails `npm run lint` locally and in CI (`ci-lint-prettier.yml`) — not just a future code review.
- A PR that reintroduces a cycle like the `WnaImage`/`WnaImageElement` one fails `npm run test:circular` the same way.
- The `import/no-restricted-paths` zones encode the boundary between tiers, not a strict order _within_ the foundational tier (`utils`/`constants`/`app-data`/`storage`/`theme`/`i18n` may freely reference each other — e.g. `constants` imports `utils`, `utils/themeColors` imports a type from `storage/themeStorage`) or between `components`/`navigation`. Only the well-established, evidence-backed boundaries are enforced; this rule set doesn't claim to have caught every possible misplacement (it wouldn't have caught `WnaAppContext` sitting in the wrong folder in the first place — that's a placement judgment call, not an import-direction violation) — it guards regressions of the two specific defects this review found.
