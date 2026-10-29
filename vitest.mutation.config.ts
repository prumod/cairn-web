import { defineConfig } from "vitest/config";

// These tests import source directly. Built Worker and browser suites cannot observe
// Stryker's instrumented modules and must stay in the existing test configuration.
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/infra/src/deployment.test.ts",
      "apps/web/src/server/config.server.spec.ts",
      "apps/web/src/server/shared/observability/observability.spec.ts",
      "packages/db/src/index.spec.ts",
    ],
    allowOnly: false,
  },
});
