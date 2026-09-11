import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";

export type ResumePdfLang = "de" | "en";

const GERMAN_DIACRITICS: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "Ae",
  Ö: "Oe",
  Ü: "Ue",
  ß: "ss",
};

// A profile name can contain characters that are neither filesystem- nor
// URL-safe (umlauts, accents, punctuation). Mirrors slugifyName in
// scripts/generate-resume-pdf.cjs, which is what actually names the file
// this URL points at — German umlauts/ß are spelled out since this is a
// German name; anything else non-ASCII is dropped rather than guessed at.
function slugifyName(name: string): string {
  return name
    .replace(/[äöüÄÖÜß]/g, (char) => GERMAN_DIACRITICS[char])
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "");
}

// Matches the filename scripts/generate-resume-pdf.cjs actually writes to
// public/ (buildPortfolioFileName there) — a name-based file a recipient
// can save without renaming, rather than a generic "Portfolio-DE.pdf".
export function getResumePdfUrl(lang: ResumePdfLang, name: string): string {
  return getVersionedLocalAssetUrl(
    `/${slugifyName(name)}_-_Portfolio_${lang.toUpperCase()}.pdf`,
  );
}
