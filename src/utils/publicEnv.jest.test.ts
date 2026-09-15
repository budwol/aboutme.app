import { afterEach, describe, expect, it } from "@jest/globals";
import { isDevMode, readPublicEnv } from "@utils/publicEnv";

describe("readPublicEnv (jest)", () => {
  it("reads the value from process.env", () => {
    process.env.WNA_TEST_PUBLIC_ENV_VAR = "test-value";

    expect(readPublicEnv("WNA_TEST_PUBLIC_ENV_VAR")).toBe("test-value");

    delete process.env.WNA_TEST_PUBLIC_ENV_VAR;
  });

  it("returns undefined for an unset variable", () => {
    delete process.env.WNA_TEST_PUBLIC_ENV_VAR;

    expect(readPublicEnv("WNA_TEST_PUBLIC_ENV_VAR")).toBeUndefined();
  });
});

describe("isDevMode (jest)", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("is true outside production", () => {
    process.env.NODE_ENV = "test";

    expect(isDevMode()).toBe(true);
  });

  it("is false in production", () => {
    process.env.NODE_ENV = "production";

    expect(isDevMode()).toBe(false);
  });
});
