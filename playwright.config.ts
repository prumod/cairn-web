import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

export default defineConfig({
  testDir: defineBddConfig({
    features: "features/**/*.feature",
    steps: "web/tests/acceptance/e2e/**/*.steps.ts",
    outputDir: ".features-gen",
    missingSteps: "fail-on-gen",
  }),
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "exec node scripts/with-test-postgres.mjs node --import tsx backend/tests/acceptance/e2e/server.ts",
    gracefulShutdown: { signal: "SIGTERM", timeout: 10000 },
    env: { NODE_ENV: "test", TEST_IDENTITY_KEY: "isolated-local-browser-test" },
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
