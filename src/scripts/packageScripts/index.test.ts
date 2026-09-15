import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
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
  it("starts the prepared local web app by default", () => {
    const packageJson = readPackageJson();

    expect(packageJson.scripts?.start).toBe("npm run web");
  });

  it("re-syncs the real app-data after the local CI path", () => {
    const packageJson = readPackageJson();
    const ciLocal = packageJson.scripts?.["ci:local"];
    const ciLocalScript = readRootFile("scripts/ci-local.sh");
    const orderedCommands = [
      "rm -rf dist .cache",
      "npm prune",
      "npm run test:prettier",
      "npm run lint",
      "npm run test:types",
      "npm run test:unit",
      "npm run test:coverage",
      "npm run test:integration",
      "npm run test:dry-run",
      "npm run test:smoke",
      "npm run test:e2e",
    ];

    expect(ciLocal).toBeDefined();
    expect(ciLocal).toBe("./scripts/ci-local.sh");
    expect(ciLocalScript).toContain("node ./scripts/sync-web-app-data.cjs");

    let previousCommandIndex = -1;
    for (const command of orderedCommands) {
      const commandIndex = ciLocalScript.indexOf(command);
      expect(commandIndex).toBeGreaterThan(previousCommandIndex);
      previousCommandIndex = commandIndex;
    }

    const resyncIndex = ciLocalScript.lastIndexOf(
      "node ./scripts/sync-web-app-data.cjs",
    );

    expect(resyncIndex).toBeGreaterThan(previousCommandIndex);
    expect(ciLocalScript).toContain("echo ci:local done.");
  });

  it("re-syncs the real app-data again right before web export", () => {
    const packageJson = readPackageJson();
    const exportWeb = packageJson.scripts?.["export:web"];

    expect(exportWeb).toBeDefined();

    const syncCommand = "node ./scripts/sync-web-app-data.cjs";
    const firstSyncIndex = exportWeb!.indexOf(syncCommand);
    const ciLocalIndex = exportWeb!.indexOf("npm run ci:local");
    const secondSyncIndex = exportWeb!.lastIndexOf(syncCommand);
    const exportIndex = exportWeb!.indexOf("vite build");
    const injectWebShellIndex = exportWeb!.indexOf(
      "node ./scripts/inject-web-shell.cjs",
    );

    expect(firstSyncIndex).toBeGreaterThanOrEqual(0);
    expect(ciLocalIndex).toBeGreaterThan(firstSyncIndex);
    expect(secondSyncIndex).toBeGreaterThan(ciLocalIndex);
    expect(exportIndex).toBeGreaterThan(secondSyncIndex);
    expect(injectWebShellIndex).toBeGreaterThan(exportIndex);
  });

  it("keeps the broad local test stack aligned with coverage enforcement", () => {
    const packageJson = readPackageJson();
    const testAll = packageJson.scripts?.["test:all"];

    expect(testAll).toBeDefined();

    const orderedCommands = [
      "npm run test:prettier",
      "npm run test:types",
      "npm run test:unit",
      "npm run test:coverage",
      "npm run test:integration",
      "npm run test:e2e",
    ];

    let previousCommandIndex = -1;
    for (const command of orderedCommands) {
      const commandIndex = testAll!.indexOf(command);
      expect(commandIndex).toBeGreaterThan(previousCommandIndex);
      previousCommandIndex = commandIndex;
    }
  });

  it("keeps the GitHub Actions workflow chain aligned with the local gate order", () => {
    const ciWorkflow = readRootFile(".github/workflows/ci.yml");
    const expectedEdges = [
      ["unit:", "needs: lint_prettier"],
      ["coverage:", "needs: unit"],
      ["integration:", "needs: coverage"],
      ["dry_run:", "needs: integration"],
      ["smoke:", "needs: dry_run"],
      ["e2e:", "needs: smoke"],
    ];

    for (const [job, needs] of expectedEdges) {
      const jobIndex = ciWorkflow.indexOf(job);
      const needsIndex = ciWorkflow.indexOf(needs, jobIndex);

      expect(jobIndex).toBeGreaterThanOrEqual(0);
      expect(needsIndex).toBeGreaterThan(jobIndex);
    }

    expect(ciWorkflow).toContain("uses: ./.github/workflows/ci-coverage.yml");
  });

  it("keeps the app version in package.json as the single maintained source", () => {
    // `vite` ships ESM-only, so its config can't be `require()`-d under
    // Jest's CommonJS runtime -- assert the wiring by content instead of
    // executing it (`vite build` itself exercises the real thing, see
    // scripts/smoke-export.sh's version check against the built bundle).
    const viteConfig = readRootFile("vite.config.ts");

    expect(viteConfig).toContain("packageJson.version");
    expect(viteConfig).toContain("__APP_VERSION__");
  });

  it("does not reintroduce the removed direct font dependency", () => {
    const packageJson = readPackageJson();

    expect(packageJson.dependencies).not.toHaveProperty("expo-font");
  });

  it("stays free of Expo and React Native dependencies", () => {
    const packageJson = readPackageJson();
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    const removedPackages = [
      "expo",
      "expo-router",
      "expo-constants",
      "expo-doctor",
      "expo-linking",
      "eslint-config-expo",
      "jest-expo",
      "react-native",
      "react-native-web",
      "@react-navigation/native",
      "react-native-safe-area-context",
      "react-native-screens",
      "react-native-gesture-handler",
      "react-native-reanimated",
      "react-native-worklets",
    ];

    for (const dependency of removedPackages) {
      expect(allDependencies).not.toHaveProperty(dependency);
    }
  });
});
