# 3. Bilingual content is authored as suffixed fields and normalized at runtime

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

The app serves German and English content (`de`/`en` routes under `src/app/(drawer)/(tabs-de)` and `(tabs-en)`). Content like the profile description, project copy, and work experience needs a per-language value, authored by one non-technical person editing a single JSON file (`.aboutme/app-data.json`), not by translators editing separate locale files.

## Decision

Localizable fields in `app-data.json` are authored with `De`/`En` suffixes (`titleDe`/`titleEn`, `descriptionDe`/`descriptionEn`, `periodDe`/`periodEn`, etc.), with an optional unsuffixed plain field as a language-agnostic fallback. `src/app-data/shared.ts` (`normalizeAppData`, `getLocalizedString`, `getLocalizedStringArray`) resolves the active language from `i18n.resolvedLanguage`/`i18n.language` at load time and picks `preferred → plain → alternate`, always falling back to `defaultAppData`'s value so a partially-filled fork never renders empty text. Fields that aren't language-dependent (`techstack`, image paths, URLs) have no suffix variants.

## Consequences

- Any new bilingual field must follow the `<name>De` / `<name>En` (+ optional plain `<name>`) convention and get wired into `normalizeAppData` — there is no i18n-library-driven interpolation of content data.
- Build-time tooling that reads `.aboutme/app-data.json` directly (outside the React runtime) cannot reuse `normalizeAppData`, since it depends on `i18next`'s resolved language; such tooling re-implements the same `xxxDe ?? xxx` / `xxxEn ?? xxx` fallback logic locally instead (see `scripts/generate-resume-pdf.cjs`, ADR 0010).
- UI copy (button labels, section titles) is a separate mechanism entirely — see ADR 0004.
