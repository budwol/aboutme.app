import { SupportedLang } from "@/app-data/types";

function parsePeriodStart(period: string): Date | null {
  const match = period.match(/(\d{2})\/(\d{4})/);
  if (!match) {
    return null;
  }

  const month = Number(match[1]) - 1;
  const year = Number(match[2]);

  return Number.isFinite(month) && Number.isFinite(year)
    ? new Date(year, month, 1)
    : // istanbul ignore next -- regex digit groups are always finite; defensive fallback only
      null;
}

function parsePeriodEnd(period: string): Date | null {
  const matches = [...period.matchAll(/(\d{2})\/(\d{4})/g)];
  const lastMatch = matches.at(-1);

  if (!lastMatch) {
    return null;
  }

  const month = Number(lastMatch[1]) - 1;
  const year = Number(lastMatch[2]);

  return Number.isFinite(month) && Number.isFinite(year)
    ? new Date(year, month, 1)
    : // istanbul ignore next -- regex digit groups are always finite; defensive fallback only
      null;
}

export function calculateExperienceDuration(
  period: string,
  lang: SupportedLang,
) {
  const start = parsePeriodStart(period);
  const end = /\b(today|heute|current|since|seit)\b/i.test(period)
    ? new Date()
    : parsePeriodEnd(period);

  if (!start || !end || end < start) {
    return null;
  }

  const totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;

  // istanbul ignore if -- given the end >= start guard above, totalMonths is
  // always a finite integer >= 1; kept as a defensive guard only
  if (!Number.isFinite(totalMonths) || totalMonths <= 0) {
    return null;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (lang === "de") {
    const parts = [];
    if (years > 0) {
      parts.push(`${years} J.`);
    }
    if (months > 0) {
      parts.push(`${months} Mon.`);
    }
    return (
      parts.join(" ") ||
      // istanbul ignore next -- totalMonths >= 1 always yields a non-empty years/months part
      "1 Mon."
    );
  }

  const parts = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "mo" : "mos"}`);
  }
  return (
    parts.join(" ") ||
    // istanbul ignore next -- totalMonths >= 1 always yields a non-empty years/months part
    "1 mo"
  );
}
