---
name: architecture-review
description: Review application architecture for coupling, unclear boundaries, inconsistent naming, duplication, data-flow risks, and maintainability problems.
---

# Architecture Review

Use this skill for an architecture review or when a change may affect module boundaries, shared behavior, or long-term maintainability.

## Workflow

1. Inspect repository structure, dependency direction, entry points, configuration, and existing architectural documentation.
2. Trace the relevant data and control flow before judging abstractions.
3. Check ownership boundaries, coupling, circular dependencies, duplicated logic, leaky abstractions, inconsistent naming, and unused compatibility code.
4. Separate correctness defects from design risks, cleanup opportunities, and subjective preferences.
5. Report findings first, ordered by impact, with file references and concrete consequences.
6. Implement only confirmed improvements within the requested scope and add focused regression tests.
7. Update ADRs only when a durable architectural decision changed; keep them concise and implementation-independent.

## Rules

- Prefer existing local patterns over new abstractions.
- Do not recommend a refactor solely because another style is fashionable.
- Preserve public behavior, platform-specific requirements, and intentional compatibility boundaries.
- Verify architecture claims with dependency tools, tests, and build checks where available.
