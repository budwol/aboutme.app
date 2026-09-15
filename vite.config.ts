import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string;
};

function versionedBackgroundPreload(deployVersion: string | undefined): Plugin {
  const url = deployVersion?.trim()
    ? `/bg.webp?v=${encodeURIComponent(deployVersion.trim())}`
    : "/bg.webp";

  return {
    name: "wna-versioned-background-preload",
    transformIndexHtml(html) {
      return html.replace("%WNA_BACKGROUND_PRELOAD_URL%", url);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      versionedBackgroundPreload(env.EXPO_PUBLIC_DEPLOY_VERSION),
    ],
    envPrefix: "EXPO_PUBLIC_",
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@assets": path.resolve(__dirname, "assets"),
        "@constants": path.resolve(__dirname, "src/constants"),
        "@components": path.resolve(__dirname, "src/components"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "wna-logger": path.resolve(__dirname, "src/utils/logger.ts"),
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
