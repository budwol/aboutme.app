import { getConfiguredSiteUrl, normalizeSiteUrl } from "@utils/appConfig";
import { getProjectPathSegment } from "@utils/projectRoutes";
import { Href, Router } from "expo-router";
import { getLangCode } from "@services/i18n/i18n";

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

let currentBaseUrl = getConfiguredSiteUrl();

export function getNavigationLang(lang = getLangCode()): WnaRouteLang {
  return lang === "de" ? "de" : "en";
}

export function getNavigationBaseUrl() {
  return currentBaseUrl;
}

export function setNavigationBaseUrl(value: string) {
  currentBaseUrl = normalizeSiteUrl(value);
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

export function getNavigationPageName(
  key: WnaRouteKey,
  lang = getNavigationLang(),
) {
  const path = routeDefinitions[key][lang];
  if (path === "/") {
    return "/";
  }

  const parts = path.split("/").filter(Boolean);
  return parts.at(-1) ?? "/";
}

export function getAbsoluteNavigationPath(
  key: WnaRouteKey,
  lang = getNavigationLang(),
): Href {
  return `${currentBaseUrl}${getNavigationPath(key, lang)}` as Href;
}

export function getProjectNavigationPath(
  slug: string,
  lang = getNavigationLang(),
): Href {
  return `/${getProjectPathSegment(lang)}/${slug}` as Href;
}

export function getDrawerProjectNavigationPath(
  slug: string,
  lang = getNavigationLang(),
): string {
  return `/(drawer)/(tabs-${lang})/${getProjectPathSegment(lang)}/${slug}`;
}

export function getAbsoluteProjectNavigationPath(
  slug: string,
  lang = getNavigationLang(),
): Href {
  return `${currentBaseUrl}${getProjectNavigationPath(slug, lang)}` as Href;
}

export function navigateToRoot(router: Router) {
  router.dismissAll();
  router.replace(getNavigationPath("root"));
}
