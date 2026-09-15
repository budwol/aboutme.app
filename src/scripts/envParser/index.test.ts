import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";
/* eslint-disable @typescript-eslint/no-require-imports */
const { parseEnvFile, parseEnvText, parseEnvValue } =
  require("../../../scripts/env-parser.cjs") as {
    parseEnvFile: (filePath: string) => Record<string, string>;
    parseEnvText: (
      content: string,
      sourceLabel?: string,
    ) => Record<string, string>;
    parseEnvValue: (value: string) => string;
  };
/* eslint-enable @typescript-eslint/no-require-imports */

describe("env-parser", () => {
  it("exists where load-env.sh expects it", () => {
    expect(
      fs.existsSync(path.join(process.cwd(), "scripts", "env-parser.cjs")),
    ).toBe(true);
  });

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

  it("parses quoted values and escaped control characters", () => {
    expect(parseEnvValue(' "line 1\\nline 2\\t\\"quoted\\"" ')).toBe(
      'line 1\nline 2\t"quoted"',
    );
    expect(parseEnvValue("'single quoted value'")).toBe("single quoted value");
    expect(parseEnvValue("plain value")).toBe("plain value");
  });

  it("rejects entries without a separator and reads env files", () => {
    expect(() => parseEnvText("BROKEN", "fixture.env")).toThrow(
      "Invalid env entry in fixture.env:1",
    );

    const envFile = path.join(process.cwd(), "test-results", "parser.env");
    fs.mkdirSync(path.dirname(envFile), { recursive: true });
    fs.writeFileSync(envFile, "FROM_FILE=value\n", "utf8");
    try {
      expect(parseEnvFile(envFile)).toEqual({ FROM_FILE: "value" });
    } finally {
      fs.rmSync(envFile, { force: true });
    }
  });

  it("rejects invalid env keys", () => {
    expect(() => parseEnvText("NOT-VALID=value", ".env")).toThrow(
      "Invalid env key 'NOT-VALID' in .env:1",
    );
  });
});
