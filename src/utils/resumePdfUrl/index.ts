import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";

export type ResumePdfLang = "de" | "en";

const RESUME_PDF_FILENAMES: Record<ResumePdfLang, string> = {
  de: "Portfolio-DE.pdf",
  en: "Portfolio-EN.pdf",
};

export function getResumePdfUrl(lang: ResumePdfLang): string {
  return getVersionedLocalAssetUrl(`/${RESUME_PDF_FILENAMES[lang]}`);
}
