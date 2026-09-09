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

    expect(getResumePdfUrl("de")).toBe("/Portfolio-DE.pdf");
  });

  it("resolves the English resume file", () => {
    delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;

    expect(getResumePdfUrl("en")).toBe("/Portfolio-EN.pdf");
  });

  it("appends the deploy version when configured", () => {
    process.env.EXPO_PUBLIC_DEPLOY_VERSION = "deploy123";

    expect(getResumePdfUrl("de")).toBe("/Portfolio-DE.pdf?v=deploy123");
  });
});
