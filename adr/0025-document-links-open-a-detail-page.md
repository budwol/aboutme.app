# 25. Document links open a per-document detail page instead of the raw file

Date: 2026-09-26

## Context

ADR 0024's four PDFs (CV, CV-ATS, Portfolio, Portfolio-ATS, per language) cross-linked each other through their footers with raw file URLs such as `/files/DE/Name_-_Lebenslauf.pdf`. That baked the storage layout (the `DE/`/`EN/` subfolder, and `/files/` vs. `public/` root) into every already-generated and already-sent PDF, and a click on a protected link just ran into nginx's native Basic Auth dialog instead of the site's own password overlay. The contact section and drawer menu also linked straight to the Portfolio PDF.

## Decision

Every one of the eight PDFs has its own stable detail page, `/bewerbungsunterlagen/<Wort>` / `/application-documents/<Word>` (`Lebenslauf`, `Lebenslauf_ATS`, `Portfolio`, `Portfolio_ATS` / `CV`, `CV_ATS`, `Portfolio`, `Portfolio_ATS`), mapped to a `DocumentKind` by `downloadsIntentWords` in `wnaNavigationRoutes.ts` and resolved by `matchRoute` to `WnaDownloadDetailRoute`. The language comes from the path prefix, not the word, since `Portfolio` is identical in both. An unknown word falls back to the full downloads list rather than a dead route.

- The PDF footers (`buildDownloadsDetailUrl` in both generator scripts, mirrored by hand per ADR 0002), the downloads list's PDF rows, and the contact section/drawer "Portfolio" buttons all link to these pages. Only the two ZIPs and the reference scans still download in place from the list, since they have no detail page.
- The detail page reuses the list's password flow: `useDocumentsAuth` (session storage key, 15-minute inactivity lock, 401 relock) and `WnaDocumentsUnlockGate` were extracted from `WnaDownloadsRoute` and are shared by both screens, so unlocking on one carries over to the other within the tab. A protected document is probed with its own URL on unlock, fetched once with the `Authorization` header, previewed from a `blob:` URL in an `<iframe>`, and downloaded from that same blob. The public Portfolio pair skips the gate and previews/downloads straight from its URL.
- The CSP's `frame-src` gains `blob:` (`frame-src 'self' blob:`) so that preview can render. A `blob:` URL can only be minted by a script already running on this origin, so it doesn't widen what can be framed beyond `'self'` in practice.

## Consequences

- The route words are duplicated in `wnaNavigationRoutes.ts` and both `scripts/generate-*-pdf.cjs`; renaming one without the others breaks links inside PDFs that are already out in the world. Treat the words as a public URL contract.
- The unmatched-word fallback means a typo in a forwarded link lands on the list page, not a 404.
- Mobile browsers (notably iOS Safari and Android Chrome) render PDFs in an `<iframe>` poorly or not at all; the download button is the reliable path there, the preview is a desktop convenience.
