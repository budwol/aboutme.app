const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const srcRoot = path.join(__dirname, "src");
const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

config.resolver.platforms = ["web", "ios", "android"];

config.resolver.extraNodeModules = {
  "@": srcRoot,
  "@assets": path.resolve(__dirname, "assets"),
  "@constants": path.resolve(__dirname, "src/constants"),
  "@hooks": path.resolve(__dirname, "src/hooks"),
  "@services": path.resolve(__dirname, "src/services"),
  "@components": path.resolve(__dirname, "src/components"),
  "@app": path.resolve(__dirname, "src/app"),
  "@utils": path.resolve(__dirname, "src/utils"),
  "@secrets": path.resolve(__dirname, "secrets"),
  "wna-logger": path.resolve(__dirname, "src/utils/logger.ts"),
};

module.exports = config;
