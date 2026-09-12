# 13. 100% coverage is the target, enforced via `coverageThreshold`

Date: 2026-09-09

## Status

Accepted and enforced

## Context

Prior to this ADR, `jest.config.cjs` had no `collectCoverageFrom`, so `--coverage` only measured files a test happened to load, transitively or not. A file with zero tests that nothing else imports never appeared in the report at all — it wasn't "0% covered", it was invisible, silently excluded from both numerator and denominator. That made any coverage percentage read off that report optimistic and, more importantly, not a trustworthy gate: a new untested file couldn't lower the number unless something already-tested happened to import it. ADR 0009 already flagged the related gap that no CI workflow runs `jest --coverage` at all.

## Decision

The target is 100% line coverage and 100% branch coverage across the instrumented application code. `jest.config.cjs` measures `src/**/*.{ts,tsx}`; test files and `.d.ts` declaration files are excluded. Build scripts under `scripts/` are tested through their dedicated Jest suites and the full CI pipeline, but are not part of this Istanbul threshold because their CLI entry points and external tool adapters are process-boundary code. `jest.config.cjs` sets:

- `collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.test.{ts,tsx}", "!src/**/*.d.ts"]` — so every application source file is measured, whether or not any test happens to load it.
- `coverageThreshold.global: { branches: 100, lines: 100, functions: 100, statements: 100 }` — so `jest --coverage` fails when any tracked metric drops below 100%, not just when it regresses from whatever the last measured number happened to be.

`npm run test:coverage` runs `jest --coverage` against `src`. It is wired into `ci:local`, `test:all`, and the GitHub Actions chain via `ci-coverage.yml`, after the unit gate and before integration.

## Interpretation

The percentage is only meaningful when the report's file list is inspected as well. A `0/0` entry means that a file has no executable instrumentable statements, typically because it contains only TypeScript types or an Expo Router re-export. It is not evidence that runtime behavior was tested. Route behavior is covered by direct component/integration/E2E tests; pure re-export files remain structural entry points. Build scripts are verified by their dedicated tests and by the full pipeline.

## Consequences

- Lines, branches, statements, and functions are all enforced at 100%.
- Playwright E2E coverage does not contribute to the Jest percentage. Critical route behavior therefore needs Jest or integration assertions as well as E2E coverage where the behavior warrants both.
- Every new file added under `src/` is now in-scope by default (the glob, not a maintained list) — a PR that adds an untested file makes the number worse immediately, it can't hide the way it could before this ADR.
- CI now has a dedicated coverage gate. The next risk is runtime cost rather than trust: if coverage gets slow enough to hurt feedback, tune Jest execution, not the threshold.
