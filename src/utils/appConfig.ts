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

export function normalizeSiteUrl(value?: unknown): string {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    return defaultAppData.siteUrl;
  }

  return normalized.replace(/\/+$/, "");
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

  if (!appDataSiteUrl && !publicSiteUrl && !baseUrl) {
    throw new Error(
      "Missing site URL configuration. Set app-data.json siteUrl, EXPO_PUBLIC_SITE_URL, or BASE_URL.",
    );
  }

  return normalizeSiteUrl(
    appDataSiteUrl || publicSiteUrl || baseUrl || defaultAppData.siteUrl,
  );
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
