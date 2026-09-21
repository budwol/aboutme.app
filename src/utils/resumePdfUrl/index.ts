import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";
import { slugifyName } from "@utils/slugifyName";

export type ResumePdfLang = "de" | "en";

// Matches the filename buildPortfolioFileName in
// scripts/generate-resume-pdf.cjs writes to public/<DE|EN>/ -- "Portfolio"
// is the same word in both languages, so the folder (not a _DE/_EN suffix)
// is what tells the two language variants apart.
export function getResumePdfUrl(lang: ResumePdfLang, name: string): string {
  return getVersionedLocalAssetUrl(
    `/${lang.toUpperCase()}/${slugifyName(name)}_-_Portfolio.pdf`,
  );
}
