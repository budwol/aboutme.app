import { afterEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { syncWebAppData } = require("../../scripts/sync-web-app-data.cjs") as {
  syncWebAppData: (
    rootDir: string,
    logger?: (message: string) => void,
  ) => {
    sourceFile: string;
    targetFile: string;
    sourceImagesDir: string;
    targetImagesDir: string;
    deployVersion: string;
    envLocalFile: string;
  };
};

const createdFixtures: string[] = [];
const silentLogger = () => undefined;

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
    expect(logger).toHaveBeenCalledWith(
      "synced .aboutme/images -> public/images",
    );
    expect(logger).toHaveBeenCalledWith(
      "updated .env.local -> EXPO_PUBLIC_DEPLOY_VERSION",
    );
    expect(result.deployVersion).toMatch(/^[a-z0-9]+$/);
    expect(result.envLocalFile).toBe(path.join(fixtureRoot, ".env.local"));
    expect(result.targetImagesDir).toBe(
      path.join(fixtureRoot, "public", "images"),
    );
    expect(
      fs.readFileSync(path.join(fixtureRoot, ".env.local"), "utf8"),
    ).toContain(`EXPO_PUBLIC_DEPLOY_VERSION=${result.deployVersion}`);
  });

  it("copies .aboutme/images into public/images and replaces stale files", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-web-"));
    createdFixtures.push(fixtureRoot);

    const sourceDir = path.join(fixtureRoot, ".aboutme");
    const sourceImagesDir = path.join(sourceDir, "images");
    const publicImagesDir = path.join(fixtureRoot, "public", "images");
    fs.mkdirSync(sourceImagesDir, { recursive: true });
    fs.mkdirSync(publicImagesDir, { recursive: true });

    fs.writeFileSync(
      path.join(sourceDir, "app-data.json"),
      JSON.stringify({ profile: { avatar: "ava.webp" } }, null, 2),
      "utf8",
    );
    fs.writeFileSync(
      path.join(sourceImagesDir, "ava.webp"),
      "new-avatar",
      "utf8",
    );
    fs.writeFileSync(
      path.join(sourceImagesDir, "project.webp"),
      "project-image",
      "utf8",
    );
    fs.writeFileSync(
      path.join(publicImagesDir, "ava.webp"),
      "old-avatar",
      "utf8",
    );
    fs.writeFileSync(path.join(publicImagesDir, "stale.webp"), "stale", "utf8");

    syncWebAppData(fixtureRoot, silentLogger);

    expect(
      fs.readFileSync(path.join(publicImagesDir, "ava.webp"), "utf8"),
    ).toBe("new-avatar");
    expect(
      fs.readFileSync(path.join(publicImagesDir, "project.webp"), "utf8"),
    ).toBe("project-image");
    expect(fs.existsSync(path.join(publicImagesDir, "stale.webp"))).toBe(false);
  });

  it("updates EXPO_PUBLIC_DEPLOY_VERSION in an existing .env.local without dropping other vars", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-web-"));
    createdFixtures.push(fixtureRoot);

    const sourceDir = path.join(fixtureRoot, ".aboutme");
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(
      path.join(sourceDir, "app-data.json"),
      JSON.stringify({ profile: { name: "Jane Example" } }, null, 2),
      "utf8",
    );
    fs.writeFileSync(
      path.join(fixtureRoot, ".env.local"),
      "EXPO_PUBLIC_DEPLOY_VERSION=oldvalue\nFOO=bar\n",
      "utf8",
    );

    const result = syncWebAppData(fixtureRoot, silentLogger);
    const envLocal = fs.readFileSync(
      path.join(fixtureRoot, ".env.local"),
      "utf8",
    );

    expect(envLocal).toContain(
      `EXPO_PUBLIC_DEPLOY_VERSION=${result.deployVersion}`,
    );
    expect(envLocal).toContain("FOO=bar");
    expect(envLocal).not.toContain("EXPO_PUBLIC_DEPLOY_VERSION=oldvalue");
  });

  it("throws when the source file is missing", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-web-"));
    createdFixtures.push(fixtureRoot);

    expect(() => syncWebAppData(fixtureRoot)).toThrow(
      "missing source file: .aboutme/app-data.json",
    );
  });
});
