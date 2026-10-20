import { defineConfig } from "vitest/config";

export default defineConfig({
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
