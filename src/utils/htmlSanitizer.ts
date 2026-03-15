const eventHandlerAttributePattern = /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const scriptTagPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const styleTagPattern = /<style[\s\S]*?>[\s\S]*?<\/style>/gi;
const javascriptUrlPattern =
  /\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi;

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
    .replace(eventHandlerAttributePattern, "")
    .replace(javascriptUrlPattern, "");
