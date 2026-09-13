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

describe("assert-web-pwa", () => {
  it("requires the installed PWA contract and intentional noindex policy", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-pwa-"));
    const dist = path.join(root, "dist");
    const publicDir = path.join(root, "public");
    fs.mkdirSync(dist);
    fs.mkdirSync(publicDir);
    fs.writeFileSync(
      path.join(dist, "index.html"),
      '<meta name="robots" content="noindex, nofollow"><script>serviceWorker.register("/sw.js")</script>',
    );
    fs.writeFileSync(
      path.join(publicDir, "site.webmanifest"),
      JSON.stringify({ display: "standalone", scope: "/", icons: [{}] }),
    );
    fs.writeFileSync(path.join(publicDir, "sw.js"), "self", "utf8");

    expect(assertWebPwa(dist, publicDir)).toEqual({
      display: "standalone",
      iconCount: 1,
    });
    fs.rmSync(root, { recursive: true, force: true });
  });
});
