---
name: release-engineer
description: Design and verify reproducible application releases including builds, containers, deployment configuration, versioning, rollback safety, and release checks.
---

# Release Engineer

Use this skill for build failures, container deployments, release preparation, CI/CD changes, or production-readiness checks.

## Workflow

1. Inspect package scripts, lockfiles, Dockerfiles, environment examples, CI workflows, registry configuration, and deployment documentation.
2. Reproduce failures with the smallest safe command and capture the first meaningful error.
3. Validate configuration and build artifacts before any external push or deployment.
4. Keep lockfiles deterministic and never delete or regenerate them as an incidental release step.
5. Read the existing Git tag convention before creating a release tag. This repository uses the exact SemVer form `MAJOR.MINOR.PATCH` without a `v` prefix, for example `1.3.0`; never invent a different tag shape.
6. Verify image names, tags, build context, runtime assets, health checks, environment variables, and cache behavior.
7. Run a final cleanup scan for unused build helpers, stale artifacts, temporary diagnostics, obsolete scripts, and configuration left behind by the release change.
8. Run the complete release pipeline after changing shared build or deployment logic.
9. Do not push images, deploy services, or mutate remote state without explicit authorization.

## Completion

Report the exact checks performed, artifact identifiers, remaining environment-dependent risks, and whether a remote mutation actually occurred.
