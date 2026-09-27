# 26. Hidden features stay in the code behind a feature flag

Date: 2026-09-27

## Status

Accepted

## Context

The "Lizenzen" / "Third Party Licenses" page under the menu only ever listed MIT-style licenses. Those don't call for an in-app attribution page, so the page added nothing for visitors. It may be needed again once the app bundles a library whose license does require showing it, so deleting the page and its tests would only mean rebuilding them later.

## Decision

Features that are built but not currently wanted are switched off in `src/constants/featureFlags.ts`, not deleted. `thirdPartyLicenses: false` hides the licenses page completely:

- `WnaMenuRoute` doesn't render its menu entry (the Terms entry becomes the card's last row).
- `wnaRouteTable` doesn't register `/menu/lizenzen` / `/menu/third-party-licenses`, so an old link falls through to `WnaRoutes`' redirect to the home page instead of showing a page nobody can navigate to.
- The page itself (`WnaLicensesRoute`, `getLicensesHtmlContent`), its route definition, i18n keys and tests stay. Unit tests cover both flag states; the Playwright licenses specs `test.skip` themselves while the flag is off, and the menu page object asserts the entry's presence or absence from the same flag.

## Consequences

- Re-enabling is a one-line change plus updating `featureFlags.test.ts`, which pins the current value on purpose.
- A flag is a compile-time constant, not a runtime or per-deployment setting; the hidden code still ships in the bundle as a lazy chunk that is never loaded.
