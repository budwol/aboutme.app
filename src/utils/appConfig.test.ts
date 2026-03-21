import { describe, expect, it } from "@jest/globals";
import {
  getConfiguredSiteUrlFromSources,
  isAllowedSiteUrl,
  normalizeSiteUrl,
} from "@utils/appConfig";

describe("appConfig", () => {
  it("normalizes valid https urls", () => {
    expect(normalizeSiteUrl("https://portfolio.example.com/")).toBe(
      "https://portfolio.example.com",
    );
    expect(normalizeSiteUrl("https://portfolio.example.com/base/")).toBe(
      "https://portfolio.example.com/base",
    );
  });

  it("allows local http urls but rejects non-local http urls", () => {
    expect(normalizeSiteUrl("http://localhost:8081/")).toBe(
      "http://localhost:8081",
    );
    expect(isAllowedSiteUrl("http://localhost:8081")).toBe(true);
    expect(isAllowedSiteUrl("http://example.com")).toBe(false);
  });

  it("rejects unsafe or malformed urls", () => {
    expect(isAllowedSiteUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedSiteUrl("https://example.com?x=1")).toBe(false);
    expect(isAllowedSiteUrl("https://user:pass@example.com")).toBe(false);
    expect(isAllowedSiteUrl("/relative/path")).toBe(false);
  });

  it("uses the first configured valid site url source", () => {
    expect(
      getConfiguredSiteUrlFromSources({
        appDataSiteUrl: "https://app-data.example.com/",
        publicSiteUrl: "https://public.example.com",
        baseUrl: "https://base.example.com",
      }),
    ).toBe("https://app-data.example.com");
  });

  it("throws on missing or invalid configured site urls", () => {
    expect(() => getConfiguredSiteUrlFromSources({})).toThrow(
      /Missing site URL configuration/,
    );
    expect(() =>
      getConfiguredSiteUrlFromSources({
        publicSiteUrl: "http://example.com",
      }),
    ).toThrow(/Invalid site URL configuration/);
  });
});
