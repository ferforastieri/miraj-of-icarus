import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  reporter: "line",
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/support/fake-api.mjs",
      url: "http://127.0.0.1:18080/health",
      reuseExistingServer: true,
    },
    {
      command: "MIRAJ_OF_ICARUS_API_INTERNAL_URL=http://127.0.0.1:18080 npm run dev -- --port 3100",
      url: "http://127.0.0.1:3100/api/health",
      reuseExistingServer: true,
    },
  ],
  projects: [
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet-768", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "mobile-390", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
});
