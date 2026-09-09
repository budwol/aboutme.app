# 4. Centralized i18n key registry backs all translation lookups

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

UI copy (button labels, screen titles, error messages) is translated via `i18next`/`react-i18next`. Free-form string keys scattered through components are easy to typo and hard to find usages of.

## Decision

Every translation key is declared once as a `key: "key"` entry in `src/i18n/i18nKeys.ts` (a flat object, alphabetically ordered by key name), then defined in both `src/i18n/de.json` and `src/i18n/en.json` under the `common` namespace with the exact same key. Components call `t(i18nKeys.someKey)` rather than `t("someKey")`, giving autocomplete and a single place to see every string the app can render, and `useTranslation(["common"])` is the standard hook usage. No component passes a literal string as a label — even single-use, seemingly-static labels go through the registry, since that's what makes it trustworthy as "every string the app can render."

## Consequences

- Adding UI copy means touching three files (`i18nKeys.ts`, `de.json`, `en.json`) in lockstep.
- `src/i18n/i18nKeys.test.ts` enforces key-set parity across `i18nKeys.ts`, `de.json`, and `en.json` — a missing or orphaned key in any one of the three now fails the test suite instead of silently falling back to i18next's missing-key behavior at runtime.
