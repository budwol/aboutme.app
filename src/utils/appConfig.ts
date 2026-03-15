import { DEFAULT_APP_DATA } from "@/app-data";

type AppDataJson = Partial<typeof DEFAULT_APP_DATA> & {
  profile?: Partial<typeof DEFAULT_APP_DATA.profile>;
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
    return DEFAULT_APP_DATA.siteUrl;
  }

  return normalized.replace(/\/+$/, "");
}

export function getConfiguredSiteUrl(): string {
  const appData = readAppDataJson();

  return normalizeSiteUrl(
    appData.siteUrl ??
      process.env.EXPO_PUBLIC_SITE_URL ??
      process.env.BASE_URL ??
      DEFAULT_APP_DATA.siteUrl,
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

  return appDataProfileName || envAppName || DEFAULT_APP_DATA.profile.name;
}
