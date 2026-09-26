import { getProjectPathSegment } from "@utils/projectRoutes";
import type { DocumentKind } from "@utils/documentsManifest";
import { getLangCode } from "@/i18n/i18n";

export type WnaRouteLang = "de" | "en";
export type WnaRouteKey =
  | "root"
  | "menu"
  | "disclaimer"
  | "privacy"
  | "terms"
  | "licenses"
  | "projects"
  | "experience"
  | "contact"
  | "downloads";

type RouteDefinition = Record<WnaRouteLang, string>;

export const routeDefinitions: Record<WnaRouteKey, RouteDefinition> = {
  root: { de: "/", en: "/" },
  menu: { de: "/menu", en: "/menu" },
  disclaimer: { de: "/menu/impressum", en: "/menu/disclaimer" },
  privacy: { de: "/menu/datenschutz", en: "/menu/privacy" },
  terms: { de: "/menu/nutzungsbedingungen", en: "/menu/terms-of-use" },
  licenses: { de: "/menu/lizenzen", en: "/menu/third-party-licenses" },
  projects: { de: "/projekte", en: "/projects" },
  experience: { de: "/taetigkeiten", en: "/experience" },
  contact: { de: "/kontakt", en: "/contact" },
  // Deliberately not referenced by WnaNavigationList/WnaMenuRoute or any
  // other in-app link -- reachable only by someone who already has this
  // URL (shared out of band, e.g. by email to a recruiter), matching the
  // "not reachable from the UI" requirement for the underlying file
  // download (see getApplicationPackageUrl / nginx/site.conf's /files/
  // location).
  downloads: { de: "/bewerbungsunterlagen", en: "/application-documents" },
};

// Every one of the four PDF documents' own stable, storage-agnostic detail
// page -- "/bewerbungsunterlagen/Lebenslauf" resolves to whichever file
// currently backs cvDe (see src/utils/documentsManifest), so the CV/
// Portfolio PDFs' own footer cross-links (scripts/generate-cv-pdf.cjs /
// generate-resume-pdf.cjs) can link here instead of a raw file path that
// would otherwise bake in the DE/EN subfolder + /files/-vs-public-root
// split directly into an already-generated PDF. Mirrored by hand (ADR 0002)
// as buildDownloadsDetailUrl in both of those independent build scripts --
// keep the words and the "downloads" path above in sync if either changes.
export const downloadsIntentWords: Record<
  WnaRouteLang,
  Record<string, DocumentKind>
> = {
  de: {
    Lebenslauf: "cvDe",
    Lebenslauf_ATS: "cvAtsDe",
    Portfolio: "portfolioDe",
    Portfolio_ATS: "portfolioAtsDe",
  },
  en: {
    CV: "cvEn",
    CV_ATS: "cvAtsEn",
    Portfolio: "portfolioEn",
    Portfolio_ATS: "portfolioAtsEn",
  },
};

export function getNavigationLang(lang = getLangCode()): WnaRouteLang {
  return lang === "de" ? "de" : "en";
}

export function getNavigationPath(
  key: WnaRouteKey,
  lang = getNavigationLang(),
): string {
  return routeDefinitions[key][lang];
}

// The inverse of downloadsIntentWords: a document's own detail page path,
// in that document's own language (a German CV always lives under
// /bewerbungsunterlagen, whatever language the UI is in). undefined for a
// kind with no detail page (the two ZIPs).
export function getDownloadDetailNavigationPath(
  kind: DocumentKind,
): string | undefined {
  for (const lang of ["de", "en"] as const) {
    const word = Object.keys(downloadsIntentWords[lang]).find(
      (candidate) => downloadsIntentWords[lang][candidate] === kind,
    );
    if (word) {
      return `${routeDefinitions.downloads[lang]}/${word}`;
    }
  }
  return undefined;
}

// The Portfolio's own detail page -- what the contact section's and drawer
// menu's "Download portfolio" buttons open, rather than the raw PDF file.
export function getPortfolioDetailNavigationPath(lang: WnaRouteLang): string {
  // Both portfolio kinds are always in downloadsIntentWords, so this is
  // never undefined.
  return getDownloadDetailNavigationPath(
    lang === "de" ? "portfolioDe" : "portfolioEn",
  ) as string;
}

export function getProjectNavigationPath(
  slug: string,
  lang = getNavigationLang(),
): string {
  return `/${getProjectPathSegment(lang)}/${slug}`;
}
