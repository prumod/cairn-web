import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

export default defineConfig({
  testDir: defineBddConfig({
    features: "tests/browser/**/*.feature",
    steps: "tests/browser/**/*.steps.ts",
    outputDir: ".features-gen",
    missingSteps: "fail-on-gen",
  }),
  forbidOnly: true,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
