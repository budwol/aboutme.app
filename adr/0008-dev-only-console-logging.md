# 8. Console logging is dev-only; production logging is a no-op facade

Date: 2026-09-09

## Status

Accepted

## Context

`app.config.ts` pins `platforms: ["web"]` — this app has no native target and ships as a static web export with no server-side log sink. There's no on-device file to inspect and no user-facing reason to write logs to disk, so the only real transport is the browser console, and even that is only useful while developing.

## Decision

`src/utils/logger.ts` (imported everywhere as `Logger`, aliased in Jest as `wna-logger`) is a static-method facade with no direct dependency on the real implementation. Its `ensureLogger()` helper lazily `require()`s `src/utils/logger.base` (which wraps `react-native-logs`'s `mapConsoleTransport`, routing each level to the matching `console.log/info/warn/error`) only when `__DEV__` is true. In production, every `Logger.info/warn/error/...` call is a guarded no-op (`LoggerBase?.x()` against a `null` reference).

## Consequences

- Call sites never branch on environment themselves — `Logger.error(...)` is always safe to call, dev or prod.
- Production builds never pull `react-native-logs` into the executed code path, and never print anything to the browser console — including errors. There is no log aggregation service behind this static site, so a swallowed production error has nowhere to go anyway; if that ever changes (e.g. a real error-tracking sink gets added), this dev-only gate is the first thing to revisit.
- `src/utils/logger.base` has no native file-system dependency (no `expo-file-system`/`expo-sharing`) — it's a thin console-transport wrapper, so there's no native-only branch to keep in sync with the web-only `platforms` config.
