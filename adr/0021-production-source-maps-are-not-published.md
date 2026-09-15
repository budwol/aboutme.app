# 21. Production web builds do not publish source maps

Date: 2026-09-12

## Context

Lighthouse reports the production bundle as missing a source map. Expo documents source maps as a bundle-analysis aid and warns against publishing them in production because they can create security and performance issues.

## Decision

Production web exports do not generate or publish source maps. `npm run export:web` runs a plain `vite build`, whose `build.sourcemap` option defaults to `false` and is left unset in `vite.config.ts` — no separate toggle is tracked. Source maps may only be enabled for a temporary local analysis export (`vite build --sourcemap`) and must not be copied into `dist` or deployed.

The `noindex, nofollow` policy remains mandatory and is unrelated to source-map handling.

Update 2026-09-15: the original mechanism (`EXPO_PUBLIC_ENABLE_SOURCE_MAPS`, `expo export --source-maps`) no longer exists — Expo's build tooling was replaced with Vite. The decision itself is unchanged.

## Consequences

- Lighthouse's missing-source-map audit is an accepted, documented finding.
- Production bundles do not expose embedded source paths or source code through public map files.
- Bundle analysis uses a separate temporary export with `--source-maps`; that artifact is deleted after analysis.
