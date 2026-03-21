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
