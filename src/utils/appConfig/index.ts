import {
  getConfiguredSiteUrlFromSources,
  isAllowedSiteUrl,
  normalizeSiteUrl,
} from "@utils/appConfig/siteUrl";

export { isAllowedSiteUrl, normalizeSiteUrl, getConfiguredSiteUrlFromSources };

export function getConfiguredSiteUrl(): string {
  const publicSiteUrl =
    typeof process.env.EXPO_PUBLIC_SITE_URL === "string"
      ? process.env.EXPO_PUBLIC_SITE_URL.trim()
      : "";
  const baseUrl =
    typeof process.env.BASE_URL === "string" ? process.env.BASE_URL.trim() : "";

  return getConfiguredSiteUrlFromSources({
    publicSiteUrl,
    baseUrl,
  });
}
