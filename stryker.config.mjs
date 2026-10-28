/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  // These outputs can change during other checks; local state and env files may contain secrets.
  ignorePatterns: [
    "test-results",
    "playwright-report",
    ".features-gen",
    "dist",
    ".output",
    ".tanstack",
    ".vitest",
    ".alchemy",
    ".terraform",
    "*.tfstate*",
    "*.tfplan",
    ".herenow",
    ".env",
    ".env.*",
  ],
  mutate: [
    "packages/infra/src/deployment.ts",
    "apps/web/src/server/config.server.ts",
    "packages/db/src/index.ts",
  ],
  // Runner 10.1.1 supports Vitest 5 per-test name filtering; 10.0.0 runs no tests for nested names.
  plugins: ["@stryker-mutator/vitest-runner"],
  testRunner: "vitest",
  vitest: { configFile: "vitest.mutation.config.ts" },
  coverageAnalysis: "perTest",
  reporters: ["clear-text", "progress", "html", "json"],
  htmlReporter: { fileName: "reports/mutation/mutation.html" },
  jsonReporter: { fileName: "reports/mutation/mutation.json" },
  incrementalFile: "reports/mutation/incremental.json",
  // Report the pilot score without imposing a merge threshold.
  thresholds: { break: 0 },
  concurrency: 2,
};
