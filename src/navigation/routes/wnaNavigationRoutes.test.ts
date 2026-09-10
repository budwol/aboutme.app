import { beforeEach, describe, expect, it, jest } from "@jest/globals";

type RoutesModule = typeof import("@/navigation/routes/wnaNavigationRoutes");

function loadRoutesWithLang(langCode: string) {
  jest.doMock("@/i18n/i18n", () => ({ getLangCode: () => langCode }));

  let routesModule!: RoutesModule;
  jest.isolateModules(() => {
    routesModule = jest.requireActual(
      "@/navigation/routes/wnaNavigationRoutes",
    ) as RoutesModule;
  });

  return routesModule;
}

describe("wnaNavigationRoutes", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("resolves 'de' as the german route language and other codes as english", () => {
    const { getNavigationLang } = loadRoutesWithLang("de");

    expect(getNavigationLang("de")).toBe("de");
    expect(getNavigationLang("fr" as never)).toBe("en");
    expect(getNavigationLang("en")).toBe("en");
  });

  it("defaults the drawer path language from getLangCode when not passed", () => {
    const { getDrawerNavigationPath } = loadRoutesWithLang("de");

    expect(getDrawerNavigationPath("menu")).toBe("/(drawer)/(tabs-de)/menu");
  });

  it("returns the bare tab root for the drawer root route", () => {
    const { getDrawerNavigationPath } = loadRoutesWithLang("en");

    expect(getDrawerNavigationPath("root", "en")).toBe("/(drawer)/(tabs-en)");
  });

  it("defaults the drawer project path language from getLangCode when not passed", () => {
    const { getDrawerProjectNavigationPath } = loadRoutesWithLang("de");

    expect(getDrawerProjectNavigationPath("my-project")).toBe(
      "/(drawer)/(tabs-de)/projekte/my-project",
    );
  });

  it("builds absolute and project navigation paths", () => {
    const {
      setNavigationBaseUrl,
      getAbsoluteNavigationPath,
      getProjectNavigationPath,
    } = loadRoutesWithLang("en");

    setNavigationBaseUrl("https://portfolio.example.com");

    expect(getAbsoluteNavigationPath("menu", "en")).toBe(
      "https://portfolio.example.com/menu",
    );
    expect(getProjectNavigationPath("my-project", "en")).toBe(
      "/projects/my-project",
    );
  });
});
