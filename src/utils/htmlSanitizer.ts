const eventHandlerAttributePattern = /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const scriptTagPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const styleTagPattern = /<style[\s\S]*?>[\s\S]*?<\/style>/gi;
const disallowedBlockTagPattern =
  /<\/?(iframe|object|embed|form|input|button|textarea|select|option|meta|link|base)[^>]*>/gi;
const disallowedUrlPattern =
  /\s(href|src)\s*=\s*(?:"\s*(?:javascript|data|vbscript):[^"]*"|'\s*(?:javascript|data|vbscript):[^']*'|(?:javascript|data|vbscript):[^\s>]+)/gi;
const allowedTagPattern =
  /<\/?(p|br|strong|b|em|i|u|ul|ol|li|a|h1|h2|h3|blockquote|code|pre)\b[^>]*>/i;
const anyTagPattern = /<\/?([a-z0-9-]+)\b[^>]*>/gi;
const anchorAttributePattern = /<a\b([^>]*)>/gi;
const hrefAttributePattern = /\shref\s*=\s*(".*?"|'.*?'|[^\s>]+)/i;
const targetAttributePattern = /\starget\s*=\s*(".*?"|'.*?'|[^\s>]+)/i;

function normalizeAttributeValue(rawValue: string): string {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function isAllowedHref(rawHref: string): boolean {
  const href = normalizeAttributeValue(rawHref);

  return (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("https://")
  );
}

function sanitizeAnchorTag(tag: string): string {
  const hrefMatch = tag.match(hrefAttributePattern);
  const targetMatch = tag.match(targetAttributePattern);
  const safeAttributes: string[] = [];

  if (hrefMatch && isAllowedHref(hrefMatch[1])) {
    safeAttributes.push(
      ` href="${escapeHtml(normalizeAttributeValue(hrefMatch[1]))}"`,
    );
  }

  if (targetMatch) {
    const target = normalizeAttributeValue(targetMatch[1]);
    if (["_blank", "_self"].includes(target)) {
      safeAttributes.push(` target="${target}"`);
    }
  }

  if (safeAttributes.length === 0) {
    return "<a>";
  }

  return `<a${safeAttributes.join("")}>`;
}

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
  (value ?? "")
    .replace(scriptTagPattern, "")
    .replace(styleTagPattern, "")
    .replace(disallowedBlockTagPattern, "")
    .replace(eventHandlerAttributePattern, "")
    .replace(disallowedUrlPattern, "")
    .replace(anchorAttributePattern, (tag) => sanitizeAnchorTag(tag))
    .replace(anyTagPattern, (tag) => (allowedTagPattern.test(tag) ? tag : ""));
