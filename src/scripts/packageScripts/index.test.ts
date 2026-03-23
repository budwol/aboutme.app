import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

type PackageJson = {
  scripts?: Record<string, string>;
};

function readPackageJson(): PackageJson {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;
}

describe("package scripts", () => {
  it("re-syncs the real app-data after the local CI path", () => {
    const packageJson = readPackageJson();
    const ciLocal = packageJson.scripts?.["ci:local"];

    expect(ciLocal).toBeDefined();
    expect(ciLocal).toContain("npm run test:all");
    expect(ciLocal).toContain("node ./scripts/sync-web-app-data.cjs");

    const testAllIndex = ciLocal!.indexOf("npm run test:all");
    const resyncIndex = ciLocal!.lastIndexOf(
      "node ./scripts/sync-web-app-data.cjs",
    );

    expect(resyncIndex).toBeGreaterThan(testAllIndex);
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
});
