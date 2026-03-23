import { defineConfig, devices } from "@playwright/test";

const port = 3000;

export default defineConfig({
  testDir: "./tests/e2e/specs",
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "desktop-landscape",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1100 },
      },
      testIgnore: /.*\.mobile\.spec\.ts$/,
    },
    {
      name: "mobile-portrait",
      use: {
        ...devices["Pixel 5"],
      },
      testMatch: /.*\.mobile\.spec\.ts$/,
    },
  ],
  webServer: {
    command: `bash ./scripts/start-e2e-web.sh ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 180000,
  },
});
