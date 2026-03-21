import sanitizeHtmlLibrary from "sanitize-html";

const allowedTags: string[] = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "blockquote",
  "code",
  "pre",
];

const allowedAttributes = {
  a: ["href", "target"],
};

const allowedSchemes = ["https", "mailto", "tel"];
const allowedSchemesByTag = {
  a: ["https", "mailto", "tel"],
};

export const stripHtml = (str?: string) =>
  str?.replace(/(<([^>]+)>)/gi, "") ?? "";

export const isHtml = (str?: string) => /(<([^>]+)>)/i.test(str ?? "");

export const escapeHtml = (value?: string): string =>
  (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const sanitizeHtml = (value?: string): string =>
  sanitizeHtmlLibrary(value ?? "", {
    allowedTags: [...allowedTags],
    allowedAttributes,
    allowedSchemes: [...allowedSchemes],
    allowedSchemesAppliedToAttributes: ["href"],
    allowedSchemesByTag,
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true,
    transformTags: {
      a: (
        _tagName: string,
        attribs: Record<string, string>,
      ): sanitizeHtmlLibrary.Tag => {
        const nextAttribs: Record<string, string> = {};

        if (attribs.href) {
          nextAttribs.href = attribs.href;
        }

        if (["_blank", "_self"].includes(attribs.target)) {
          nextAttribs.target = attribs.target;
        }

        return {
          tagName: "a",
          attribs: nextAttribs,
        };
      },
    },
  });
