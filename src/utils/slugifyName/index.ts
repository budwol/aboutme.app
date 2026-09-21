const GERMAN_DIACRITICS: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "Ae",
  Ö: "Oe",
  Ü: "Ue",
  ß: "ss",
};

// Mirrors slugifyName in scripts/generate-resume-pdf.cjs /
// generate-cv-pdf.cjs / generate-application-package.cjs, which is what
// actually names the files these slugs end up pointing at: German
// umlauts/ß are spelled out, anything else non-ASCII is dropped rather
// than guessed at.
export function slugifyName(name: string): string {
  return name
    .replace(/[äöüÄÖÜß]/g, (char) => GERMAN_DIACRITICS[char])
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "");
}
