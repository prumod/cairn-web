# Testing

## Test boundaries

The native test configuration and `scripts/run-tests.mjs` define which files are discovered and how each suite runs:

- Unit tests are direct Vitest tests under `tests/unit/**/*.test.ts`.
- Behavior features under `tests/behavior/**/*.feature` use a same-path `.test.ts` binding with `loadFeature` and `describeFeature` from `@amiceli/vitest-cucumber`.
- Browser scenarios under `tests/browser/**/*.feature` use `*.steps.ts` bindings with `createBdd` from `playwright-bdd`. Playwright generates and runs the scenarios against the built app, served on port 4173.

The test suites are currently empty. Their explicit skip notices mean no behavior was verified; they are not passing evidence. Missing behavior bindings and test generation, configuration, or execution errors are failures once tests exist.

## Running checks

Use the commands in the root `package.json` as the source of truth for available commands. `bun run test:fast` runs the non-browser suites; `bun run test:browser` runs browser scenarios. The full project check includes formatting, linting, typechecking, tests, and build. Agent commit and push gates are described in [Agent Git gates](docs/agents/checks.md).

Tests describe observable behavior and system boundaries. Update relevant tests when those contracts change; test-file discovery and runnable commands remain defined by the package scripts, test configuration, and test runner.
