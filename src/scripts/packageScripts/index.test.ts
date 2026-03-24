import { describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import path from "path";
import { ConfigContext, ExpoConfig } from "expo/config";

type PackageJson = {
  scripts?: Record<string, string>;
  version: string;
};

function readPackageJson(): PackageJson {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;
}

function readRootFile(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("package scripts", () => {
  it("re-syncs the real app-data after the local CI path", () => {
    const packageJson = readPackageJson();
    const ciLocal = packageJson.scripts?.["ci:local"];
    const orderedGates = [
      "npm run test:prettier",
      "npm run lint",
      "npm run test:types",
      "npm run test:unit",
      "npm run test:integration",
      "npm run test:dry-run",
      "npm run test:smoke",
      "npm run test:e2e",
    ];

    expect(ciLocal).toBeDefined();
    expect(ciLocal).toContain("node ./scripts/sync-web-app-data.cjs");

    let previousGateIndex = -1;
    for (const gate of orderedGates) {
      const gateIndex = ciLocal!.indexOf(gate);
      expect(gateIndex).toBeGreaterThan(previousGateIndex);
      previousGateIndex = gateIndex;
    }

    const resyncIndex = ciLocal!.lastIndexOf(
      "node ./scripts/sync-web-app-data.cjs",
    );

    expect(resyncIndex).toBeGreaterThan(previousGateIndex);
  });

  it("re-syncs the real app-data again right before web export", () => {
    const packageJson = readPackageJson();
    const exportWeb = packageJson.scripts?.["export:web"];

    expect(exportWeb).toBeDefined();

    const syncCommand = "node ./scripts/sync-web-app-data.cjs";
    const firstSyncIndex = exportWeb!.indexOf(syncCommand);
    const ciLocalIndex = exportWeb!.indexOf("npm run ci:local");
    const secondSyncIndex = exportWeb!.lastIndexOf(syncCommand);
    const exportIndex = exportWeb!.indexOf("npx expo export -p web");

    expect(firstSyncIndex).toBeGreaterThanOrEqual(0);
    expect(ciLocalIndex).toBeGreaterThan(firstSyncIndex);
    expect(secondSyncIndex).toBeGreaterThan(ciLocalIndex);
    expect(exportIndex).toBeGreaterThan(secondSyncIndex);
  });

  it("keeps the app version in package.json as the single maintained source", () => {
    const packageJson = readPackageJson();
    const envExample = readRootFile(".env.example");

    expect(envExample).not.toContain("EXPO_PUBLIC_APP_VERSION");

    jest.resetModules();
    process.env.APP_NAME = "AboutMe";
    process.env.APP_DESCRIPTION = "Portfolio";

    // `app.config.ts` is evaluated in Node, so the test mirrors that path.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const appConfigModule = require("../../../app.config") as {
      default: (context: ConfigContext) => ExpoConfig;
    };
    const buildConfig = appConfigModule.default;
    const expoConfig = buildConfig({
      config: {} as ExpoConfig,
      packageJsonPath: path.resolve(process.cwd(), "package.json"),
      projectRoot: process.cwd(),
      staticConfigPath: null,
    });

    expect(expoConfig.version).toBe(packageJson.version);
    expect(expoConfig.extra?.appVersion).toBe(packageJson.version);
  });
});
