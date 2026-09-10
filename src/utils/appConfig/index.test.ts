import { describe, expect, it } from "@jest/globals";
import {
  getConfiguredSiteUrl,
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
    expect(isAllowedSiteUrl("")).toBe(false);
    expect(isAllowedSiteUrl(undefined)).toBe(false);
    expect(normalizeSiteUrl("http://example.com")).toBe(
      "http://localhost:8081",
    );
    expect(normalizeSiteUrl(undefined)).toBe("http://localhost:8081");
  });

  it("uses the first valid configured site url", () => {
    expect(
      getConfiguredSiteUrlFromSources({
        publicSiteUrl: "https://public.example.com",
        baseUrl: "https://base.example.com",
      }),
    ).toBe("https://public.example.com");
    expect(
      getConfiguredSiteUrlFromSources({
        baseUrl: "https://base.example.com",
      }),
    ).toBe("https://base.example.com");
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

  it("reads configured site urls from environment variables", () => {
    const originalPublicSiteUrl = process.env.EXPO_PUBLIC_SITE_URL;
    const originalBaseUrl = process.env.BASE_URL;

    process.env.EXPO_PUBLIC_SITE_URL = " https://public.example.com/ ";
    process.env.BASE_URL = "https://base.example.com/";
    expect(getConfiguredSiteUrl()).toBe("https://public.example.com");

    process.env.EXPO_PUBLIC_SITE_URL = "";
    process.env.BASE_URL = " https://base.example.com/ ";
    expect(getConfiguredSiteUrl()).toBe("https://base.example.com");

    process.env.EXPO_PUBLIC_SITE_URL = originalPublicSiteUrl;
    process.env.BASE_URL = originalBaseUrl;
  });

  it("treats unset environment variables as empty", () => {
    const env = process.env as Record<string, string | undefined>;
    const originalPublicSiteUrl = env.EXPO_PUBLIC_SITE_URL;
    const originalBaseUrl = env.BASE_URL;

    delete env.EXPO_PUBLIC_SITE_URL;
    env.BASE_URL = "https://base.example.com/";
    expect(getConfiguredSiteUrl()).toBe("https://base.example.com");

    delete env.BASE_URL;
    expect(() => getConfiguredSiteUrl()).toThrow(
      /Set EXPO_PUBLIC_SITE_URL or BASE_URL/,
    );

    if (originalPublicSiteUrl === undefined) {
      delete env.EXPO_PUBLIC_SITE_URL;
    } else {
      env.EXPO_PUBLIC_SITE_URL = originalPublicSiteUrl;
    }
    if (originalBaseUrl === undefined) {
      delete env.BASE_URL;
    } else {
      env.BASE_URL = originalBaseUrl;
    }
  });
});
