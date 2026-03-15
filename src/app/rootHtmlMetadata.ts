import { getLangCode } from "@services/i18n/i18n";
import { getConfiguredSiteUrl, normalizeSiteUrl } from "@utils/appConfig";

export type RootHtmlMetadata = {
  baseUrl: string;
  lang: string;
  ogImageUrl: string;
  schemaOrg: {
    "@context": "https://schema.org";
    "@graph": {
      "@type": "WebSite";
      "@id": string;
      url: string;
      name: string;
      alternateName: string;
      inLanguage: string;
      publisher: {
        "@id": string;
      };
    }[];
  };
};

export function buildRootHtmlMetadata(
  siteUrl = getConfiguredSiteUrl(),
  lang = getLangCode(),
): RootHtmlMetadata {
  const baseUrl = normalizeSiteUrl(siteUrl);

  return {
    baseUrl,
    lang,
    ogImageUrl: `${baseUrl}/logo_300_366.png`,
    schemaOrg: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#webpage`,
          url: baseUrl,
          name: "Portfolio",
          alternateName: "Portfolio",
          inLanguage: lang,
          publisher: {
            "@id": baseUrl,
          },
        },
      ],
    },
  };
}
