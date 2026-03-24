import { ConfigContext, ExpoConfig } from "expo/config";
import packageJson from "./package.json";

function isStrictConfigMode(): boolean {
  const ciValue = process.env.CI?.trim().toLowerCase();
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  const expoExport = process.env.EXPO_EXPORT?.trim().toLowerCase();
  const easBuild = process.env.EAS_BUILD?.trim().toLowerCase();

  return (
    ciValue === "true" ||
    nodeEnv === "production" ||
    expoExport === "true" ||
    easBuild === "true"
  );
}

function getRequiredEnv(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getEnvForMode(
  name: keyof NodeJS.ProcessEnv,
  fallback: string,
): string {
  return isStrictConfigMode()
    ? getRequiredEnv(name)
    : getOptionalEnv(name, fallback);
}

function getOptionalEnv(
  name: keyof NodeJS.ProcessEnv,
  fallback: string,
): string {
  const value = process.env[name]?.trim();

  return value || fallback;
}

function getOptionalOwner(): string | undefined {
  const value = process.env.EXPO_OWNER?.trim();

  return value || undefined;
}

const appName = getRequiredEnv("APP_NAME");
const appDescription = getRequiredEnv("APP_DESCRIPTION");
const appVersion = packageJson.version;
const publicLogo1024 = "./public/logo_1024.png";
const publicLogo192 = "./public/logo_192.png";
const appSlug = getOptionalEnv(
  "EXPO_SLUG",
  appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
);
const appOwner = getOptionalOwner();
const appScheme = getEnvForMode("SCHEME", appSlug);
const resolvedAppSlug = appSlug;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  platforms: ["web"],
  jsEngine: "hermes",
  name: appName,
  description: appDescription,
  slug: resolvedAppSlug,
  owner: appOwner,
  version: appVersion,
  orientation: "default",
  icon: publicLogo1024,
  userInterfaceStyle: "automatic",
  backgroundColor: "#181818",
  primaryColor: "#ffffff",
  extra: {
    appVersion,
    updates: {
      assetPatternsToBeBundled: ["public/**/*.png", "public/**/*.ttf"],
    },
  },
  web: {
    bundler: "metro",
    name: appName,
    shortName: appName,
    description: appDescription,
    output: "static",
    lang: "de",

    serviceWorker: {
      register: true,
      skipWaiting: true,
      clientsClaim: true,
    },
    splash: {
      image: publicLogo1024,
      resizeMode: "contain",
      backgroundColor: "#181818",
      dark: {
        backgroundColor: "#181818",
      },
    },
    favicon: publicLogo192,
    barStyle: "default",
    themeColor: "#181818",
    display: "fullscreen",
    orientation: "portrait-primary",
    sourceMaps: false,
  },
  plugins: [
    "expo-font",
    "expo-web-browser",
    "expo-router",
    "expo-localization",
  ],
  scheme: appScheme,
});
