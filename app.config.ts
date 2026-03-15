import { ConfigContext, ExpoConfig } from "expo/config";

const appName = process.env.APP_NAME ?? "APP_NAME";
const appDescription = process.env.APP_DESCRIPTION ?? "APP_DESCRIPTION";
const appVersion = process.env.EXPO_PUBLIC_APP_VERSION ?? "1.0.0";
const publicLogo1024 = "./public/logo_1024.png";
const publicLogo192 = "./public/logo_192.png";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  platforms: ["web"],
  jsEngine: "hermes",
  name: appName,
  description: appDescription,
  slug: process.env.EXPO_SLUG ?? "EXPO_SLUG",
  owner: process.env.EXPO_OWNER ?? "EXPO_OWNER",
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
    sourceMaps: true,
  },
  plugins: [
    "expo-font",
    "expo-web-browser",
    "expo-router",
    "expo-localization",
  ],
  scheme: process.env.SCHEME ?? "SCHEME",
});
