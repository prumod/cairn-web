import { defineConfig } from "vitest/config";
import { gherkinFeaturePlugin } from "vitest-cucumber-context-mapper/vite";

export default defineConfig({
  plugins: [gherkinFeaturePlugin()],
  test: {
    environment: "node",
    fileParallelism: false,
    hookTimeout: 240_000,
    testTimeout: 15_000,
    include: [
      "{apps/web,shared}/src/**/*.{spec,test}.{ts,tsx}",
      "packages/*/src/**/*.{spec,test}.{ts,tsx}",
      "apps/web/tests/{acceptance,typical}/integration/**/*.{spec,test}.{ts,tsx}",
    ],
    allowOnly: false,
  },
});
