# 32. Private contact fields stay out of the public data

Date: 2026-10-02

## Status

Accepted

## Context

`.aboutme/app-data.json` holds the full contact block, including phone number, street and ZIP code. It used to be copied unchanged to `public/app-data.json`, which every visitor can fetch and which `inject-web-shell.cjs` also inlines into every HTML page. Hiding a field in the UI therefore did not keep it private. The same data went into the public Portfolio PDFs.

The imprint (§ 5 DDG) and the privacy policy still need a postal address. A phone number is not required there.

## Decision

- `scripts/public-app-data.cjs` builds the public files from the source data. `public/app-data.json` gets everything except `contact.phone`, `contact.addressStreet` and `contact.addressZipCode`. `public/legal.json` gets only name, postal address and e-mail. `init-process.cjs`, `sync-web-app-data.cjs` and `start-e2e-web.sh` all go through it.
- Only the imprint and privacy routes fetch `legal.json` (`src/utils/legalData`), with `cache: "no-store"` like `app-data.json`. nginx serves it with `Cache-Control: no-store`.
- The phone number no longer appears anywhere public: not in the contact actions, the imprint or the privacy policy.
- The contact page shows only city and country.
- The public Portfolio PDFs (`generate-resume-pdf.cjs`) use the same filtered data. The password-protected CV under `/files/` keeps the full contact block, so recruiters with access still get phone and address.
- `smoke-export.sh` fails if `public/app-data.json` contains any of the private fields.

## Consequences

- Scrapers and search engines no longer get the phone number or street address from the data file or the HTML. The street address is only reachable through `legal.json`, and the whole site already sends `X-Robots-Tag: noindex`.
- The imprint shows a loading note until `legal.json` arrives, and asks visitors to request the address by e-mail if it cannot be loaded.
- New private fields must be added to `PRIVATE_CONTACT_FIELDS` and, if the legal pages need them, to `legal.json`. Adding a field to `app-data.json` publishes it unless it is listed there.
