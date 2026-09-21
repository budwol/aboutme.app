import { afterEach, describe, expect, it } from "@jest/globals";
import { getDocumentsManifest } from "@utils/documentsManifest";

describe("getDocumentsManifest", () => {
  const originalDeployVersion = process.env.EXPO_PUBLIC_DEPLOY_VERSION;

  afterEach(() => {
    if (originalDeployVersion === undefined) {
      delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;
      return;
    }
    process.env.EXPO_PUBLIC_DEPLOY_VERSION = originalDeployVersion;
  });

  it("builds every document URL, grouped by language, German first", () => {
    delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;

    expect(getDocumentsManifest("Jane Example")).toEqual([
      {
        kind: "applicationPackageDe",
        url: "/files/DE/Jane_Example_-_Bewerbungsunterlagen.zip",
      },
      { kind: "cvDe", url: "/files/DE/Jane_Example_-_Lebenslauf.pdf" },
      {
        kind: "cvAtsDe",
        url: "/files/DE/Jane_Example_-_Lebenslauf_ATS.pdf",
      },
      {
        kind: "portfolioDe",
        url: "/DE/Jane_Example_-_Portfolio.pdf",
      },
      {
        kind: "portfolioAtsDe",
        url: "/DE/Jane_Example_-_Portfolio_ATS.pdf",
      },
      {
        kind: "applicationPackageEn",
        url: "/files/EN/Jane_Example_-_ApplicationDocuments.zip",
      },
      { kind: "cvEn", url: "/files/EN/Jane_Example_-_CV.pdf" },
      { kind: "cvAtsEn", url: "/files/EN/Jane_Example_-_CV_ATS.pdf" },
      {
        kind: "portfolioEn",
        url: "/EN/Jane_Example_-_Portfolio.pdf",
      },
      {
        kind: "portfolioAtsEn",
        url: "/EN/Jane_Example_-_Portfolio_ATS.pdf",
      },
    ]);
  });

  it("spells out German umlauts and ß instead of dropping them", () => {
    const manifest = getDocumentsManifest("Björn Müller-Straße");
    expect(manifest[1].url).toBe(
      "/files/DE/Bjoern_Mueller-Strasse_-_Lebenslauf.pdf",
    );
  });

  it("keeps a German ZIP first so the unlock check always targets an auth_basic-protected URL", () => {
    const manifest = getDocumentsManifest("Jane Example");
    expect(manifest[0].kind).toBe("applicationPackageDe");
    expect(manifest[0].url.startsWith("/files/")).toBe(true);
  });

  it("keeps the CV ats variant under /files/, unlike the Portfolio ats variant", () => {
    const manifest = getDocumentsManifest("Jane Example");
    const cvAts = manifest.find((entry) => entry.kind === "cvAtsDe");
    expect(cvAts?.url.startsWith("/files/")).toBe(true);
  });

  it("cache-busts the public Portfolio and Portfolio-ATS URLs with the deploy version", () => {
    process.env.EXPO_PUBLIC_DEPLOY_VERSION = "deploy123";

    const manifest = getDocumentsManifest("Jane Example");
    const portfolio = manifest.find((entry) => entry.kind === "portfolioDe");
    const ats = manifest.find((entry) => entry.kind === "portfolioAtsDe");

    expect(portfolio?.url).toBe("/DE/Jane_Example_-_Portfolio.pdf?v=deploy123");
    expect(ats?.url).toBe("/DE/Jane_Example_-_Portfolio_ATS.pdf?v=deploy123");
  });
});
