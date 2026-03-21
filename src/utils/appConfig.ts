import { defaultAppData } from "@/app-data";

type AppDataJson = Partial<typeof defaultAppData> & {
  profile?: Partial<typeof defaultAppData.profile>;
};

function readAppDataJson(): AppDataJson {
  try {
    const rawModule = require("../../app-data.json") as unknown;

    if (
      typeof rawModule === "object" &&
      rawModule !== null &&
      "default" in rawModule
    ) {
      const defaultExport = (rawModule as { default?: AppDataJson }).default;
      return defaultExport ?? {};
    }

    return (rawModule as AppDataJson) ?? {};
  } catch {
    return {};
  }
}

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
    return defaultAppData.siteUrl;
  }

  if (!isAllowedSiteUrl(normalized)) {
    return defaultAppData.siteUrl;
  }

  return normalizeParsedSiteUrl(new URL(normalized));
}

export function getConfiguredSiteUrlFromSources(sources: {
  appDataSiteUrl?: string;
  publicSiteUrl?: string;
  baseUrl?: string;
}): string {
  const configuredSiteUrl =
    sources.appDataSiteUrl || sources.publicSiteUrl || sources.baseUrl || "";

  if (!configuredSiteUrl) {
    throw new Error(
      "Missing site URL configuration. Set app-data.json siteUrl, EXPO_PUBLIC_SITE_URL, or BASE_URL.",
    );
  }

  if (!isAllowedSiteUrl(configuredSiteUrl)) {
    throw new Error(
      "Invalid site URL configuration. Only https:// URLs and local http:// URLs are allowed.",
    );
  }

  return normalizeSiteUrl(configuredSiteUrl);
}

export function getConfiguredSiteUrl(): string {
  const appData = readAppDataJson();
  const appDataSiteUrl =
    typeof appData.siteUrl === "string" ? appData.siteUrl.trim() : "";
  const publicSiteUrl =
    typeof process.env.EXPO_PUBLIC_SITE_URL === "string"
      ? process.env.EXPO_PUBLIC_SITE_URL.trim()
      : "";
  const baseUrl =
    typeof process.env.BASE_URL === "string" ? process.env.BASE_URL.trim() : "";

  return getConfiguredSiteUrlFromSources({
    appDataSiteUrl,
    publicSiteUrl,
    baseUrl,
  });
}

export function getConfiguredProfileName(): string {
  const appData = readAppDataJson();
  const appDataProfileName =
    typeof appData.profile?.name === "string"
      ? appData.profile.name.trim()
      : "";
  const envAppName =
    typeof process.env.APP_NAME === "string" ? process.env.APP_NAME.trim() : "";

  return appDataProfileName || envAppName || defaultAppData.profile.name;
}
