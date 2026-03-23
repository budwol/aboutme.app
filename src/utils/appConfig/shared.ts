const DEFAULT_SITE_URL = "http://localhost:8081";
const DEFAULT_PROFILE_NAME = "Your Name";

export type AppDataJson = {
  siteUrl?: string;
  profile?: {
    name?: string;
  };
};

function isLocalHttpHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  );
}

function normalizeParsedSiteUrl(url: URL): string {
  const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
  return `${url.protocol}//${url.host}${pathname}`;
}

export function isAllowedSiteUrl(value?: unknown): boolean {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    const parsed = new URL(value.trim());

    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      return false;
    }

    if (parsed.protocol === "https:") {
      return true;
    }

    return parsed.protocol === "http:" && isLocalHttpHost(parsed.hostname);
  } catch {
    return false;
  }
}

export function normalizeSiteUrl(value?: unknown): string {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    return DEFAULT_SITE_URL;
  }

  if (!isAllowedSiteUrl(normalized)) {
    return DEFAULT_SITE_URL;
  }

  return normalizeParsedSiteUrl(new URL(normalized));
}

export function getConfiguredSiteUrlFromSources(sources: {
  publicSiteUrl?: string;
  baseUrl?: string;
}): string {
  const configuredSiteUrl = sources.publicSiteUrl || sources.baseUrl || "";

  if (!configuredSiteUrl) {
    throw new Error(
      "Missing site URL configuration. Set EXPO_PUBLIC_SITE_URL or BASE_URL.",
    );
  }

  if (!isAllowedSiteUrl(configuredSiteUrl)) {
    throw new Error(
      "Invalid site URL configuration. Only https:// URLs and local http:// URLs are allowed.",
    );
  }

  return normalizeSiteUrl(configuredSiteUrl);
}

export function getConfiguredProfileNameFromSources(sources: {
  appDataProfileName?: string;
  envAppName?: string;
}): string {
  return (
    sources.appDataProfileName || sources.envAppName || DEFAULT_PROFILE_NAME
  );
}
