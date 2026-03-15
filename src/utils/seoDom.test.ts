/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from "@jest/globals";
import { createSeoEntry } from "@constants/seoCatalog";
import { applySeoMetadata } from "@utils/seoDom";

describe("applySeoMetadata", () => {
  it("writes the expected canonical and social meta tags", () => {
    const seoEntry = {
      ...createSeoEntry("Portfolio", {
        de: () => "https://example.com/de",
        en: () => "https://example.com/en",
      }),
      description: {
        de: "Beschreibung",
        en: "Description",
      },
      image: "/cover.png",
    };

    const canonical = applySeoMetadata({
      seoEntry,
      lang: "de",
      baseUrl: "https://example.com",
    });

    expect(canonical).toBe("https://example.com/de");
    expect(document.title).toBe("Portfolio");
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://example.com/de");
    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
    ).toBe("https://example.com/cover.png");
    expect(
      document
        .querySelector('meta[name="twitter:description"]')
        ?.getAttribute("content"),
    ).toBe("Beschreibung");
  });

  it("updates existing tags instead of duplicating them", () => {
    const seoEntry = createSeoEntry("Updated Title", {
      de: () => "https://example.com/de/updated",
      en: () => "https://example.com/en/updated",
    });

    applySeoMetadata({
      seoEntry,
      lang: "en",
      baseUrl: "https://example.com",
    });
    applySeoMetadata({
      seoEntry,
      lang: "en",
      baseUrl: "https://example.com",
    });

    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[property="og:title"]')).toHaveLength(
      1,
    );
    expect(
      document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute("content"),
    ).toBe("Updated Title");
  });
});
