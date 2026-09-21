import { afterEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const initProcessModule = require("../../../scripts/init-process.cjs") as {
  buildGeneratedFiles: (input: {
    siteUrl: string;
    profileName: string;
    appName: string;
  }) => {
    nginxConfig: string;
    robotsTxt: string;
    sitemapXml: string;
    llmsTxt: string;
    manifest: string;
  };
  buildAvatarVariantFileName: (fileName: string, size: number) => string;
  buildHtpasswdLine: (username: string, password: string) => string;
  DOCUMENTS_AUTH_USERNAME: string;
  findBackgroundSource: (directory: string) => string | null;
  generateDocumentsPassword: () => string;
  getRequiredImageFiles: (data: unknown) => string[];
  normalizeSiteUrl: (siteUrl?: string) => string;
  parseCliArgs: (args: string[]) => { dryRun: boolean };
  readOrCreateDocumentsPassword: (
    passwordFile: string,
    logger: (...parts: string[]) => void,
  ) => string;
  runInitProcess: (
    rootDir: string,
    options?: {
      dryRun?: boolean;
      logger?: (...parts: string[]) => void;
      processLogo?: (rootDir: string, publicDir: string) => void;
      convertBackground?: (sourcePath: string, targetPath: string) => void;
      createResponsiveAvatar?: (
        sourcePath: string,
        targetPath: string,
        size: number,
      ) => void;
    },
  ) => { generated: boolean; migrated: boolean };
};
const {
  buildAvatarVariantFileName,
  buildGeneratedFiles,
  buildHtpasswdLine,
  DOCUMENTS_AUTH_USERNAME,
  findBackgroundSource,
  generateDocumentsPassword,
  getRequiredImageFiles,
  normalizeSiteUrl,
  parseCliArgs,
  readOrCreateDocumentsPassword,
  runInitProcess,
} = initProcessModule;

describe("init process security", () => {
  it("handles CLI flags, image variants, and required image references", () => {
    expect(parseCliArgs(["--dry-run"])).toEqual({ dryRun: true });
    expect(parseCliArgs([])).toEqual({ dryRun: false });
    expect(buildAvatarVariantFileName("avatar.png", 300)).toBe(
      "avatar_300.webp",
    );
    expect(
      getRequiredImageFiles({
        profile: { avatar: "avatar.webp" },
        projects: [
          {
            imageL: "large.webp",
            imageM: "medium.webp",
            imageS: "small.webp",
          },
          { imageL: "large.webp" },
        ],
      }),
    ).toEqual(["avatar.webp", "large.webp", "medium.webp", "small.webp"]);
    expect(getRequiredImageFiles({ profile: {}, projects: [] })).toEqual([]);
  });

  it("accepts https urls and local http urls", () => {
    expect(normalizeSiteUrl("https://portfolio.example.com/")).toBe(
      "https://portfolio.example.com",
    );
    expect(normalizeSiteUrl("http://localhost:8081/")).toBe(
      "http://localhost:8081",
    );
  });

  it("rejects unsafe site urls", () => {
    expect(() => normalizeSiteUrl()).toThrow("siteUrl is missing");
    expect(() => normalizeSiteUrl("http://example.com")).toThrow(
      /invalid siteUrl/,
    );
    expect(() => normalizeSiteUrl("https://example.com?x=1")).toThrow(
      /invalid siteUrl/,
    );
    expect(() => normalizeSiteUrl("javascript:alert(1)")).toThrow(
      /invalid siteUrl/,
    );
  });

  it("uses the normalized host in generated output", () => {
    const generated = buildGeneratedFiles({
      siteUrl: "https://portfolio.example.com/",
      profileName: "Jane Example",
      appName: "AboutMe",
    });

    expect(generated.nginxConfig).toContain("listen 8080 default_server;");
    expect(generated.nginxConfig).toContain("error_log /dev/stderr warn;");
    expect(generated.nginxConfig).toContain(
      "add_header 'Cross-Origin-Opener-Policy' 'same-origin' always;",
    );
    expect(generated.nginxConfig).toContain(
      "add_header 'Permissions-Policy' 'geolocation=(self),accelerometer=(),camera=(),fullscreen=(),gyroscope=(),magnetometer=(),microphone=(),midi=(),payment=(),sync-xhr=(),usb=()' always;",
    );
    expect(generated.nginxConfig).toContain(
      "add_header 'Cross-Origin-Resource-Policy' 'same-origin' always;",
    );
    expect(generated.nginxConfig).toContain("base-uri 'self';");
    expect(generated.nginxConfig).toContain("form-action 'self';");
    expect(generated.nginxConfig).toContain("manifest-src 'self';");
    expect(generated.nginxConfig).toContain("script-src-attr 'none';");
    expect(generated.nginxConfig).toContain("worker-src 'self' blob:;");
    expect(generated.nginxConfig).toContain("upgrade-insecure-requests;");
    expect(generated.nginxConfig).not.toContain("https://cdnjs.cloudflare.com");
    // The CSP relies on 'self' alone -- no site-specific or wildcard
    // subdomain host should ever be echoed into it (a wildcard subdomain
    // allowance is a real attack surface if any subdomain is ever
    // compromised or hosts user content).
    expect(generated.nginxConfig).not.toContain("portfolio.example.com");
    expect(generated.nginxConfig).not.toContain("https://*.");
    expect(generated.nginxConfig).not.toContain(
      "script-src 'self' 'unsafe-inline'",
    );
    expect(generated.manifest).toContain('"scope": "/"');
    expect(generated.manifest).toContain('"start_url": "/"');
  });

  it("keeps security headers in locations with their own cache headers", () => {
    const { nginxConfig } = buildGeneratedFiles({
      siteUrl: "https://portfolio.example.com/",
      profileName: "Jane Example",
      appName: "AboutMe",
    });

    const locations = nginxConfig.match(/ {4}location [^\n]+ \{[^}]+\}/g) ?? [];
    const cachedLocations = locations.filter((location) =>
      location.includes("add_header Cache-Control"),
    );

    expect(cachedLocations).toHaveLength(7);
    for (const location of cachedLocations) {
      expect(location).toContain(
        "add_header 'X-Content-Type-Options' 'nosniff' always;",
      );
      expect(location).toContain("add_header 'X-Frame-Options' 'DENY' always;");
      expect(location).toContain("add_header 'Strict-Transport-Security'");
      expect(location).toContain("add_header Content-Security-Policy");
      expect(location).toContain("frame-ancestors 'self'");
    }
  });

  it("exempts the service worker script from the long-lived immutable cache rule", () => {
    // Regression test: sw.js is a .js file, so the generic asset rule
    // below would otherwise cache it as immutable for a year -- since
    // there's no separate .css bundle (every style lives inline in
    // index.html's own <style> tag), a browser stuck on a year-old,
    // never-rechecked service worker has no way to ever notice that
    // index.html (and the CSS inside it) changed either. This needs its
    // own exact ("=") location: nginx always prefers an exact match over
    // a regex one regardless of which is declared first, so this alone
    // guarantees it wins over the general asset rule below it.
    const generated = buildGeneratedFiles({
      siteUrl: "https://portfolio.example.com/",
      profileName: "Jane Example",
      appName: "AboutMe",
    });

    expect(generated.nginxConfig).toMatch(
      /location = \/sw\.js \{[^}]*add_header Cache-Control "no-cache";\s*\}/,
    );

    const swLocationIndex = generated.nginxConfig.indexOf("location = /sw.js");
    const genericAssetLocationIndex = generated.nginxConfig.indexOf(
      "location ~* \\.(js|css|",
    );
    expect(swLocationIndex).toBeGreaterThan(-1);
    expect(genericAssetLocationIndex).toBeGreaterThan(-1);
    expect(swLocationIndex).toBeLessThan(genericAssetLocationIndex);
    expect(
      fs.existsSync(
        path.resolve(process.cwd(), "scripts/web-service-worker.js"),
      ),
    ).toBe(true);
  });

  it("forces auth_basic on /files/ to win over the generic asset-caching regex", () => {
    // Regression test for a real, verified bypass: nginx always prefers a
    // matching regex location (like the .pdf/.js/... asset-caching rule
    // below) over a plain prefix location, no matter how specific the
    // prefix is. Without the "^~" modifier, a request for a .pdf file
    // under /files/ matched that unrelated regex location instead of the
    // auth_basic-protected one and was served with zero authentication --
    // caught only by curling a real built container, not by a config
    // string match. "^~" makes nginx stop checking regex locations
    // entirely once /files/ is the longest matching prefix, regardless of
    // the request's file extension.
    const generated = buildGeneratedFiles({
      siteUrl: "https://portfolio.example.com/",
      profileName: "Jane Example",
      appName: "AboutMe",
    });

    expect(generated.nginxConfig).toContain("location ^~ /files/ {");
    expect(generated.nginxConfig).toMatch(
      /location \^~ \/files\/ \{[^}]*auth_basic_user_file \/etc\/nginx\/\.htpasswd;[^}]*\}/,
    );
  });

  it("selects the first available background source", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-bg-"));
    const imagesDir = path.join(fixtureRoot, "images");
    fs.mkdirSync(imagesDir, { recursive: true });
    expect(findBackgroundSource(imagesDir)).toBe(null);
    fs.writeFileSync(path.join(imagesDir, "bg.jpg"), "background", "utf8");
    expect(findBackgroundSource(imagesDir)).toBe(
      path.join(imagesDir, "bg.jpg"),
    );
    fs.writeFileSync(path.join(imagesDir, "bg.webp"), "preferred", "utf8");
    expect(findBackgroundSource(imagesDir)).toBe(
      path.join(imagesDir, "bg.webp"),
    );
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  });
});

describe("documents password / .htpasswd", () => {
  const createdFixtures: string[] = [];

  afterEach(() => {
    for (const fixture of createdFixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  function createPasswordFile(): string {
    const fixtureRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "aboutme-documents-password-"),
    );
    createdFixtures.push(fixtureRoot);
    return path.join(fixtureRoot, "secrets", "documents-password.txt");
  }

  it("uses a fixed, non-secret username", () => {
    expect(DOCUMENTS_AUTH_USERNAME).toBe("documents");
  });

  it("generates a 32-character password starting with '!' that mixes case and digits", () => {
    for (let i = 0; i < 20; i += 1) {
      const password = generateDocumentsPassword();
      expect(password).toHaveLength(32);
      expect(password.startsWith("!")).toBe(true);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[0-9]/.test(password)).toBe(true);
      expect(/^![A-Za-z0-9]{31}$/.test(password)).toBe(true);
    }
  });

  it("creates and persists a password when none exists yet", () => {
    const passwordFile = createPasswordFile();
    const logger = jest.fn<(...parts: string[]) => void>();

    const password = readOrCreateDocumentsPassword(passwordFile, logger);

    expect(/^![A-Za-z0-9]{31}$/.test(password)).toBe(true);
    expect(fs.readFileSync(passwordFile, "utf8")).toBe(`${password}\n`);
    expect(logger).toHaveBeenCalledWith(
      "generated .aboutme/secrets/documents-password.txt",
    );
  });

  it("reuses an existing valid password without rewriting or logging", () => {
    const passwordFile = createPasswordFile();
    const logger = jest.fn<(...parts: string[]) => void>();
    const first = readOrCreateDocumentsPassword(passwordFile, logger);

    logger.mockClear();
    const second = readOrCreateDocumentsPassword(passwordFile, logger);

    expect(second).toBe(first);
    expect(logger).not.toHaveBeenCalled();
  });

  it("regenerates and persists a new password when the file is malformed", () => {
    const passwordFile = createPasswordFile();
    fs.mkdirSync(path.dirname(passwordFile), { recursive: true });
    fs.writeFileSync(passwordFile, "not-a-valid-password\n", "utf8");
    const logger = jest.fn<(...parts: string[]) => void>();

    const password = readOrCreateDocumentsPassword(passwordFile, logger);

    expect(/^![A-Za-z0-9]{31}$/.test(password)).toBe(true);
    expect(fs.readFileSync(passwordFile, "utf8")).toBe(`${password}\n`);
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("ignoring malformed"),
    );
    expect(logger).toHaveBeenCalledWith(
      "generated .aboutme/secrets/documents-password.txt",
    );
  });

  it("builds an nginx {SHA} auth_basic line matching an independent SHA-1 computation", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto") as typeof import("crypto");
    const password = "!Test1234567890Test1234567890a";
    const expectedDigest = crypto
      .createHash("sha1")
      .update(password, "utf8")
      .digest("base64");

    expect(buildHtpasswdLine("documents", password)).toBe(
      `documents:{SHA}${expectedDigest}\n`,
    );
  });
});

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
    createResponsiveAvatar: (_sourcePath, targetPath, size) => {
      fs.writeFileSync(targetPath, `responsive-avatar-${size}`, "utf8");
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

  it("sets up the local source directory on the first run", () => {
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
    expect(
      fs.existsSync(path.join(fixtureRoot, "public", "app-data.json")),
    ).toBe(true);
    expect(fs.existsSync(path.join(fixtureRoot, ".env"))).toBe(true);
    expect(output).toContain("created .aboutme/app-data.json");
    expect(output).toContain("created .env from .env.example");
    expect(output).toContain("Seeded default asset .aboutme/images/logo.svg");
    expect(output).toContain("generated public assets");
    expect(
      fs.existsSync(path.join(fixtureRoot, "public", "site.webmanifest")),
    ).toBe(true);
    expect(fs.existsSync(path.join(fixtureRoot, "public", "sw.js"))).toBe(true);
    expect(
      fs.readFileSync(path.join(fixtureRoot, "public", "sw.js"), "utf8"),
    ).toContain('const CACHE_NAME = "aboutme-shell-v2"');
    const serviceWorker = fs.readFileSync(
      path.join(fixtureRoot, "public", "sw.js"),
      "utf8",
    );
    expect(serviceWorker).toContain('request.mode === "navigate"');
    expect(serviceWorker).toContain('caches.match("/")');
    expect(serviceWorker).toContain("cache.put(request, response)");
    expect(serviceWorker).toContain("self.clients.claim()");
  });

  it("builds the public files when the source data is there", () => {
    const fixtureRoot = createFixtureRepo();
    createdFixtures.push(fixtureRoot);

    const output = runInit(fixtureRoot);

    expect(output).toContain("generated public assets");
    expect(
      fs.readFileSync(path.join(fixtureRoot, "app-data.json"), "utf8"),
    ).toBe(
      fs.readFileSync(
        path.join(fixtureRoot, ".aboutme", "app-data.json"),
        "utf8",
      ),
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
    expect(
      fs.existsSync(path.join(fixtureRoot, "public", "site.webmanifest")),
    ).toBe(true);
    expect(fs.existsSync(path.join(fixtureRoot, "public", "robots.txt"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "public", "sitemap.xml"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "public", "llms.txt"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "nginx", "site.conf"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "nginx", ".htpasswd"))).toBe(
      true,
    );
    expect(
      fs.existsSync(
        path.join(fixtureRoot, ".aboutme", "secrets", "documents-password.txt"),
      ),
    ).toBe(true);
    expect(
      fs.readFileSync(path.join(fixtureRoot, "nginx", ".htpasswd"), "utf8"),
    ).toMatch(/^documents:\{SHA\}[A-Za-z0-9+/]+=*\n$/);
    expect(
      fs.existsSync(
        path.join(fixtureRoot, "public", "images", "default_avatar.webp"),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(fixtureRoot, "public", "images", "default_avatar_300.webp"),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(fixtureRoot, "public", "images", "default_avatar_384.webp"),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(fixtureRoot, "public", "images", "default_avatar_512.webp"),
      ),
    ).toBe(true);
    expect(
      fs.readFileSync(
        path.join(fixtureRoot, "public", "images", "default_avatar_300.webp"),
        "utf8",
      ),
    ).toBe("responsive-avatar-300");
    expect(
      fs.readFileSync(
        path.join(fixtureRoot, "public", "images", "default_avatar_384.webp"),
        "utf8",
      ),
    ).toBe("responsive-avatar-384");
    expect(
      fs.readFileSync(
        path.join(fixtureRoot, "public", "images", "default_avatar_512.webp"),
        "utf8",
      ),
    ).toBe("responsive-avatar-512");
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
    const nginxConfig = fs.readFileSync(
      path.join(fixtureRoot, "nginx", "site.conf"),
      "utf8",
    );
    expect(nginxConfig).toContain(
      "add_header 'Cross-Origin-Opener-Policy' 'same-origin' always;",
    );
    expect(nginxConfig).toContain(
      "add_header 'Permissions-Policy' 'geolocation=(self),accelerometer=(),camera=(),fullscreen=(),gyroscope=(),magnetometer=(),microphone=(),midi=(),payment=(),sync-xhr=(),usb=()' always;",
    );
    expect(nginxConfig).toContain("base-uri 'self';");
    expect(nginxConfig).toContain("form-action 'self';");
    expect(nginxConfig).toContain("manifest-src 'self';");
    expect(nginxConfig).toContain("script-src-attr 'none';");
    expect(nginxConfig).toContain("worker-src 'self' blob:;");
    expect(nginxConfig).not.toContain("https://cdnjs.cloudflare.com");
    expect(nginxConfig).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  it("stays idempotent across repeated runs", () => {
    const fixtureRoot = createFixtureRepo();
    createdFixtures.push(fixtureRoot);

    runInit(fixtureRoot);

    runInit(fixtureRoot);

    const manifestPath = path.join(fixtureRoot, "public", "site.webmanifest");
    const publicAppDataPath = path.join(fixtureRoot, "public", "app-data.json");
    const nginxPath = path.join(fixtureRoot, "nginx", "site.conf");
    const htpasswdPath = path.join(fixtureRoot, "nginx", ".htpasswd");
    const documentsPasswordPath = path.join(
      fixtureRoot,
      ".aboutme",
      "secrets",
      "documents-password.txt",
    );
    const publicImagePath = path.join(
      fixtureRoot,
      "public",
      "images",
      "default_project.webp",
    );
    const envPath = path.join(fixtureRoot, ".env");
    const beforeManifest = fs.readFileSync(manifestPath, "utf8");
    const beforePublicAppData = fs.readFileSync(publicAppDataPath, "utf8");
    const beforeNginx = fs.readFileSync(nginxPath, "utf8");
    const beforeHtpasswd = fs.readFileSync(htpasswdPath, "utf8");
    const beforeDocumentsPassword = fs.readFileSync(
      documentsPasswordPath,
      "utf8",
    );
    const beforeImage = fs.readFileSync(publicImagePath, "utf8");
    const beforeEnv = fs.readFileSync(envPath, "utf8");

    const output = runInit(fixtureRoot);

    expect(output).not.toContain("migrated");
    expect(output).not.toContain("created .env from .env.example");
    expect(fs.readFileSync(manifestPath, "utf8")).toBe(beforeManifest);
    expect(fs.readFileSync(publicAppDataPath, "utf8")).toBe(
      beforePublicAppData,
    );
    expect(fs.readFileSync(nginxPath, "utf8")).toBe(beforeNginx);
    expect(fs.readFileSync(htpasswdPath, "utf8")).toBe(beforeHtpasswd);
    expect(fs.readFileSync(documentsPasswordPath, "utf8")).toBe(
      beforeDocumentsPassword,
    );
    expect(fs.readFileSync(publicImagePath, "utf8")).toBe(beforeImage);
    expect(fs.readFileSync(envPath, "utf8")).toBe(beforeEnv);
  });

  it("supports a dry run without writing files", () => {
    const fixtureRoot = createFixtureRepo();
    createdFixtures.push(fixtureRoot);

    const output = runInit(fixtureRoot, { dryRun: true });

    expect(output).toContain("dry run");
    expect(output).toContain("would create .aboutme/app-data.json");
    expect(output).toContain("would create .env from .env.example");
    expect(output).toContain("would regenerate public assets");
    expect(fs.existsSync(path.join(fixtureRoot, ".aboutme"))).toBe(false);
    expect(
      fs.existsSync(path.join(fixtureRoot, ".aboutme", "app-data.json")),
    ).toBe(false);
    expect(fs.existsSync(path.join(fixtureRoot, ".env"))).toBe(false);
    expect(
      fs.existsSync(path.join(fixtureRoot, "public", "app-data.json")),
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(fixtureRoot, "public", "images", "default_avatar_300.webp"),
      ),
    ).toBe(false);
    expect(
      fs.existsSync(path.join(fixtureRoot, "public", "site.webmanifest")),
    ).toBe(false);
    expect(fs.existsSync(path.join(fixtureRoot, "nginx"))).toBe(false);
    expect(fs.existsSync(path.join(fixtureRoot, "nginx", "site.conf"))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(fixtureRoot, "nginx", ".htpasswd"))).toBe(
      false,
    );
    expect(
      fs.existsSync(
        path.join(fixtureRoot, ".aboutme", "secrets", "documents-password.txt"),
      ),
    ).toBe(false);
  });
});
