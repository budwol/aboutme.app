import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { DocumentKind } from "@utils/documentsManifest";

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

  it("defaults the navigation path language from getLangCode when not passed", () => {
    const { getNavigationPath } = loadRoutesWithLang("de");

    expect(getNavigationPath("menu")).toBe("/menu");
  });

  it("resolves the root route to a plain slash", () => {
    const { getNavigationPath } = loadRoutesWithLang("en");

    expect(getNavigationPath("root", "en")).toBe("/");
  });

  it("defaults the project path language from getLangCode when not passed", () => {
    const { getProjectNavigationPath } = loadRoutesWithLang("de");

    expect(getProjectNavigationPath("my-project")).toBe("/projekte/my-project");
  });

  it("builds the english project path with the english segment", () => {
    const { getProjectNavigationPath } = loadRoutesWithLang("en");

    expect(getProjectNavigationPath("my-project", "en")).toBe(
      "/projects/my-project",
    );
  });

  it.each([
    ["cvDe", "/bewerbungsunterlagen/Lebenslauf"],
    ["cvAtsDe", "/bewerbungsunterlagen/Lebenslauf_ATS"],
    ["portfolioDe", "/bewerbungsunterlagen/Portfolio"],
    ["portfolioAtsDe", "/bewerbungsunterlagen/Portfolio_ATS"],
    ["cvEn", "/application-documents/CV"],
    ["cvAtsEn", "/application-documents/CV_ATS"],
    ["portfolioEn", "/application-documents/Portfolio"],
    ["portfolioAtsEn", "/application-documents/Portfolio_ATS"],
  ] satisfies [DocumentKind, string][])(
    "builds the detail page path for %s in the document's own language",
    (kind, expected) => {
      // UI language deliberately differs from the German documents.
      const { getDownloadDetailNavigationPath } = loadRoutesWithLang("en");

      expect(getDownloadDetailNavigationPath(kind)).toBe(expected);
    },
  );

  it("has no detail page path for the ZIP packages", () => {
    const { getDownloadDetailNavigationPath } = loadRoutesWithLang("de");

    expect(
      getDownloadDetailNavigationPath("applicationPackageDe"),
    ).toBeUndefined();
    expect(
      getDownloadDetailNavigationPath("applicationPackageEn"),
    ).toBeUndefined();
  });

  it("builds the portfolio detail page path per language", () => {
    const { getPortfolioDetailNavigationPath } = loadRoutesWithLang("de");

    expect(getPortfolioDetailNavigationPath("de")).toBe(
      "/bewerbungsunterlagen/Portfolio",
    );
    expect(getPortfolioDetailNavigationPath("en")).toBe(
      "/application-documents/Portfolio",
    );
  });
});
