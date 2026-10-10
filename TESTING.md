# Testing

## Current test boundaries

The native Vitest configuration and `scripts/run-tests.mjs` define discovery and execution:

- Fast Vitest tests are colocated under `{web,backend,shared}/src/**/*.{spec,test}.{ts,tsx}` and under `{web,backend}/tests/{acceptance,typical}/integration/**/*.{spec,test}.{ts,tsx}`.
- Unit tests belong beside their production module and may import that module's private implementation. Non-unit acceptance/typical integration and e2e tests belong outside `src`.
- Playwright-BDD executes the approved contracts from root `features/`, with browser bindings under `web/tests/acceptance/e2e/`. The legacy browser feature location is removed.

Current coverage includes one colocated configuration unit test, 18 HTTP/PostgreSQL integration tests, and three root `features/` Playwright-BDD scenarios. The scenarios and controlled identities exercise real app/database behavior but do not validate Google's actual OAuth provider. OAuth and live deployment still require separate manual verification.

## Running checks

Use the commands in the root `package.json` as the source of truth. `bun run test:fast` runs Vitest in an isolated PostgreSQL database; it starts a local PostgreSQL server when available, or accepts `TEST_DATABASE_URL` for a dedicated test server with `CREATEDB`. `bun run test:browser` runs the root Gherkin scenarios against a fixture Express server and disposable PostgreSQL; the fixture's private test identity endpoint exists only in the test server, not production. `bun run check` runs formatting, lint, boundaries, types, audit, tests, and builds. These local checks do not prove OAuth-provider or deployment configuration. Agent gates are described in [Agent Git gates](docs/agents/checks.md).

Tests describe observable behavior and system boundaries. Update relevant tests when those contracts change; test-file discovery and runnable commands remain defined by the package scripts, test configuration, and test runner.
