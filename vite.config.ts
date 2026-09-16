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

function serviceWorkerRegistration(command: "build" | "serve"): Plugin {
  // The service worker's own fetch handler caches every asset it sees
  // cache-first, forever, keyed by request URL -- and `vite dev` serves
  // modules from stable, unhashed source paths (no per-build fingerprint
  // the way a production bundle has). Registering it during local
  // development means the very first page load poisons the browser with
  // a permanent cache of that moment's code: every later `npm run web`
  // restart keeps serving those exact same stale files under the same
  // URLs, no matter what actually changed on disk, until the cache is
  // cleared by hand. Production builds are unaffected -- there, the
  // asset URLs really do change on every deploy.
  const enabled = command === "build" ? "true" : "false";

  return {
    name: "wna-service-worker-registration",
    transformIndexHtml(html) {
      return html.replace("%WNA_ENABLE_SERVICE_WORKER%", enabled);
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      versionedBackgroundPreload(env.EXPO_PUBLIC_DEPLOY_VERSION),
      serviceWorkerRegistration(command),
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
