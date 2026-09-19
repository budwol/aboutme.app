import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

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

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      versionedBackgroundPreload(env.EXPO_PUBLIC_DEPLOY_VERSION),
    ],
    envPrefix: "EXPO_PUBLIC_",
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      __IS_PRODUCTION__: command === "build",
    },
    resolve: {
      alias: {
        "@": path.resolve(projectDir, "src"),
        "@assets": path.resolve(projectDir, "assets"),
        "@constants": path.resolve(projectDir, "src/constants"),
        "@components": path.resolve(projectDir, "src/components"),
        "@utils": path.resolve(projectDir, "src/utils"),
        "wna-logger": path.resolve(projectDir, "src/utils/logger.ts"),
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
