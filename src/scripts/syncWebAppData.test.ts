import { afterEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { syncWebAppData } = require("../../scripts/sync-web-app-data.cjs") as {
  syncWebAppData: (
    rootDir: string,
    logger?: (message: string) => void,
  ) => { sourceFile: string; targetFile: string };
};

const createdFixtures: string[] = [];

describe("sync-web-app-data", () => {
  afterEach(() => {
    for (const fixture of createdFixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("copies .aboutme/app-data.json into public/app-data.json", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-web-"));
    createdFixtures.push(fixtureRoot);

    const sourceDir = path.join(fixtureRoot, ".aboutme");
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(
      path.join(sourceDir, "app-data.json"),
      JSON.stringify({ profile: { name: "Jane Example" } }, null, 2),
      "utf8",
    );

    const logger = jest.fn<(message: string) => void>();
    const result = syncWebAppData(fixtureRoot, logger);

    expect(result.targetFile).toBe(
      path.join(fixtureRoot, "public", "app-data.json"),
    );
    expect(
      fs.readFileSync(
        path.join(fixtureRoot, "public", "app-data.json"),
        "utf8",
      ),
    ).toBe(
      fs.readFileSync(
        path.join(fixtureRoot, ".aboutme", "app-data.json"),
        "utf8",
      ),
    );
    expect(logger).toHaveBeenCalledWith(
      "synced .aboutme/app-data.json -> public/app-data.json",
    );
  });

  it("throws when the source file is missing", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-web-"));
    createdFixtures.push(fixtureRoot);

    expect(() => syncWebAppData(fixtureRoot)).toThrow(
      "missing source file: .aboutme/app-data.json",
    );
  });
});
