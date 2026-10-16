import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

export default defineConfig({
  testDir: defineBddConfig({
    features: "features/deployed/**/*.feature",
    steps: "web/tests/acceptance/deployed/**/*.steps.ts",
    outputDir: ".features-gen",
  }),
  forbidOnly: true,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: "list",
  outputDir: "test-results/deployed",
  use: {
    actionTimeout: 10_000,
    baseURL: "https://cairn-testing.onrender.com",
    navigationTimeout: 15_000,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
