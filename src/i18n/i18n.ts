import Logger from "@/utils/logger";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationDe from "./de.json";
import translationEn from "./en.json";

const getLangCode = () => {
  let langCode = "de";
  try {
    const locale =
      typeof navigator !== "undefined"
        ? (navigator.languages?.[0] ?? navigator.language)
        : undefined;
    if (locale) langCode = locale.split("-")[0]?.toLowerCase() ?? "";

    if (langCode !== "de" && langCode !== "en") langCode = "en";
  } catch (error) {
    Logger.error(getLangCode.name, error);
  }

  return langCode;
};
i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: getLangCode(),
  defaultNS: "translation",
  showSupportNotice: false,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    de: translationDe,
    en: translationEn,
  },
});

export { getLangCode, i18n };
