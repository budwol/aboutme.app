import { describe, expect, it } from "@jest/globals";

type InitProcessModule = {
  buildGeneratedFiles: (input: {
    siteUrl: string;
    profileName: string;
    appName: string;
  }) => {
    nginxConfig: string;
    robotsTxt: string;
    sitemapXml: string;
    manifest: string;
  };
  normalizeSiteUrl: (siteUrl?: string) => string;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const initProcessModule: InitProcessModule = require("../../scripts/init-process.cjs");
const { buildGeneratedFiles, normalizeSiteUrl } = initProcessModule;

describe("init process security", () => {
  it("accepts https urls and local http urls", () => {
    expect(normalizeSiteUrl("https://portfolio.example.com/")).toBe(
      "https://portfolio.example.com",
    );
    expect(normalizeSiteUrl("http://localhost:8081/")).toBe(
      "http://localhost:8081",
    );
  });

  it("rejects unsafe site urls", () => {
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

    expect(generated.nginxConfig).toContain("https://portfolio.example.com");
    expect(generated.nginxConfig).toContain("listen 8080 default_server;");
    expect(generated.nginxConfig).toContain("error_log /dev/stderr warn;");
    expect(generated.nginxConfig).toContain(
      "add_header 'Cross-Origin-Resource-Policy' 'same-origin' always;",
    );
    expect(generated.manifest).toContain('"scope": "/"');
    expect(generated.manifest).toContain('"start_url": "/"');
  });
});
