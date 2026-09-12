---
name: quality-review
description: Orchestrate a complete, consistent software review across data contracts, architecture, frontend quality, performance, tests, documentation, CI/CD, and release readiness.
---

# Quality Review

Use this skill when the repository needs a complete review focused on correctness, quality, consistency, and release confidence. Treat the review as one connected workflow and preserve findings between phases.

## Review Order

1. **Data contract**: identify sources of truth, generated copies, fixtures, schemas, localization, asset references, and drift.
2. **Architecture**: inspect boundaries, dependency direction, naming, duplication, coupling, data flow, and technical debt.
3. **Frontend implementation and quality**: verify user flows, responsive behavior, accessibility, loading/error states, navigation, media, and transitions. Use `frontend-engineer` for implementation only when a confirmed defect requires code changes; use `frontend-quality` for the assessment.
4. **Performance**: measure the current build and analyze Lighthouse, bundle, asset, caching, and runtime evidence without weakening intentional policies.
5. **Test engineering**: map findings to unit, integration, smoke, and E2E coverage; add regression and edge-case tests; verify the promised coverage scope and thresholds.
6. **Documentation**: reconcile README, ADRs, scripts, configuration, test commands, and quality claims with the resulting implementation.
7. **CI/CD**: verify stage ordering, deterministic installs, artifacts, environment handling, failure propagation, credentials, and dry-run behavior.
8. **Release readiness**: validate the final build, container metadata, runtime assets, deployment configuration, rollback information, and authorization boundary. Do not publish or deploy without explicit authorization.

## Consistency Rules

- Start with a baseline and keep one findings list with severity, evidence, owner skill, and verification command.
- Do not fix symptoms in a later phase while ignoring a source-of-truth or architectural cause identified earlier.
- Re-run affected earlier phases after a change invalidates their assumptions.
- Every implemented finding needs a focused regression test or an explicit reason why testing is not meaningful.
- Every documented guarantee must be enforced by configuration or tests, not merely described.
- Distinguish defects, risks, improvements, and intentional behavior. Do not turn preferences into mandatory findings.

## Completion

Finish with a concise report containing findings first, changes made second, validation results third, and remaining risks last. A review is complete only when the relevant tests, quality gates, build checks, and documentation are consistent with one another.
