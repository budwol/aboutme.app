import { DocumentKind } from "@utils/documentsManifest";
import Colors from "@constants/theme/colors";
import { i18nKeys } from "@/i18n/i18nKeys";

// Shared by WnaDownloadsRoute (the full list) and WnaDownloadDetailRoute
// (one document's own page) -- both need the same label/icon/color for a
// given DocumentKind, so this is the one place that mapping lives.
export const DOCUMENT_LABEL_KEYS: Record<DocumentKind, string> = {
  cvDe: i18nKeys.documentCvDe,
  cvEn: i18nKeys.documentCvEn,
  cvAtsDe: i18nKeys.documentCvAtsDe,
  cvAtsEn: i18nKeys.documentCvAtsEn,
  applicationPackageDe: i18nKeys.documentApplicationPackageDe,
  applicationPackageEn: i18nKeys.documentApplicationPackageEn,
  portfolioDe: i18nKeys.documentPortfolioDe,
  portfolioEn: i18nKeys.documentPortfolioEn,
  portfolioAtsDe: i18nKeys.documentPortfolioAtsDe,
  portfolioAtsEn: i18nKeys.documentPortfolioAtsEn,
};

// Every DocumentKind ends in De/En -- the language the document itself is
// written in. Its label is translated into that language rather than the
// site's current one, so the English card reads "CV" even on the German site.
export function getDocumentLang(kind: DocumentKind): "de" | "en" {
  return kind.endsWith("De") ? "de" : "en";
}

// The manifest only ever contains these two file types (PDF documents, one
// ZIP per language), so the icon is keyed off document kind rather than
// parsing the URL.
export const DOCUMENT_ICON_NAMES: Record<
  DocumentKind,
  "file-pdf-box" | "folder-zip"
> = {
  cvDe: "file-pdf-box",
  cvEn: "file-pdf-box",
  cvAtsDe: "file-pdf-box",
  cvAtsEn: "file-pdf-box",
  applicationPackageDe: "folder-zip",
  applicationPackageEn: "folder-zip",
  portfolioDe: "file-pdf-box",
  portfolioEn: "file-pdf-box",
  portfolioAtsDe: "file-pdf-box",
  portfolioAtsEn: "file-pdf-box",
};

// Conventional file-type colors (red PDF, yellow archive), pulled from the
// theme's own red/yellow scale (same static values in light and dark mode)
// rather than a hardcoded hex, so the two file types are distinguishable at
// a glance without introducing an off-palette color. The "4" step is the
// most saturated in each scale -- "2"/"3" are pastel enough to wash out as
// a small icon fill.
export function getDocumentIconColors(
  colors: Colors,
): Record<DocumentKind, string> {
  return {
    cvDe: colors.red4,
    cvEn: colors.red4,
    cvAtsDe: colors.red4,
    cvAtsEn: colors.red4,
    applicationPackageDe: colors.yellow4,
    applicationPackageEn: colors.yellow4,
    portfolioDe: colors.red4,
    portfolioEn: colors.red4,
    portfolioAtsDe: colors.red4,
    portfolioAtsEn: colors.red4,
  };
}
