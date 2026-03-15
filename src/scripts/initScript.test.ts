import { afterEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { runInitProcess } = require("../../scripts/init-process.cjs") as {
  runInitProcess: (
    rootDir: string,
    options?: {
      dryRun?: boolean;
      logger?: (...parts: string[]) => void;
      processLogo?: (rootDir: string, publicDir: string) => void;
      convertBackground?: (sourcePath: string, targetPath: string) => void;
    },
  ) => { generated: boolean; migrated: boolean };
};

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function copyRepoScript(
  repoRoot: string,
  relativePath: string,
  targetRoot: string,
): void {
  const sourcePath = path.join(repoRoot, relativePath);
  const targetPath = path.join(targetRoot, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
  fs.chmodSync(targetPath, 0o755);
}

function createFixtureRepo(): string {
  const repoRoot = process.cwd();
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-init-"));

  copyRepoScript(repoRoot, "init.sh", fixtureRoot);
  copyRepoScript(repoRoot, "scripts/svgToPng.sh", fixtureRoot);
  copyRepoScript(repoRoot, "scripts/resizeImage.sh", fixtureRoot);
  copyRepoScript(repoRoot, "scripts/init-process.cjs", fixtureRoot);
  copyRepoScript(repoRoot, "assets/defaults/logo.svg", fixtureRoot);
  copyRepoScript(repoRoot, "assets/defaults/bg.webp", fixtureRoot);
  copyRepoScript(
    repoRoot,
    "assets/defaults/images/default_avatar.webp",
    fixtureRoot,
  );
  copyRepoScript(
    repoRoot,
    "assets/defaults/images/default_project.webp",
    fixtureRoot,
  );

  writeFile(
    path.join(fixtureRoot, "app-data.example.json"),
    JSON.stringify(
      {
        siteUrl: "https://portfolio.example.com",
        profile: {
          name: "Jane Example",
          avatar: "default_avatar.webp",
        },
        projects: [
          {
            titleDe: "Projekt",
            titleEn: "Project",
            imageL: "default_project.webp",
            imageM: "default_project.webp",
            imageS: "default_project.webp",
          },
        ],
      },
      null,
      2,
    ),
  );

  writeFile(
    path.join(fixtureRoot, "public", "serve.json"),
    JSON.stringify({ headers: [] }, null, 2),
  );
  writeFile(
    path.join(fixtureRoot, ".env.example"),
    "APP_NAME=AboutMe\nBASE_URL=https://portfolio.example.com\n",
  );
  return fixtureRoot;
}

function runInit(fixtureRoot: string, options?: { dryRun?: boolean }): string {
  const output: string[] = [];

  runInitProcess(fixtureRoot, {
    dryRun: options?.dryRun,
    logger: (...parts: string[]) => {
      output.push(parts.join(" "));
    },
    processLogo: (_rootDir, publicDir) => {
      const logoSvg = path.join(publicDir, "logo.svg");
      const logoPng = path.join(publicDir, "logo.png");
      const faviconSvg = path.join(publicDir, "favicon.svg");
      const faviconPng = path.join(publicDir, "favicon.png");
      const faviconIco = path.join(publicDir, "favicon.ico");

      fs.writeFileSync(logoPng, "png", "utf8");
      fs.writeFileSync(faviconSvg, fs.readFileSync(logoSvg, "utf8"), "utf8");
      fs.writeFileSync(faviconPng, "png", "utf8");
      fs.writeFileSync(faviconIco, "ico", "utf8");
    },
    convertBackground: (_sourcePath, targetPath) => {
      fs.writeFileSync(targetPath, "converted-background", "utf8");
    },
  });

  return `${output.join("\n")}\n`;
}

const createdFixtures: string[] = [];

describe("init.sh", () => {
  afterEach(() => {
    for (const fixture of createdFixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("creates the single source of truth structure on first run", () => {
    const fixtureRoot = createFixtureRepo();
    createdFixtures.push(fixtureRoot);

    const output = runInit(fixtureRoot);

    expect(
      fs.existsSync(path.join(fixtureRoot, ".aboutme", "app-data.json")),
    ).toBe(true);
    expect(fs.existsSync(path.join(fixtureRoot, ".aboutme", "images"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "app-data.json"))).toBe(true);
    expect(fs.existsSync(path.join(fixtureRoot, ".env"))).toBe(true);
    expect(output).toContain("Created .aboutme/app-data.json");
    expect(output).toContain("Created .env from .env.example");
    expect(output).toContain("Seeded default asset .aboutme/images/logo.svg");
    expect(output).toContain("Generated public assets");
    expect(
      fs.existsSync(path.join(fixtureRoot, "public", "site.webmanifest")),
    ).toBe(true);
  });

  it("generates derived files when source data and images exist", () => {
    const fixtureRoot = createFixtureRepo();
    createdFixtures.push(fixtureRoot);

    const output = runInit(fixtureRoot);

    expect(output).toContain("Generated public assets");
    expect(
      fs.readFileSync(path.join(fixtureRoot, "app-data.json"), "utf8"),
    ).toBe(
      fs.readFileSync(
        path.join(fixtureRoot, ".aboutme", "app-data.json"),
        "utf8",
      ),
    );
    expect(
      fs.existsSync(path.join(fixtureRoot, "public", "site.webmanifest")),
    ).toBe(true);
    expect(fs.existsSync(path.join(fixtureRoot, "public", "robots.txt"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "public", "sitemap.xml"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "nginx", "site.conf"))).toBe(
      true,
    );
    expect(
      fs.existsSync(
        path.join(fixtureRoot, "public", "images", "default_avatar.webp"),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(fixtureRoot, "public", "images", "default_project.webp"),
      ),
    ).toBe(true);
    expect(fs.existsSync(path.join(fixtureRoot, "public", "bg.webp"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "public", "logo.png"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "public", "favicon.svg"))).toBe(
      true,
    );
  });

  it("is idempotent across repeated runs", () => {
    const fixtureRoot = createFixtureRepo();
    createdFixtures.push(fixtureRoot);

    runInit(fixtureRoot);

    runInit(fixtureRoot);

    const manifestPath = path.join(fixtureRoot, "public", "site.webmanifest");
    const nginxPath = path.join(fixtureRoot, "nginx", "site.conf");
    const publicImagePath = path.join(
      fixtureRoot,
      "public",
      "images",
      "default_project.webp",
    );
    const envPath = path.join(fixtureRoot, ".env");
    const beforeManifest = fs.readFileSync(manifestPath, "utf8");
    const beforeNginx = fs.readFileSync(nginxPath, "utf8");
    const beforeImage = fs.readFileSync(publicImagePath, "utf8");
    const beforeEnv = fs.readFileSync(envPath, "utf8");

    const output = runInit(fixtureRoot);

    expect(output).not.toContain("Migrated existing");
    expect(output).not.toContain("Created .env from .env.example");
    expect(fs.readFileSync(manifestPath, "utf8")).toBe(beforeManifest);
    expect(fs.readFileSync(nginxPath, "utf8")).toBe(beforeNginx);
    expect(fs.readFileSync(publicImagePath, "utf8")).toBe(beforeImage);
    expect(fs.readFileSync(envPath, "utf8")).toBe(beforeEnv);
  });

  it("supports a dry run without writing generated files", () => {
    const fixtureRoot = createFixtureRepo();
    createdFixtures.push(fixtureRoot);

    const output = runInit(fixtureRoot, { dryRun: true });

    expect(output).toContain("Dry run enabled");
    expect(output).toContain("Would create .aboutme/app-data.json");
    expect(output).toContain("Would create .env from .env.example");
    expect(output).toContain("Would regenerate public assets");
    expect(fs.existsSync(path.join(fixtureRoot, ".aboutme"))).toBe(false);
    expect(
      fs.existsSync(path.join(fixtureRoot, ".aboutme", "app-data.json")),
    ).toBe(false);
    expect(fs.existsSync(path.join(fixtureRoot, ".env"))).toBe(false);
    expect(
      fs.existsSync(path.join(fixtureRoot, "public", "site.webmanifest")),
    ).toBe(false);
    expect(fs.existsSync(path.join(fixtureRoot, "nginx"))).toBe(false);
    expect(fs.existsSync(path.join(fixtureRoot, "nginx", "site.conf"))).toBe(
      false,
    );
  });
});
