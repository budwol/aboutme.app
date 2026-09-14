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
5. Run static cleanup checks as part of test review: strict TypeScript unused-symbol checks, repository-wide lint, unused test helpers/mocks/fixtures, stale selectors, skipped or focused tests, and obsolete coverage suppressions. Remove confirmed leftovers and fail CI on newly introduced warnings.
6. Add behavioral assertions that would fail for a real regression, asserting the full value wherever it is knowable rather than a partial match (see "Assert everything that can be asserted" below). Avoid tests that only assert implementation wording, snapshots without meaningful invariants, or coverage-only execution.
7. Keep test data representative of the current application schema. When an example fixture is used by integration or E2E tests, add a schema/fixture consistency test so it cannot silently become stale.
8. Preserve production behavior while improving tests. Do not weaken assertions, delete branches, add coverage ignores, or lower thresholds merely to make the pipeline green.
9. Run formatting, linting, type checks, the focused tests, and the full validation pipeline as appropriate. Report failures separately when a test exposes an unrelated existing defect.
10. Audit every test bootstrap and web-server command for external runtime tools it invokes. Add a deterministic preflight check or CI installation step for each required binary, and keep the local and CI prerequisites aligned.

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
- Treat missing OS tools, generated assets, fonts, browsers, and other runner prerequisites as test failures. Verify them explicitly before the suite starts and make the first error name the missing dependency and remediation.

### Assert everything that can be asserted

A partial matcher (`objectContaining`, `toMatchObject`, `arrayContaining`, a bare property read) silently stops watching every field it doesn't name. That includes fields a future change adds, drops, or corrupts — a missing `boxSizing`, a `fontFamily` that quietly disappears, an RN-only style prop that a DOM renderer silently ignores. None of that is caught by a matcher that only checks the fields it already expected. This is not a hypothetical: it is exactly how a real content-box overflow and a silently-dropped `paddingHorizontal` both shipped past a green test suite in this repository.

- Default to exact equality (`toEqual` against a full, literal object; exact array contents in a known order) whenever the complete expected value is knowable and stable at the call site. This is the normal case for style objects, config objects, computed props, and any other value the code under test fully determines.
- Reach for a partial matcher only when part of the value is genuinely non-deterministic or out of scope for the test (a generated id, a timestamp, a color computed by an unrelated helper already covered elsewhere). When you do, narrow the loose part to only those fields — e.g. destructure the specific keys you can't pin down into their own check — rather than wrapping the entire assertion in `objectContaining` and losing coverage on everything else in the object.
- Before writing `objectContaining`/`toMatchObject` on a style or config object literal, pause and check whether the full object is actually static and knowable. If it is, write out the exact object instead. Treat reaching for a partial matcher as a decision that needs a reason, not a default habit.
- When a bug is a specific instance of a general pattern (a property that silently no-ops on a given renderer, a unit mismatch, a sizing footgun), don't stop at patching the one call site. Grep or statically scan the codebase for every other instance of the same pattern, fix them together, and add one exhaustive, codebase-wide test (e.g. an AST scan over the relevant source tree) that fails if the pattern reappears anywhere — not just a test scoped to the file that happened to be reported. Verify that guard actually has teeth by temporarily reintroducing the original bug and confirming the test fails, then restore the fix.
- Prefer asserting the exact, complete rendered output (full text content, full class/style object, full list) over asserting a substring, a count, or a single field, whenever the complete output is something the test can pin down without becoming brittle to unrelated implementation detail.

## Completion

Before finishing, verify that:

- the focused tests pass;
- the promised coverage command passes at the documented threshold;
- the full pipeline has been run when test infrastructure or shared behavior changed;
- no new warnings, skipped tests, broad mocks, or unexplained coverage exclusions were introduced;
- every new or touched assertion asserts the full value it can know, not just the fields convenient to name — grep the diff for `objectContaining`/`toMatchObject`/`arrayContaining` and justify each one that survives;
- for a bug that is an instance of a general pattern, every other instance in the codebase was found and fixed, and a codebase-wide guard exists and was proven to fail against the original bug;
- the final report distinguishes implemented fixes from remaining failures.
