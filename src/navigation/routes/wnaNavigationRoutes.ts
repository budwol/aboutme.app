import { getProjectPathSegment } from "@utils/projectRoutes";
import { Href } from "expo-router";
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

const routeDefinitions: Record<WnaRouteKey, RouteDefinition> = {
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
): Href {
  return routeDefinitions[key][lang] as Href;
}

export function getDrawerNavigationPath(
  key: WnaRouteKey,
  lang = getNavigationLang(),
): string {
  const path = getNavigationPath(key, lang);

  if (path === "/") {
    return `/(drawer)/(tabs-${lang})`;
  }

  return `/(drawer)/(tabs-${lang})${path}`;
}

export function getDrawerProjectNavigationPath(
  slug: string,
  lang = getNavigationLang(),
): string {
  return `/(drawer)/(tabs-${lang})/${getProjectPathSegment(lang)}/${slug}`;
}
