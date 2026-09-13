import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

type BrowserNavigator = { language?: string; languages?: string[] };

const setNavigator = (value: BrowserNavigator) => {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value,
  });
};

const loadI18n = () => {
  let i18nModule!: typeof import("@/i18n/i18n");
  jest.isolateModules(() => {
    i18nModule = jest.requireActual(
      "@/i18n/i18n",
    ) as typeof import("@/i18n/i18n");
  });
  return i18nModule;
};

describe("i18n getLangCode", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "navigator");
  });

  it("uses the browser language list and normalizes regional locales", () => {
    setNavigator({ languages: ["de-DE", "en-US"], language: "en-US" });
    expect(loadI18n().getLangCode()).toBe("de");
  });

  it("uses navigator.language when the language list is empty", () => {
    setNavigator({ languages: [], language: "en-US" });
    expect(loadI18n().getLangCode()).toBe("en");
  });

  it("stays on the default language without a browser locale", () => {
    setNavigator({ languages: [] });
    expect(loadI18n().getLangCode()).toBe("de");
  });

  it("falls back to english for unsupported locales", () => {
    setNavigator({ languages: ["fr-FR"], language: "fr-FR" });
    expect(loadI18n().getLangCode()).toBe("en");
  });

  it("falls back to english when a malformed locale has no language segment", () => {
    setNavigator({
      languages: [
        {
          split: () => [],
        } as unknown as string,
      ],
    });

    expect(loadI18n().getLangCode()).toBe("en");
  });

  it("uses the default language when the browser global is unavailable", () => {
    expect(loadI18n().getLangCode()).toBe("de");
  });

  it("falls back to the default language and logs detection errors", () => {
    const errorSpy = jest.fn();
    jest.doMock("@/utils/logger", () => ({
      __esModule: true,
      default: { error: errorSpy, info: jest.fn(), warn: jest.fn() },
    }));
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      get: () => {
        throw new Error("locale detection failed");
      },
    });

    expect(loadI18n().getLangCode()).toBe("de");
    expect(errorSpy).toHaveBeenCalledWith("getLangCode", expect.any(Error));
  });
});
