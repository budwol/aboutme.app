# 18. `export:web` always clears the Metro bundler cache

Date: 2026-09-11

## Status

Accepted

## Context

Production served `app version 1.1.0` in the drawer menu footer after `package.json` had already been bumped to `1.2.0`. Investigation traced it to Metro's persistent bundler cache at `/tmp/metro-cache`, which is a machine-wide temp directory, not scoped to this project or invalidated by a `package.json` version bump. A plain `npx expo export -p web` reused a cached build from before the bump and silently re-embedded the old `extra.appVersion` value into the JS bundle, even though `app.config.ts` and `package.json` were both correct on disk. Clearing the cache (`rm -rf /tmp/metro-cache`, or `expo export -c`) and re-exporting immediately produced a bundle with the correct version.

## Decision

`npm run export:web` now passes `-c` (`--clear`) to `expo export`, so every production export starts from a clean bundler cache instead of trusting a machine-wide temp cache to be correctly invalidated.

## Consequences

- Every `export:web` run pays the cost of a cold Metro build. `export:web` already runs the full local CI pipeline first, so this is a small addition relative to total time, and correctness matters more than export speed for a release step.
- `npm run web` (dev server) is unaffected and keeps using Metro's incremental cache for fast local iteration.
- If a future release again shows a stale value that traces to `app.config.ts`/`extra`, check for other machine-wide or CI-runner-wide caches (e.g. a persisted `/tmp` or Docker layer cache) before assuming the source is wrong.

Update 2026-09-15: Expo/Metro (and `app.config.ts`) were removed in favor of Vite. `export:web` now runs a plain `vite build`, which reads `package.json`'s version fresh into a build-time `__APP_VERSION__` constant on every run — there is no persistent, machine-wide bundler cache in the same shape as Metro's, so this specific failure mode no longer applies. Kept for the historical record; a future equivalent (e.g. a stale Vite dep-optimization cache under `node_modules/.vite`) should still be suspected first if a build ever again ships a version that doesn't match `package.json`.
