import { i18n } from "@/i18n/i18n";
import { SupportedLang } from "@/app-data/types";

export function getSupportedLang(
  lang = i18n.resolvedLanguage ?? i18n.language,
): SupportedLang {
  return lang === "de" ? "de" : "en";
}

export function firstNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return undefined;
}

function firstNonEmptyCollection(...values: unknown[]): unknown {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return undefined;
}

export function getLocalizedString(
  lang: SupportedLang,
  fallback: string,
  plainValue?: unknown,
  deValue?: unknown,
  enValue?: unknown,
) {
  const preferred = lang === "de" ? deValue : enValue;
  const alternate = lang === "de" ? enValue : deValue;

  return asString(
    firstNonEmptyString(preferred, plainValue, alternate),
    fallback,
  );
}

export function getLocalizedStringArray(
  lang: SupportedLang,
  fallback: string[],
  plainValue?: unknown,
  deValue?: unknown,
  enValue?: unknown,
) {
  const preferred = lang === "de" ? deValue : enValue;
  const alternate = lang === "de" ? enValue : deValue;
  const rawValue = firstNonEmptyCollection(preferred, plainValue, alternate);

  return typeof rawValue === "string"
    ? [rawValue.trim()]
    : asStringArray(rawValue, fallback);
}

export function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

export function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim() !== "",
  );

  return items.length > 0 ? items : fallback;
}
