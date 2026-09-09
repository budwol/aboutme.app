import { describe, expect, it } from "@jest/globals";
import { i18nKeys } from "@/i18n/i18nKeys";
import de from "@/i18n/de.json";
import en from "@/i18n/en.json";

describe("i18n key consistency", () => {
  it("defines the exact same keys in de.json and en.json", () => {
    const deKeys = Object.keys(de.common).sort();
    const enKeys = Object.keys(en.common).sort();

    expect(deKeys).toEqual(enKeys);
  });

  it("has a de.json and en.json entry for every key in the registry", () => {
    const registryKeys = Object.values(i18nKeys);

    for (const key of registryKeys) {
      expect(de.common).toHaveProperty(key);
      expect(en.common).toHaveProperty(key);
    }
  });

  it("has no translation entries that aren't registered in i18nKeys", () => {
    const registryKeys = new Set(Object.values(i18nKeys));

    for (const key of Object.keys(en.common)) {
      expect(registryKeys.has(key)).toBe(true);
    }
  });
});
