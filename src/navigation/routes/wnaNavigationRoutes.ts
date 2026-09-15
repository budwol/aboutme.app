import { getProjectPathSegment } from "@utils/projectRoutes";
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
  | "contact";

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

export function getProjectNavigationPath(
  slug: string,
  lang = getNavigationLang(),
): string {
  return `/${getProjectPathSegment(lang)}/${slug}`;
}
