import { describe, expect, it } from "@jest/globals";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseEnvText } = require("../../scripts/env-parser.cjs") as {
  parseEnvText: (
    content: string,
    sourceLabel?: string,
  ) => Record<string, string>;
};

describe("env-parser", () => {
  it("parses env values without evaluating shell expressions", () => {
    const env = parseEnvText(
      [
        "APP_NAME=AboutMe",
        "SAFE_VALUE=$(touch should-not-run)",
        'QUOTED_VALUE="hello world"',
      ].join("\n"),
      ".env",
    );

    expect(env).toEqual({
      APP_NAME: "AboutMe",
      SAFE_VALUE: "$(touch should-not-run)",
      QUOTED_VALUE: "hello world",
    });
  });

  it("supports comments and export-prefixed entries", () => {
    const env = parseEnvText(
      ["# comment", "export BASE_URL=https://example.com/"].join("\n"),
      ".env",
    );

    expect(env).toEqual({
      BASE_URL: "https://example.com/",
    });
  });

  it("rejects invalid env keys", () => {
    expect(() => parseEnvText("NOT-VALID=value", ".env")).toThrow(
      "Invalid env key 'NOT-VALID' in .env:1",
    );
  });
});
