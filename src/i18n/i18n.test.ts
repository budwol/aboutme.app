import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("i18n getLangCode", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("falls back to the default language and logs when locale detection throws", () => {
    const errorSpy = jest.fn();

    jest.doMock("expo-localization", () => ({
      getLocales: () => {
        throw new Error("locale detection failed");
      },
    }));
    jest.doMock("@/utils/logger", () => ({
      __esModule: true,
      default: { error: errorSpy, info: jest.fn(), warn: jest.fn() },
    }));

    jest.isolateModules(() => {
      jest.requireActual("@/i18n/i18n");
    });

    expect(errorSpy).toHaveBeenCalledWith("getLangCode", expect.any(Error));
  });

  it("stays on the default language when no locales are reported", () => {
    jest.doMock("expo-localization", () => ({
      getLocales: () => [],
    }));

    let i18nModule!: typeof import("@/i18n/i18n");
    jest.isolateModules(() => {
      i18nModule = jest.requireActual(
        "@/i18n/i18n",
      ) as typeof import("@/i18n/i18n");
    });

    expect(i18nModule.getLangCode()).toBe("de");
  });

  it("falls back to english when the reported locale has no language code", () => {
    jest.doMock("expo-localization", () => ({
      getLocales: () => [{ languageCode: undefined }],
    }));

    let i18nModule!: typeof import("@/i18n/i18n");
    jest.isolateModules(() => {
      i18nModule = jest.requireActual(
        "@/i18n/i18n",
      ) as typeof import("@/i18n/i18n");
    });

    expect(i18nModule.getLangCode()).toBe("en");
  });

  it("falls back to english for unsupported locales", () => {
    jest.doMock("expo-localization", () => ({
      getLocales: () => [{ languageCode: "fr" }],
    }));

    let i18nModule!: typeof import("@/i18n/i18n");
    jest.isolateModules(() => {
      i18nModule = jest.requireActual(
        "@/i18n/i18n",
      ) as typeof import("@/i18n/i18n");
    });

    expect(i18nModule.getLangCode()).toBe("en");
  });

  it("keeps a supported german locale", () => {
    jest.doMock("expo-localization", () => ({
      getLocales: () => [{ languageCode: "de" }],
    }));

    let i18nModule!: typeof import("@/i18n/i18n");
    jest.isolateModules(() => {
      i18nModule = jest.requireActual(
        "@/i18n/i18n",
      ) as typeof import("@/i18n/i18n");
    });

    expect(i18nModule.getLangCode()).toBe("de");
  });

  it("keeps a supported english locale", () => {
    jest.doMock("expo-localization", () => ({
      getLocales: () => [{ languageCode: "en" }],
    }));

    let i18nModule!: typeof import("@/i18n/i18n");
    jest.isolateModules(() => {
      i18nModule = jest.requireActual(
        "@/i18n/i18n",
      ) as typeof import("@/i18n/i18n");
    });

    expect(i18nModule.getLangCode()).toBe("en");
  });
});
