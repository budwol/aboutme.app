# 31. AI-assisted development under the same guardrails

Date: 2026-10-02

## Status

Accepted

## Context

This repository, like the private Wandertagebuch projects it shows, is built with AI coding agents, mainly Claude Code. That raises a fair question for anyone reading the code: which parts did a person decide, and how do you know the result holds up? Writing `Co-Authored-By` trailers on individual commits does not answer that. The trailers would end up on some commits and not others, and they say nothing about who is responsible for the result.

## Decision

- I own the architecture, the decisions and the review. Decisions are written down as ADRs in this directory before or together with the code that follows them.
- Agents implement, write tests, refactor and run reviews. The review roles they use live in `skills/` and are versioned with the code.
- Every change has to pass the same automated gates, whether I wrote it or an agent did:
  - 100% line and branch coverage, enforced by `coverageThreshold` ([0013](0013-100-percent-line-and-branch-coverage-target.md))
  - layer boundaries enforced by ESLint and a circular-dependency gate ([0016](0016-layer-boundaries-enforced-by-lint-and-ci.md))
  - zero ESLint warnings (`--max-warnings=0`), Prettier and type checks
  - the chained CI workflows, including integration, smoke, E2E and security tests ([0009](0009-ci-as-chained-reusable-workflows.md))
- AI involvement is stated once, here and in the README, instead of per commit. Commits follow [0020](0020-commit-message-convention.md) and carry no AI attribution; whoever commits is responsible for the change.

## Consequences

- Readers get a clear statement of how the code came about, with the gates that back it up, instead of having to infer it from commit trailers.
- The gates keep their value only if they are not loosened to make generated code pass. Lowering a threshold or silencing a rule needs its own ADR.
- Generated code that the gates cannot judge, such as wording, UX and architecture fit, still depends on my review.
