---
name: test-engineer
description: Design, harden, and verify application test suites when coverage gaps, regressions, edge cases, or unreliable validation need to be addressed.
---

# Test Engineer

Use this skill when the task is to improve test confidence, investigate coverage claims, add missing tests, or make a validation pipeline fail for real regressions.

## Core Workflow

1. Read the repository's test configuration, scripts, CI workflow, and existing fixtures before editing tests.
2. Establish a baseline with the narrowest relevant test command, then run the complete pipeline when the change affects shared test infrastructure.
3. Inspect per-file line, branch, statement, and function coverage. Do not treat a global percentage as proof that every file or behavior is tested.
4. Identify untested behavior from implementation paths, not from the coverage number alone. Prioritize error handling, fallback logic, empty data, malformed input, boundary values, async timing, navigation transitions, and external-process failures.
5. Add behavioral assertions that would fail for a real regression. Avoid tests that only assert implementation wording, snapshots without meaningful invariants, or coverage-only execution.
6. Keep test data representative of the current application schema. When an example fixture is used by integration or E2E tests, add a schema/fixture consistency test so it cannot silently become stale.
7. Preserve production behavior while improving tests. Do not weaken assertions, delete branches, add coverage ignores, or lower thresholds merely to make the pipeline green.
8. Run formatting, linting, type checks, the focused tests, and the full validation pipeline as appropriate. Report failures separately when a test exposes an unrelated existing defect.

## Coverage Rules

- Make coverage scope explicit in the test configuration, including generated/build-time code only when its execution model can be measured reliably.
- Enforce the metrics the project promises. If the project claims 100%, enforce lines, branches, statements, and functions where supported.
- Add a completeness check when the coverage tool can omit files or treat `0/0` files as invisible. Document structural files such as type-only modules and route re-exports instead of presenting them as runtime coverage.
- Keep unit coverage, integration coverage, E2E coverage, smoke checks, and static checks distinct. Passing one layer does not substitute for another.

## Test Design

- Test public behavior and stable contracts first; use exported pure helpers for deterministic edge-case coverage when appropriate.
- For each branch, cover the normal path, the fallback/error path, and the boundary where behavior changes.
- Assert both positive and negative outcomes: rendered content and omitted content, navigation target and non-navigation, created files and absent stale files, accepted input and rejected input.
- For filesystem and process code, use isolated temporary fixtures and clean them in `afterEach`/`finally` blocks.
- For browser tests, assert readiness, background/media loading, URL state, console/page errors, failed requests, and responsive behavior when those are part of the contract.
- Keep tests deterministic: control time, randomness, network boundaries, and external commands rather than relying on incidental machine state.

## Completion

Before finishing, verify that:

- the focused tests pass;
- the promised coverage command passes at the documented threshold;
- the full pipeline has been run when test infrastructure or shared behavior changed;
- no new warnings, skipped tests, broad mocks, or unexplained coverage exclusions were introduced;
- the final report distinguishes implemented fixes from remaining failures.
