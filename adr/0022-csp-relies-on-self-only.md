# 22. CSP relies on 'self' only, with no host or wildcard subdomain allowance

Date: 2026-09-20

## Context

An external security scan of `wb.wna24.de` flagged the CSP as too permissive. `scripts/init-process.cjs` (`buildGeneratedFiles`, which writes `nginx/site.conf`) derived an `allowDomain` string from `siteUrl` -- `https://<host> https://*.<baseDomain>` -- and added it to `connect-src`, `font-src`, `frame-src`, `img-src`, `script-src`, `script-src-elem`, and `style-src` on every generated deployment. Checking why: the only cross-host reference in `app-data.json` (a project's `webUrl`, e.g. `https://app.wna24.de/...`) is opened via `Linking.openURL` (`WnaProjectDetailsRoute.tsx`), a plain top-level navigation that CSP does not gate at all. Nothing in the app actually fetches, embeds, or loads a script/style/font/image from the site's own host or any subdomain -- `'self'` already covers same-origin requests, making the explicit host redundant, and the `*.baseDomain` wildcard trusted scripts/frames/connections from any subdomain, including ones this app doesn't control (a real attack surface if a subdomain is ever compromised or hosts user content).

## Decision

The generated CSP uses `'self'` alone with no site-specific or wildcard-subdomain host in any directive, and adds `upgrade-insecure-requests`. A deployment that genuinely needs to load a resource from another origin should add that exact origin explicitly and deliberately, not inherit a blanket subdomain allowance by default.

## Consequences

- `nginx/site.conf` is generated (gitignored) -- this decision lives in `scripts/init-process.cjs`; regenerate via `npm run init` after changing it, don't hand-edit the generated file.
- `style-src 'unsafe-inline'` remains: the app renders ~28 dynamic inline `style={{...}}` values in React, and CSP hashes/nonces only cover `<style>` elements and scripts, not per-element style attributes. Removing it would need moving those to CSS custom properties/classes, which is a larger refactor than this fix.
