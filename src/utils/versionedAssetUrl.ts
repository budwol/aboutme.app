function appendQueryParam(url: string, key: string, value: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

export function getVersionedLocalAssetUrl(url: string) {
  const normalizedUrl = `${url ?? ""}`.trim();

  if (
    normalizedUrl === "" ||
    normalizedUrl.startsWith("http") ||
    normalizedUrl.startsWith("data:")
  ) {
    return normalizedUrl;
  }

  if (/[?&]v=/.test(normalizedUrl)) {
    return normalizedUrl;
  }

  const deployVersion = process.env.EXPO_PUBLIC_DEPLOY_VERSION?.trim();

  if (!deployVersion) {
    return normalizedUrl;
  }

  return appendQueryParam(normalizedUrl, "v", deployVersion);
}
