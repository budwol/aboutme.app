---
name: security-engineer
description: Review and harden this repository's web app, container, dependencies, and CI against concrete security risks. Use for requested security reviews, recurring checks, scanner findings, or OWASP assessments.
---

# Security Engineer

Use this skill to find and address security issues in the AboutMe static PWA. Work from observed behavior and current advisories; do not treat a checklist item as proof of a vulnerability.

## Review path

1. Read `SECURITY.md`, the current git diff, `Dockerfile`, `docker-compose.yml`, `scripts/init-process.cjs`, the service worker, dependency manifests, and security test configuration. Preserve unrelated in-progress edits.
2. Check the current OWASP Top 10 against the actual architecture. The app has public static assets and no login, server API, or database. Mark categories with no attack surface as such, and identify responsibilities of the reverse proxy and host separately.
3. Check dependencies with `npm run test:security:audit` when network access is available. Inspect advisories and runtime compatibility before upgrading. Verify the full dependency tree after changes; do not weaken or suppress the audit gate to make it pass.
4. Validate generated output and runtime behavior with focused unit tests, `npm run test:smoke`, and `npm run test:security:headers` against a locally built nginx container. The normal Playwright suite runs Vite and cannot verify nginx headers. Use `SECURITY_DEPLOYED_URL` only when a live endpoint check is requested or relevant; read-only checks do not authorize deployment.
5. Check that production HTML and scripts work under CSP, security headers survive cache and error locations, the service worker does not serve stale no-store data, public output contains no unintended secrets, and the container exposes only intended ports.
6. For changes affecting shared test or build infrastructure, run the relevant full gates under the Node version required by `package.json`. Record the date, commands, results, affected paths, and remaining host or proxy actions.

## Recurring checks

The `security-scheduled.yml` workflow runs the dependency audit, export smoke check, browser checks, and local container tests weekly. When asked for a regular review, inspect its latest results if available and repeat checks needed to resolve concrete failures. The skill itself does not run on a timer.

Do not publish, push, deploy, or alter the live host merely because a check found a problem. Prepare repo fixes and clearly state what still needs an operator action.
