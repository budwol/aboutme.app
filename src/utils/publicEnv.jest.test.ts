import { describe, expect, it } from "@jest/globals";
import { readPublicEnv } from "@utils/publicEnv";

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
