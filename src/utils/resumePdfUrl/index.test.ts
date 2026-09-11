import { afterEach, describe, expect, it } from "@jest/globals";
import { getResumePdfUrl } from "@utils/resumePdfUrl";

describe("getResumePdfUrl", () => {
  const originalDeployVersion = process.env.EXPO_PUBLIC_DEPLOY_VERSION;

  afterEach(() => {
    if (originalDeployVersion === undefined) {
      delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;
      return;
    }

    process.env.EXPO_PUBLIC_DEPLOY_VERSION = originalDeployVersion;
  });

  it("resolves the German resume file", () => {
    delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;

    expect(getResumePdfUrl("de", "Jane Example")).toBe(
      "/Jane_Example_-_Portfolio_DE.pdf",
    );
  });

  it("resolves the English resume file", () => {
    delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;

    expect(getResumePdfUrl("en", "Jane Example")).toBe(
      "/Jane_Example_-_Portfolio_EN.pdf",
    );
  });

  it("appends the deploy version when configured", () => {
    process.env.EXPO_PUBLIC_DEPLOY_VERSION = "deploy123";

    expect(getResumePdfUrl("de", "Jane Example")).toBe(
      "/Jane_Example_-_Portfolio_DE.pdf?v=deploy123",
    );
  });

  it("spells out German umlauts and ß instead of dropping them", () => {
    delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;

    expect(getResumePdfUrl("de", "Björn Müller-Straße")).toBe(
      "/Bjoern_Mueller-Strasse_-_Portfolio_DE.pdf",
    );
  });

  it("strips characters that are neither filesystem- nor URL-safe", () => {
    delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;

    expect(getResumePdfUrl("de", "Anne O'Connor (Dr.)")).toBe(
      "/Anne_OConnor_Dr_-_Portfolio_DE.pdf",
    );
  });
});
