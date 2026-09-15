import { afterEach, describe, expect, it } from "@jest/globals";
import currentAppVersion from "@utils/currentAppVersion";

describe("currentAppVersion", () => {
  const originalVersion = globalThis.__APP_VERSION__;

  afterEach(() => {
    globalThis.__APP_VERSION__ = originalVersion;
  });

  it("reads the build-injected app version", () => {
    globalThis.__APP_VERSION__ = "9.9.9";

    expect(currentAppVersion()).toBe("9.9.9");
  });

  it("falls back to a placeholder version when it is not injected", () => {
    globalThis.__APP_VERSION__ = undefined;

    expect(currentAppVersion()).toBe("0.0.0");
  });
});
