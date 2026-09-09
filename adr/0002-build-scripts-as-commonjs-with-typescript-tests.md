# 2. Build and deploy tooling is plain CommonJS, tested from TypeScript specs

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

The app source is TypeScript compiled/bundled by Metro through Expo. Build-time tooling (data sync, env parsing, asset generation) runs directly under plain Node before or alongside that toolchain — it can't depend on Metro/Babel being available and needs to stay runnable with a bare `node scripts/x.cjs`.

## Decision

Tooling scripts live in `scripts/*.cjs` as plain, dependency-light CommonJS (`sync-web-app-data.cjs`, `env-parser.cjs`, `init-process.cjs`). Each exports its core function(s) via `module.exports` and additionally runs as a CLI when invoked directly (`if (require.main === module)`). Each script gets exactly one matching TypeScript test file under `src/scripts/<camelCaseName>/index.test.ts`, which does `require("../../../scripts/x.cjs")` (with `/* eslint-disable @typescript-eslint/no-require-imports */`) so the tests can still run through the project's Jest/TypeScript setup rather than a separate Node-only test runner. Multiple concerns within one script (e.g. `init-process.cjs`'s URL/CSP validation vs. its end-to-end init workflow) stay in that single test file as separate `describe` blocks rather than splitting across directories — the 1:1 script-to-directory mapping is not negotiable, only the internal grouping of `it`s within it is.

## Consequences

- Adding a new build script means also adding `src/scripts/<name>/index.test.ts` — there's no test co-located with the `.cjs` file itself.
- Scripts occasionally need a Jest environment override (`@jest-environment node` docblock) plus restoring native `TextDecoder`/`TextEncoder` when a script pulls in a Node-only third-party dependency (see `src/scripts/generateResumePdf/index.test.ts`), because the default RN test environment's export conditions and global polyfills target the app runtime, not plain Node.
- `src/scripts/packageScripts/index.test.ts` is not part of this convention at all — it doesn't test a `scripts/*.cjs` file, it asserts invariants between `package.json`'s scripts and `app.config.ts` (e.g. that the app version has one source of truth). It's named after what it tests, same as every other directory here, it just happens not to be a build script.
