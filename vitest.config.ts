import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    hookTimeout: 35_000,
    testTimeout: 15_000,
    include: [
      "{web,shared}/src/**/*.{spec,test}.{ts,tsx}",
      "web/tests/{acceptance,typical}/integration/**/*.{spec,test}.{ts,tsx}",
    ],
    allowOnly: false,
  },
});
