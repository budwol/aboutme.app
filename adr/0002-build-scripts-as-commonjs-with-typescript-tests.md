# 2. Build and deploy tooling is plain CommonJS, tested from TypeScript specs

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation), one known deviation noted below

## Context

The app source is TypeScript compiled/bundled by Metro through Expo. Build-time tooling (data sync, env parsing, asset generation) runs directly under plain Node before or alongside that toolchain — it can't depend on Metro/Babel being available and needs to stay runnable with a bare `node scripts/x.cjs`.

## Decision

Tooling scripts live in `scripts/*.cjs` as plain, dependency-light CommonJS (`sync-web-app-data.cjs`, `env-parser.cjs`, `init-process.cjs`). Each exports its core function(s) via `module.exports` and additionally runs as a CLI when invoked directly (`if (require.main === module)`). Each script gets a matching TypeScript test file under `src/scripts/<camelCaseName>/index.test.ts`, which does `require("../../../scripts/x.cjs")` (with `/* eslint-disable @typescript-eslint/no-require-imports */`) so the tests can still run through the project's Jest/TypeScript setup rather than a separate Node-only test runner.

## Consequences

- Adding a new build script means also adding `src/scripts/<name>/index.test.ts` — there's no test co-located with the `.cjs` file itself.
- Scripts occasionally need a Jest environment override (`@jest-environment node` docblock) plus restoring native `TextDecoder`/`TextEncoder` when a script pulls in a Node-only third-party dependency (see `src/scripts/generateResumePdf/index.test.ts`), because the default RN test environment's export conditions and global polyfills target the app runtime, not plain Node.
- Known deviation: `scripts/init-process.cjs` doesn't have a single 1:1 test directory. Its logic is exercised indirectly across `src/scripts/initProcessSecurity/index.test.ts` and `src/scripts/initScript/index.test.ts`, split by concern rather than by source file. `src/scripts/packageScripts/index.test.ts` also doesn't test a `scripts/*.cjs` file at all — it tests `app.config.ts`. Any cleanup of this convention should either fold these into one `src/scripts/initProcess/` directory or explicitly document the split-by-concern exception.
