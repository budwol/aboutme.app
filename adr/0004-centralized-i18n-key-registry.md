# 4. Centralized i18n key registry backs all translation lookups

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation), one known deviation noted below

## Context

UI copy (button labels, screen titles, error messages) is translated via `i18next`/`react-i18next`. Free-form string keys scattered through components are easy to typo and hard to find usages of.

## Decision

Every translation key is declared once as a `key: "key"` entry in `src/i18n/i18nKeys.ts` (a flat object, alphabetically ordered by key name), then defined in both `src/i18n/de.json` and `src/i18n/en.json` under the `common` namespace with the exact same key. Components call `t(i18nKeys.someKey)` rather than `t("someKey")`, giving autocomplete and a single place to see every string the app can render, and `useTranslation(["common"])` is the standard hook usage.

## Consequences

- Adding UI copy means touching three files (`i18nKeys.ts`, `de.json`, `en.json`) in lockstep.
- Nothing currently enforces that `de.json` and `en.json` stay in sync — as of this writing `en.json` has five keys (`infoPleaseWait`, `infoWorkInProgress`, `screenErrorLog`, `settingsAdvancedLogging`, `settingsDiarySwitchToDefaultTab`) that `de.json` is missing, so German users hitting those code paths get i18next's fallback/missing-key behavior instead of German text. A lint rule or test asserting key-set parity between the two files would catch this class of drift going forward.
- Known deviation: `src/components/screens/WnaHeader/WnaHeader.tsx:214` passes a hardcoded `text="Back"` instead of `t(i18nKeys.actionGoBack)`, bypassing the registry for that one label.
