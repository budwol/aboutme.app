import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/security",
  reporter: "list",
  use: {
    baseURL: process.env.SECURITY_BASE_URL ?? "http://127.0.0.1:5111",
  },
});
