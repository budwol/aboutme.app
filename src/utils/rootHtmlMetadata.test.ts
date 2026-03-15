import { describe, expect, it } from "@jest/globals";
import { buildRootHtmlMetadata } from "@app/rootHtmlMetadata";

describe("buildRootHtmlMetadata", () => {
  it("uses the configured base URL instead of localhost fallbacks", () => {
    const metadata = buildRootHtmlMetadata(
      "https://portfolio.example.com/",
      "en",
    );

    expect(metadata.baseUrl).toBe("https://portfolio.example.com");
    expect(metadata.ogImageUrl).toBe(
      "https://portfolio.example.com/logo_300_366.png",
    );
    expect(metadata.schemaOrg["@graph"][0]).toMatchObject({
      url: "https://portfolio.example.com",
      inLanguage: "en",
      publisher: {
        "@id": "https://portfolio.example.com",
      },
    });
  });
});
