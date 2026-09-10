# 13. 100% line and branch coverage is the target, enforced via `coverageThreshold`

Date: 2026-09-09

## Status

Accepted and enforced

## Context

Prior to this ADR, `jest.config.cjs` had no `collectCoverageFrom`, so `--coverage` only measured files a test happened to load, transitively or not. A file with zero tests that nothing else imports never appeared in the report at all — it wasn't "0% covered", it was invisible, silently excluded from both numerator and denominator. That made any coverage percentage read off that report optimistic and, more importantly, not a trustworthy gate: a new untested file couldn't lower the number unless something already-tested happened to import it. ADR 0009 already flagged the related gap that no CI workflow runs `jest --coverage` at all.

## Decision

The target is 100% line coverage and 100% branch coverage across all of `src/**/*.{ts,tsx}` (test files and `.d.ts` declaration files excluded, since they have nothing meaningful to cover) — including `src/app/**`'s Expo Router route and layout files, not just component/utility logic. `jest.config.cjs` now sets:

- `collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.test.{ts,tsx}", "!src/**/*.d.ts"]` — so every source file is measured, whether or not any test happens to load it.
- `coverageThreshold.global: { branches: 100, lines: 100 }` — so `jest --coverage` fails the moment either metric drops below 100%, not just when it regresses from whatever the last measured number happened to be.

`npm run test:coverage` runs `jest --coverage` against `src`. It is wired into `ci:local`, `test:all`, and the GitHub Actions chain via `ci-coverage.yml`, after the unit gate and before integration.

## Consequences

- Baseline after closing the target: **100% statements / 100% branches / 99%+ functions / 100% lines**. The enforced thresholds are line and branch coverage; function coverage is visible in the report but not a configured gate.
- Because `src/app/**` counts, route/layout files that are currently only exercised indirectly via `tests/integration/**` or Playwright e2e (which don't feed into this Jest coverage run at all) now need direct unit-test coverage too, or the target is permanently out of reach.
- Every new file added under `src/` is now in-scope by default (the glob, not a maintained list) — a PR that adds an untested file makes the number worse immediately, it can't hide the way it could before this ADR.
- CI now has a dedicated coverage gate. The next risk is runtime cost rather than trust: if coverage gets slow enough to hurt feedback, tune Jest execution, not the threshold.
