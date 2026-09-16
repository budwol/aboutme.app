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
    html = '<meta name="robots" content="noindex, nofollow"><script>if (true && "serviceWorker" in navigator) { serviceWorker.register("/sw.js") }</script>',
    manifest = { display: "standalone", scope: "/", icons: [{}] },
    includeSw = true,
  }: { html?: string; manifest?: object; includeSw?: boolean } = {},
) {
  const dist = path.join(root, "dist");
  const publicDir = path.join(root, "public");
  fs.mkdirSync(dist);
  fs.mkdirSync(publicDir);
  fs.writeFileSync(path.join(dist, "index.html"), html);
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

  it("rejects a build where the service worker registration was left disabled", () => {
    // Regression test: the registration is gated behind
    // %WNA_ENABLE_SERVICE_WORKER% (see vite.config.ts) so `vite dev`
    // never registers it -- a build that resolved that placeholder to
    // anything other than "true" would silently ship with no service
    // worker in production.
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-pwa-"));
    const { dist, publicDir } = writeFixture(root, {
      html: '<meta name="robots" content="noindex, nofollow"><script>if (false && "serviceWorker" in navigator) { serviceWorker.register("/sw.js") }</script>',
    });

    expect(() => assertWebPwa(dist, publicDir)).toThrow(
      "web PWA must enable the service worker in production builds",
    );
    fs.rmSync(root, { recursive: true, force: true });
  });
});
