import { describe, expect, it, jest } from "@jest/globals";

describe("currentAppVersion", () => {
  it("reads the app version exposed via Constants.expoConfig.extra", () => {
    jest.resetModules();
    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: { expoConfig: { extra: { appVersion: "9.9.9" } } },
    }));

    const currentAppVersion =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require("@utils/currentAppVersion") as { default: () => string })
        .default;

    expect(currentAppVersion()).toBe("9.9.9");
  });

  it("falls back to a placeholder version when the config is unavailable", () => {
    jest.resetModules();
    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: { expoConfig: undefined },
    }));

    const currentAppVersion =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require("@utils/currentAppVersion") as { default: () => string })
        .default;

    expect(currentAppVersion()).toBe("0.0.0");
  });
});
