/* eslint-disable @typescript-eslint/no-require-imports */
import { afterEach, describe, expect, it, jest } from "@jest/globals";

describe("currentAppVersion", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("prefers extra appVersion over Expo and native versions", () => {
    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: {
        expoConfig: { extra: { appVersion: "1.2.3" }, version: "1.2.0" },
      },
    }));
    jest.doMock("expo-application", () => ({
      nativeApplicationVersion: "1.1.0",
    }));

    expect(require("@components/currentAppVersion").default()).toBe("1.2.3");
  });

  it("falls back through Expo version, native version and unknown", () => {
    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: { expoConfig: { version: "2.0.0" } },
    }));
    jest.doMock("expo-application", () => ({
      nativeApplicationVersion: "1.1.0",
    }));
    expect(require("@components/currentAppVersion").default()).toBe("2.0.0");

    jest.resetModules();
    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: { expoConfig: undefined },
    }));
    jest.doMock("expo-application", () => ({
      nativeApplicationVersion: "1.1.0",
    }));
    expect(require("@components/currentAppVersion").default()).toBe("1.1.0");

    jest.resetModules();
    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: { expoConfig: undefined },
    }));
    jest.doMock("expo-application", () => ({
      nativeApplicationVersion: undefined,
    }));
    expect(require("@components/currentAppVersion").default()).toBe("unknown");
  });
});
