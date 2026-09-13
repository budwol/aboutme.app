import { afterEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

/* eslint-disable @typescript-eslint/no-require-imports */
const { assertWebBundle } =
  require("../../../scripts/assert-web-bundle.cjs") as {
    assertWebBundle: (
      distDir: string,
      maxBytes?: number,
      logger?: (message: string) => void,
    ) => { files: string[]; totalBytes: number };
  };
/* eslint-enable @typescript-eslint/no-require-imports */

const fixtures: string[] = [];

describe("assert-web-bundle", () => {
  afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("accepts a bounded web bundle without native markers", () => {
    const dist = createDist("console.log('web')");
    const logger = jest.fn();

    expect(assertWebBundle(dist, 100, logger).totalBytes).toBeGreaterThan(0);
    expect(logger).toHaveBeenCalledWith(
      expect.stringMatching(/^web bundle check passed:/),
    );
  });

  it("rejects missing bundles and oversized bundles", () => {
    const emptyDist = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-bundle-"));
    fixtures.push(emptyDist);
    fs.mkdirSync(path.join(emptyDist, "_expo", "static", "js", "web"), {
      recursive: true,
    });

    expect(() => assertWebBundle(emptyDist)).toThrow(
      "no web JavaScript bundle",
    );

    const oversizedDist = createDist("123456789");
    expect(() => assertWebBundle(oversizedDist, 1)).toThrow("exceeds 1 bytes");
  });

  it("rejects native dependency markers in the web bundle", () => {
    const dist = createDist("const dependency = 'expo-image';");

    expect(() => assertWebBundle(dist)).toThrow(
      "forbidden native web-bundle marker found: expo-image",
    );
  });
});

function createDist(content: string) {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-bundle-"));
  fixtures.push(dist);
  const bundleDir = path.join(dist, "_expo", "static", "js", "web");
  fs.mkdirSync(bundleDir, { recursive: true });
  fs.writeFileSync(path.join(bundleDir, "entry.js"), content, "utf8");
  return dist;
}
