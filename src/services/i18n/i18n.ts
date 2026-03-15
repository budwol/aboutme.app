import Logger from "@/utils/logger";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationDe from "./de.json";
import translationEn from "./en.json";

const getLangCode = () => {
  let langCode = "de";
  try {
    const code = Localization.getLocales().shift();
    if (code) langCode = code.languageCode ?? "";

    if (langCode !== "de" && langCode !== "en") langCode = "en";
  } catch (error) {
    Logger.error(getLangCode.name, error);
  }

  return langCode;
};
const isLangGerman = () => getLangCode() === "de";
const isLangEnglish = () => getLangCode() !== "de";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: getLangCode(),
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    de: translationDe,
    en: translationEn,
  },
});

export { getLangCode, i18n, isLangEnglish, isLangGerman };
