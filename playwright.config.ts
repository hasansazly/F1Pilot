import { defineConfig } from "@playwright/test";
process.env.PLAYWRIGHT_BROWSERS_PATH ||= "./.playwright-browsers";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
  reporter: "list",
});
