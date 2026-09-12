---
name: ci-cd-engineer
description: Design, maintain, troubleshoot, and verify reliable CI/CD pipelines for builds, tests, artifacts, containers, deployments, and release gates.
---

# CI/CD Engineer

Use this skill when changing or debugging continuous integration, continuous delivery, build automation, deployment workflows, release gates, or pipeline reliability.

## Workflow

1. Read the pipeline definitions, reusable workflows, package scripts, lockfile policy, environment examples, artifact configuration, and deployment documentation.
2. Map the pipeline stages and their dependencies: install, static checks, unit tests, coverage, integration tests, smoke tests, E2E tests, build, artifact publication, and deployment.
3. Reproduce the failing stage locally with the smallest equivalent command and preserve the first meaningful error.
4. Keep CI deterministic: use the tracked lockfile, pinned or explicitly controlled tool versions, isolated fixtures, stable ports, and explicit environment setup.
5. Make failures actionable with clear stage boundaries, meaningful logs, strict exit codes, and assertions that detect browser, network, asset, and artifact errors.
6. Include repository hygiene in quality gates: lint `src`, `tests`, and `scripts`, enforce strict TypeScript unused-symbol checks, and reject new warnings, stale generated artifacts, debug code, or obsolete test helpers.
7. Cache only safe immutable inputs and verify that cache hits cannot hide stale dependencies, generated files, or missing assets.
8. Treat credentials, registry access, deployment targets, and remote mutations as explicit authorization boundaries.
9. Add regression tests for pipeline scripts and configuration where practical, then run the full pipeline after shared workflow changes.

## Release Safety

- Never delete or silently rewrite a tracked lockfile during CI.
- Validate build outputs, image names/tags, runtime assets, manifests, health checks, and required environment variables before publishing.
- Keep test, build, publish, and deploy stages distinct so a passing test cannot be mistaken for a successful release.
- Use dry runs for configuration and deployment commands before remote mutation.
- Preserve intentional policies such as `noindex` and document them instead of weakening checks to improve a metric.
- Define rollback or recovery information for every deployment path.

## Completion

Report the exact stages executed, their results, artifact identifiers, environment-dependent limitations, and whether anything was published or deployed remotely. Do not claim a release succeeded when only local validation completed.
