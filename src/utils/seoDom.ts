import { SeoEntry } from "@constants/seoCatalog";

type SeoLang = "de" | "en";

type SeoMetadataInput = {
  seoEntry: SeoEntry;
  lang: SeoLang;
  baseUrl: string;
};

function upsertHeadElement(
  selector: string,
  attrs: Record<string, string>,
  kind: "meta" | "link" = "meta",
) {
  let element = document.querySelector(selector) as
    | HTMLMetaElement
    | HTMLLinkElement
    | null;

  if (!element) {
    element =
      kind === "link"
        ? document.createElement("link")
        : document.createElement("meta");

    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    if (
      kind === "link" &&
      element instanceof HTMLLinkElement &&
      key === "href"
    ) {
      element.href = value;
      return;
    }

    element.setAttribute(key, value);
  });
}

export function applySeoMetadata({
  seoEntry,
  lang,
  baseUrl,
}: SeoMetadataInput) {
  const canonical = seoEntry.canonical[lang]().toString();
  const title = seoEntry.title[lang];
  const description = seoEntry.description[lang];
  const locale = seoEntry.locale[lang];
  const image = `${baseUrl}${seoEntry.image}`;

  upsertHeadElement(
    'link[rel="canonical"]',
    { rel: "canonical", href: canonical },
    "link",
  );

  upsertHeadElement('meta[name="description"]', {
    name: "description",
    content: description,
  });

  upsertHeadElement('meta[property="og:url"]', {
    property: "og:url",
    content: canonical,
  });

  upsertHeadElement('meta[property="og:title"]', {
    property: "og:title",
    content: title,
  });

  upsertHeadElement('meta[property="og:description"]', {
    property: "og:description",
    content: description,
  });

  upsertHeadElement('meta[property="og:image"]', {
    property: "og:image",
    content: image,
  });

  upsertHeadElement('meta[property="og:locale"]', {
    property: "og:locale",
    content: locale,
  });

  upsertHeadElement('meta[name="twitter:card"]', {
    name: "twitter:card",
    content: "summary_large_image",
  });

  upsertHeadElement('meta[name="twitter:url"]', {
    name: "twitter:url",
    content: canonical,
  });

  upsertHeadElement('meta[name="twitter:title"]', {
    name: "twitter:title",
    content: title,
  });

  upsertHeadElement('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: description,
  });

  upsertHeadElement('meta[name="twitter:image"]', {
    name: "twitter:image",
    content: image,
  });

  document.title = title;

  return canonical;
}
