# Security Policy

If you found a security issue in this repo, please do not open a public issue first.

Send a short report to:

- `info@nosys-productions.com`

If it helps, include:

- what you found
- how to reproduce it
- what kind of impact you expect
- whether it affects the template, the generated app, the deploy scripts, or the container/runtime path

## What counts as security-relevant here

For this project, useful reports usually fall into one of these buckets:

- unsafe handling of `.env` values or generated config
- broken validation around URLs, HTML, or generated runtime files
- deployment paths that can overwrite or expose more than they should
- container or nginx misconfiguration that weakens the intended runtime protections
- generated output that breaks expected headers, cache behavior, or healthcheck assumptions

## OWASP Top 10:2025 scope

This is a public static PWA served by nginx. It has no login, server API, or database. The [OWASP Top 10:2025](https://top10.owasp.org/2025/) categories apply as follows:

CI runs `npm run test:security:audit` against the live npm advisory database.
The `security-scheduled.yml` workflow repeats the audit, export, browser, and container checks every Monday. Use `$security-engineer` for a focused review of a finding or the latest scheduled results.

| Category                                   | Project check                                                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 Broken Access Control                  | No private route or server-side authorization exists. Treat every file in `dist` as public, including embedded app data and PDFs.                                         |
| A02 Security Misconfiguration              | Container tests check CSP, clickjacking, MIME and HSTS headers. Compose binds its port to localhost by default; check reverse-proxy and host ports separately.            |
| A03 Software Supply Chain Failures         | CI runs `npm audit` for all dependencies and builds from a supported Alpine branch. Rebuild and redeploy images to receive base-image updates.                            |
| A04 Cryptographic Failures                 | TLS terminates outside this container. Check HTTPS redirect, certificate renewal and HSTS on the public endpoint after deployment.                                        |
| A05 Injection                              | Rich HTML is sanitized with an allowlist; unit tests cover scripts, unsafe links and attributes. Recheck the allowlist when content capabilities change.                  |
| A06 Insecure Design                        | Generated public content is deliberately public. Review private source data before export; `.aboutme` and `.env` are excluded from the image context.                     |
| A07 Authentication Failures                | No authentication or sessions exist in this app. If they are added, this category needs a new design review.                                                              |
| A08 Software or Data Integrity Failures    | The service worker bypasses `no-store` requests and `/app-data.json`; production navigation is network first. Deployment must use the generated config and current build. |
| A09 Security Logging and Alerting Failures | App nginx access logging is off. The operator must provide suitable logging and alerting at the reverse proxy or host.                                                    |
| A10 Mishandling of Exceptional Conditions  | Generated config uses `server_tokens off`, and app-data failures use defaults. Test error responses for security headers and avoid publishing secrets in built assets.    |

## What is probably out of scope

These are usually not security bugs by themselves:

- missing enterprise process around the repo
- style, wording, or template customization complaints
- general dependency hygiene comments without a concrete affected package and impact
- local development warnings that do not affect the generated app or deploy/runtime path

## Response expectations

This is a small project, not a staffed security desk, so response times may vary a bit.

Still, the goal is simple:

- confirm the report
- reproduce it if possible
- fix it or document the tradeoff clearly

If a report turns out to be valid, I would rather patch the rough edge than pretend it is a happy little accident.
