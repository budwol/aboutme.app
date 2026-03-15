import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("wnaNavigationRouteProvider", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("builds absolute menu URLs from the current base URL", () => {
    jest.doMock("expo-localization", () => ({
      getLocales: () => [{ languageCode: "en" }],
    }));

    let routes!: typeof import("@components/navigation/wnaNavigationRouteProvider");

    jest.isolateModules(() => {
      routes = jest.requireActual(
        "@components/navigation/wnaNavigationRouteProvider",
      ) as typeof import("@components/navigation/wnaNavigationRouteProvider");
    });

    routes.setNavigationBaseUrl("https://portfolio.example.com/");

    expect(routes.getAbsoluteNavigationPath("menu")).toBe(
      "https://portfolio.example.com/menu",
    );
    expect(routes.getAbsoluteNavigationPath("contact")).toBe(
      "https://portfolio.example.com/contact",
    );
  });

  it("maps localized terms and license slugs correctly", () => {
    jest.doMock("expo-localization", () => ({
      getLocales: () => [{ languageCode: "en" }],
    }));

    let routes!: typeof import("@components/navigation/wnaNavigationRouteProvider");

    jest.isolateModules(() => {
      routes = jest.requireActual(
        "@components/navigation/wnaNavigationRouteProvider",
      ) as typeof import("@components/navigation/wnaNavigationRouteProvider");
    });

    routes.setNavigationBaseUrl("https://portfolio.example.com");

    expect(routes.getAbsoluteNavigationPath("terms", "de")).toBe(
      "https://portfolio.example.com/menu/nutzungsbedingungen",
    );
    expect(routes.getAbsoluteNavigationPath("terms", "en")).toBe(
      "https://portfolio.example.com/menu/terms-of-use",
    );
    expect(routes.getAbsoluteNavigationPath("licenses", "de")).toBe(
      "https://portfolio.example.com/menu/lizenzen",
    );
    expect(routes.getAbsoluteNavigationPath("licenses", "en")).toBe(
      "https://portfolio.example.com/menu/third-party-licenses",
    );
  });

  it("builds internal drawer routes for localized tabs without duplicate slashes", () => {
    jest.doMock("expo-localization", () => ({
      getLocales: () => [{ languageCode: "en" }],
    }));

    let routes!: typeof import("@components/navigation/wnaNavigationRouteProvider");

    jest.isolateModules(() => {
      routes = jest.requireActual(
        "@components/navigation/wnaNavigationRouteProvider",
      ) as typeof import("@components/navigation/wnaNavigationRouteProvider");
    });

    expect(routes.getDrawerNavigationPath("root", "en")).toBe(
      "/(drawer)/(tabs-en)",
    );
    expect(routes.getDrawerNavigationPath("projects", "en")).toBe(
      "/(drawer)/(tabs-en)/projects",
    );
    expect(
      routes.getDrawerProjectNavigationPath("custom-project-1", "de"),
    ).toBe("/(drawer)/(tabs-de)/projekte/custom-project-1");
    expect(routes.getDrawerNavigationPath("disclaimer", "de")).toBe(
      "/(drawer)/(tabs-de)/menu/impressum",
    );
  });
});
