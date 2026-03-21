import { describe, expect, it } from "@jest/globals";
import {
  getConfiguredSiteUrlFromSources,
  isAllowedSiteUrl,
  normalizeSiteUrl,
} from "@utils/appConfig";

describe("app config", () => {
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

  it("uses the first valid configured site url", () => {
    expect(
      getConfiguredSiteUrlFromSources({
        publicSiteUrl: "https://public.example.com",
        baseUrl: "https://base.example.com",
      }),
    ).toBe("https://public.example.com");
  });

  it("throws on missing or invalid configured site urls", () => {
    expect(() => getConfiguredSiteUrlFromSources({})).toThrow(
      /Set EXPO_PUBLIC_SITE_URL or BASE_URL/,
    );
    expect(() =>
      getConfiguredSiteUrlFromSources({
        publicSiteUrl: "http://example.com",
      }),
    ).toThrow(/Invalid site URL configuration/);
  });
});
