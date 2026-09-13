import { afterEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

/* eslint-disable @typescript-eslint/no-require-imports */
const { collectHtmlFiles, injectHtml, injectWebShell } =
  require("../../../scripts/inject-web-shell.cjs") as {
    collectHtmlFiles: (dir: string) => string[];
    injectHtml: (html: string, appData: unknown) => string;
    injectWebShell: (
      rootDir: string,
      logger?: (message: string) => void,
    ) => {
      appDataPath: string;
      htmlFiles: string[];
    };
  };
/* eslint-enable @typescript-eslint/no-require-imports */

const createdFixtures: string[] = [];

describe("inject-web-shell", () => {
  afterEach(() => {
    for (const fixture of createdFixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("injects embedded app-data and a static first-paint shell", () => {
    const html = '<html><head></head><body><div id="root"></div></body></html>';
    const injected = injectHtml(html, {
      profile: {
        name: "Jane <Example>",
        titleDe: "Platform Engineer",
      },
    });

    expect(injected).toContain('id="wna-static-shell-style"');
    expect(injected).toContain('id="wna-app-data"');
    expect(injected).toContain('id="wna-static-shell"');
    expect(injected).toContain("Jane &lt;Example&gt;");
    expect(injected).toContain("Platform Engineer");
    expect(injected).toContain("\\u003cExample\\u003e");
    expect(injected).toContain(
      ":where(a,button,input,select,textarea,[tabindex]):focus-visible",
    );
    expect(injected).toContain("animation-iteration-count:1!important");
    expect(injected).toContain("scroll-behavior:auto!important");
  });

  it("collects nested html files and returns an empty list for a missing directory", () => {
    const fixtureRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "aboutme-shell-"),
    );
    createdFixtures.push(fixtureRoot);
    fs.mkdirSync(path.join(fixtureRoot, "nested"), { recursive: true });
    fs.writeFileSync(path.join(fixtureRoot, "index.html"), "", "utf8");
    fs.writeFileSync(path.join(fixtureRoot, "nested", "page.html"), "", "utf8");
    fs.writeFileSync(path.join(fixtureRoot, "notes.txt"), "", "utf8");

    expect(collectHtmlFiles(fixtureRoot)).toEqual([
      path.join(fixtureRoot, "index.html"),
      path.join(fixtureRoot, "nested", "page.html"),
    ]);
    expect(collectHtmlFiles(path.join(fixtureRoot, "missing"))).toEqual([]);
  });

  it("fails when the export app-data file is missing", () => {
    const fixtureRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "aboutme-shell-"),
    );
    createdFixtures.push(fixtureRoot);

    expect(() => injectWebShell(fixtureRoot)).toThrow(
      "missing export app-data: dist/app-data.json",
    );
  });

  it("keeps repeated injections idempotent", () => {
    const html = '<html><head></head><body><div id="root"></div></body></html>';
    const appData = { profile: { name: "Jane Example" } };
    const injected = injectHtml(injectHtml(html, appData), appData);

    expect(injected.match(/id="wna-app-data"/g)).toHaveLength(1);
    expect(injected.match(/id="wna-static-shell"/g)).toHaveLength(1);
    expect(injected.match(/id="wna-static-shell-style"/g)).toHaveLength(1);
  });

  it("updates every exported html file from dist/app-data.json", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-web-"));
    createdFixtures.push(fixtureRoot);

    const distDir = path.join(fixtureRoot, "dist");
    const nestedDir = path.join(distDir, "kontakt");
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(
      path.join(distDir, "app-data.json"),
      JSON.stringify({ profile: { name: "Export Person" } }),
      "utf8",
    );
    fs.writeFileSync(
      path.join(distDir, "index.html"),
      "<html><head></head><body></body></html>",
      "utf8",
    );
    fs.writeFileSync(
      path.join(nestedDir, "index.html"),
      "<html><head></head><body></body></html>",
      "utf8",
    );

    const logger = jest.fn<(message: string) => void>();
    const result = injectWebShell(fixtureRoot, logger);

    expect(result.htmlFiles).toHaveLength(2);
    expect(fs.readFileSync(path.join(distDir, "index.html"), "utf8")).toContain(
      "Export Person",
    );
    expect(
      fs.readFileSync(path.join(nestedDir, "index.html"), "utf8"),
    ).toContain("Export Person");
    expect(logger).toHaveBeenCalledWith("injected web shell into 2 html files");
  });
});
