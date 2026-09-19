import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { assertWebPwa } = require("../../../scripts/assert-web-pwa.cjs") as {
  assertWebPwa: (
    distDir: string,
    publicDir: string,
  ) => {
    display: string;
    iconCount: number;
  };
};

function writeFixture(
  root: string,
  {
    html = '<meta name="robots" content="noindex, nofollow"><script type="module" src="/assets/index.js"></script>',
    bundle = 'navigator.serviceWorker.register("/sw.js", { scope: "/" })',
    manifest = { display: "standalone", scope: "/", icons: [{}] },
    includeSw = true,
  }: {
    html?: string;
    bundle?: string;
    manifest?: object;
    includeSw?: boolean;
  } = {},
) {
  const dist = path.join(root, "dist");
  const publicDir = path.join(root, "public");
  fs.mkdirSync(dist);
  fs.mkdirSync(path.join(dist, "assets"));
  fs.mkdirSync(publicDir);
  fs.writeFileSync(path.join(dist, "index.html"), html);
  fs.writeFileSync(path.join(dist, "assets", "index.js"), bundle);
  fs.writeFileSync(
    path.join(publicDir, "site.webmanifest"),
    JSON.stringify(manifest),
  );
  if (includeSw) {
    fs.writeFileSync(path.join(publicDir, "sw.js"), "self", "utf8");
  }
  return { dist, publicDir };
}

describe("assert-web-pwa", () => {
  it("requires the installed PWA contract and intentional noindex policy", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-pwa-"));
    const { dist, publicDir } = writeFixture(root);

    expect(assertWebPwa(dist, publicDir)).toEqual({
      display: "standalone",
      iconCount: 1,
    });
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("rejects a build without service worker registration", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-pwa-"));
    const { dist, publicDir } = writeFixture(root, {
      bundle: "navigator.serviceWorker.getRegistrations()",
    });

    expect(() => assertWebPwa(dist, publicDir)).toThrow(
      "web PWA must register /sw.js",
    );
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("rejects inline executable scripts", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-pwa-"));
    const { dist, publicDir } = writeFixture(root, {
      html: '<meta name="robots" content="noindex, nofollow"><script>alert(1)</script>',
    });

    expect(() => assertWebPwa(dist, publicDir)).toThrow(
      "web PWA must not ship inline executable scripts",
    );
    fs.rmSync(root, { recursive: true, force: true });
  });
});
