# 8. File logging is dev-only; production logging is a no-op facade

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

The app has a persistent, shareable log file for debugging on-device during development (`shareLogfileAsync`, `readLogFileAsync`), but the production build is a static web export with no server-side log sink and no user-facing reason to write logs to disk.

## Decision

`src/utils/logger.ts` (imported everywhere as `Logger`, aliased in Jest as `wna-logger`) is a static-method facade with no direct dependency on the real implementation. Its `ensureLogger()` helper lazily `require()`s `src/utils/logger.base` (which does the actual file I/O via `expo-file-system`/`expo-sharing`) only when `__DEV__` is true. In production, every `Logger.info/warn/error/...` call is a guarded no-op (`LoggerBase?.x()` against a `null` reference), and the file-system dependency is never pulled into the code path at all.

## Consequences

- Call sites never branch on environment themselves — `Logger.error(...)` is always safe to call, dev or prod.
- `src/utils/logger.base` has no test coverage risk in production bundles, but its own module currently fails to resolve `expo-file-system/legacy` in this checkout's `node_modules` (`src/utils/logger.base/index.test.ts` fails with `Cannot find module 'expo-file-system/legacy'`) — a dependency-install gap unrelated to this ADR, flagged for a `npm install`/lockfile check rather than a design change.
