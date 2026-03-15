import { getAbsoluteNavigationPath } from "@components/navigation/wnaNavigationRouteProvider";
import { getLangCode } from "@services/i18n/i18n";

type Lang = "de" | "en";

const imageDefault = "/logo_300_366.png";

const locale: Record<Lang, string> = {
  de: "de_DE",
  en: "en_US",
};

const inLanguage: Record<Lang, string> = {
  de: "de",
  en: "en",
};

export type Localized<T> = Record<Lang, T>;

export type SeoEntry = {
  headerTitle: Localized<string>;
  title: Localized<string>;
  description: Localized<string>;
  canonical: Localized<() => string>;
  locale: Localized<string>;
  inLanguage: Localized<string>;
  image: string;
};

export type SeoCatalog = {
  empty: SeoEntry;
  root: SeoEntry;
  menu: SeoEntry;
  disclaimer: SeoEntry;
  terms: SeoEntry;
  licenses: SeoEntry;
  privacy: SeoEntry;
  admin: SeoEntry;
  settings: SeoEntry;
  settingsAdvanced: SeoEntry;
  settingsDiary: SeoEntry;
  settingsMap: SeoEntry;
  profile: SeoEntry;
  profileLogin: SeoEntry;
  projects: SeoEntry;
  experience: SeoEntry;
  contact: SeoEntry;
  appointments: SeoEntry;
  appointmentsCreate: SeoEntry;
  appointmentsUpdate: SeoEntry;
  appointmentsAccommodation: SeoEntry;
  chapters: SeoEntry;
  notifications: SeoEntry;
  notificationsCreate: SeoEntry;
};

export const createSeoEntry = (
  title: string,
  canonical: Localized<() => string>,
): SeoEntry => ({
  headerTitle: { de: title, en: title },
  title: { de: title, en: title },
  description: { de: "", en: "" },
  canonical,
  locale,
  inLanguage,
  image: imageDefault,
});

export const seoCatalog = {
  empty: {
    headerTitle: {
      de: "Portfolio",
      en: "Portfolio",
    },
    title: {
      de: "Portfolio",
      en: "Portfolio",
    },
    description: {
      de: "",
      en: "",
    },
    canonical: {
      de: () => "",
      en: () => "",
    },
    locale,
    inLanguage,
    image: imageDefault,
  },
  root: {
    headerTitle: {
      de: "Portfolio",
      en: "Portfolio",
    },
    title: {
      de: "Portfolio",
      en: "Portfolio",
    },
    description: {
      de: "Portfolio",
      en: "Portfolio",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("root", "de"),
      en: () => getAbsoluteNavigationPath("root", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },

  menu: {
    headerTitle: {
      de: "Mehr",
      en: "More",
    },
    title: { de: "Menü", en: "Menu" },
    description: {
      de: "",
      en: "",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("menu", "de"),
      en: () => getAbsoluteNavigationPath("menu", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },

  disclaimer: {
    headerTitle: {
      de: "Impressum / Disclaimer",
      en: "Imprint / Disclaimer",
    },
    title: { de: "Impressum / Disclaimer", en: "Imprint / Disclaimer" },
    description: {
      de: "Impressum und rechtliche Angaben",
      en: "Legal information and disclaimer",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("disclaimer", "de"),
      en: () => getAbsoluteNavigationPath("disclaimer", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },

  terms: {
    headerTitle: { de: "Nutzungsbedingungen", en: "Terms of Use" },
    title: { de: "Nutzungsbedingungen", en: "Terms of Use" },
    description: {
      de: "Nutzungsbedingungen",
      en: "Terms of Use",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("terms", "de"),
      en: () => getAbsoluteNavigationPath("terms", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },

  licenses: {
    headerTitle: { de: "Lizenzen", en: "Third Party Licenses" },
    title: { de: "Lizenzen", en: "Third Party Licenses" },
    description: {
      de: "Lizenzen",
      en: "Third Party Licenses",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("licenses", "de"),
      en: () => getAbsoluteNavigationPath("licenses", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },

  privacy: {
    headerTitle: { de: "Datenschutz", en: "Privacy Policy" },
    title: { de: "Datenschutz", en: "Privacy Policy" },
    description: {
      de: "Informationen zum Datenschutz, Datenspeicherung und Cookies.",
      en: "Information about privacy, data usage and cookies.",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("privacy", "de"),
      en: () => getAbsoluteNavigationPath("privacy", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },

  projects: {
    headerTitle: {
      de: "Einige private Projekte",
      en: "Some private projects",
    },
    title: { de: "Einige private Projekte", en: "Some private projects" },
    description: {
      de: "Einige private Projekte",
      en: "Some private projects",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("projects", "de"),
      en: () => getAbsoluteNavigationPath("projects", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },

  experience: {
    headerTitle: { de: "Tätigkeiten", en: "Experience" },
    title: { de: "Tätigkeiten", en: "Experience" },
    description: {
      de: "Tätigkeiten",
      en: "Experience",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("experience", "de"),
      en: () => getAbsoluteNavigationPath("experience", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },

  contact: {
    headerTitle: { de: "Kontakt", en: "Contact" },
    title: { de: "Kontakt", en: "Contact" },
    description: {
      de: "Kontakt",
      en: "Contact",
    },
    canonical: {
      de: () => getAbsoluteNavigationPath("contact", "de"),
      en: () => getAbsoluteNavigationPath("contact", "en"),
    },
    locale,
    inLanguage,
    image: imageDefault,
  },
} as const as SeoCatalog;

export function buildSeoUrlMap(lang?: Lang) {
  const rawLang = lang ?? getLangCode();
  const effectiveLang = rawLang === "de" ? "de" : "en";

  const map = new Map<string, keyof typeof seoCatalog>();

  for (const key in seoCatalog) {
    const entry = seoCatalog[key as keyof typeof seoCatalog];
    const url = entry.canonical[effectiveLang]().toString();
    const pathname = new URL(url).pathname;
    map.set(pathname, key as keyof typeof seoCatalog);
  }

  return map;
}

export function resolveSeoType(pathname: string, lang?: Lang) {
  const map = buildSeoUrlMap(lang);
  pathname = pathname.replace(/^\(tabs-[a-z]{2}\)/, "");
  pathname = pathname.replace(/^\/(de|en)(\/|$)/, "/");
  if (map.has(pathname)) return map.get(pathname)!;

  for (const [basePath, type] of map.entries()) {
    if (pathname.startsWith(basePath)) return type;
  }

  return "root";
}
