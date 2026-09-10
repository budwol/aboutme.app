# 9. CI is split into single-concern reusable workflows chained by `needs`

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

The check suite spans several slow, different-shaped stages: formatting, unit tests, coverage, integration tests, a dry-run of `init.sh`, a smoke export, and Playwright e2e — each with different failure modes and different value in catching a broken PR early versus late.

## Decision

Each concern is its own reusable workflow file under `.github/workflows/` (`ci-lint-prettier.yml`, `ci-unit.yml`, `ci-coverage.yml`, `ci-integration.yml`, `ci-dry-run.yml`, `ci-smoke.yml`, `ci-e2e.yml`), declared with `on: workflow_call`. `ci.yml` is the entry point triggered on push/PR and chains them via job-level `needs:` in cheapest-and-most-likely-to-fail-first order: `lint_prettier → unit → coverage → integration → dry_run → smoke → e2e`. `package.json`'s `npm run test:all` and `npm run ci:local` mirror roughly the same order locally.

## Consequences

- A failure short-circuits the rest of the chain, so contributors get the fastest, cheapest signal (formatting) before CI spends time on the slowest stage (e2e).
- Adding a new CI concern means adding a new `workflow_call` file and inserting it into the `needs` chain in `ci.yml` at the appropriate cost/likelihood position, not appending steps to an existing workflow.
- Coverage is intentionally its own workflow_call rather than part of `ci-unit.yml`. Unit failures should stay quick to read, while `ci-coverage.yml` enforces the stricter 100% line/branch threshold from [ADR 0013](0013-100-percent-line-and-branch-coverage-target.md) before CI spends time on integration, smoke, or e2e.
