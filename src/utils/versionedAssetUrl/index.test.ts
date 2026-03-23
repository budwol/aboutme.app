import { afterEach, describe, expect, it } from "@jest/globals";
import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";

describe("getVersionedLocalAssetUrl", () => {
  const originalDeployVersion = process.env.EXPO_PUBLIC_DEPLOY_VERSION;

  afterEach(() => {
    if (originalDeployVersion === undefined) {
      delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;
      return;
    }

    process.env.EXPO_PUBLIC_DEPLOY_VERSION = originalDeployVersion;
  });

  it("appends the deploy version to local asset urls", () => {
    process.env.EXPO_PUBLIC_DEPLOY_VERSION = "deploy123";

    expect(getVersionedLocalAssetUrl("/images/ava.webp")).toBe(
      "/images/ava.webp?v=deploy123",
    );
    expect(getVersionedLocalAssetUrl("images/ava.webp")).toBe(
      "images/ava.webp?v=deploy123",
    );
  });

  it("keeps remote, data, and already-versioned urls unchanged", () => {
    process.env.EXPO_PUBLIC_DEPLOY_VERSION = "deploy123";

    expect(getVersionedLocalAssetUrl("https://cdn.example.com/a.webp")).toBe(
      "https://cdn.example.com/a.webp",
    );
    expect(getVersionedLocalAssetUrl("data:image/png;base64,abc")).toBe(
      "data:image/png;base64,abc",
    );
    expect(getVersionedLocalAssetUrl("/images/ava.webp?v=existing")).toBe(
      "/images/ava.webp?v=existing",
    );
  });

  it("returns the original url when no deploy version is configured", () => {
    delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;

    expect(getVersionedLocalAssetUrl("/images/ava.webp")).toBe(
      "/images/ava.webp",
    );
  });
});
