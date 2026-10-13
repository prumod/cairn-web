# Testing

## Current test boundaries

The native Vitest configuration and `scripts/run-tests.mjs` define discovery and execution:

- Fast Vitest tests are colocated under `{web,backend,shared}/src/**/*.{spec,test}.{ts,tsx}` and under `{web,backend}/tests/{acceptance,typical}/integration/**/*.{spec,test}.{ts,tsx}`.
- Unit tests belong beside their production module and may import that module's private implementation. Non-unit acceptance/typical integration and e2e tests belong outside `src`.
- Playwright-BDD executes the approved contracts from root `features/`, with browser bindings under `web/tests/acceptance/e2e/`. The legacy browser feature location is removed.

Current coverage includes one colocated configuration unit test, 18 HTTP/PostgreSQL integration tests, and three root `features/` Playwright-BDD scenarios. The scenarios and controlled identities exercise real app/database behavior but do not validate Google's actual OAuth provider. Fresh OAuth and live deployment checks remain separate from these controlled tests.

## Running checks

Use the commands in the root `package.json` as the source of truth. `bun run test:fast` runs Vitest in an isolated PostgreSQL database; it starts a local PostgreSQL server when available, or accepts `TEST_DATABASE_URL` for a dedicated test server with `CREATEDB`. `bun run test:browser` runs the root Gherkin scenarios against a fixture Express server and disposable PostgreSQL; the fixture's private test identity endpoint exists only in the test server, not production. `bun run check` runs formatting, lint, boundaries, types, audit, tests, and builds. Full and fast agent checks also run `bun run check:blueprints` and the Blueprint policy tests. These local checks do not prove OAuth-provider or deployment configuration. GitHub Actions `Agent checks` runs on pull requests and pushes to `main` and `feat/63-company-profile`. The existing Render service's **After CI Checks Pass** setting was verified after reloading the Render page. This confirms the setting, not an end-to-end CI-gated deployment; verify the deployed revision after the workflow is published. Render does not deploy when it detects zero checks or any failing check; GitHub conclusions `success`, `neutral` and `skipped` count as passing. Agent gates are described in [Agent Git gates](docs/agents/checks.md).

## Blueprint checks and live evidence

`bun run check:blueprints` parses `render.yaml` and `deploy/render.production.template.yaml` with Bun's native YAML parser and checks the repository's closed deployment policy. The production template must retain `plan: __APPROVED_PRODUCTION_PLAN_REQUIRED__` until a non-Free plan is explicitly approved. The placeholder preserves the unresolved plan decision; local policy success is not provider validation. Do not submit the template until a non-Free plan is approved and provider validation is run. No paid tier is approved. `scripts/check-blueprints.test.mjs` exercises allowed and rejected policy cases; full and fast checks include these tests. This verifies local syntax and policy, not Render's complete schema, account permissions, resource adoption, branch availability or running services. Provider schema/Blueprint validation and an inspection of proposed actions remain separate gates before any authorized sync. See [Manage Render Blueprints](docs/how-to/manage-render-blueprints.md).

Historical testing deployment `0e3dd2d` at `https://cairn-testing.onrender.com` had readiness, real Google OAuth and profile persistence after reload checks. These observations are not a current deployment check. Blueprint adoption, production readiness and second-account approval/revocation still need separate evidence. No live operation is part of the local Blueprint check.

Tests describe observable behavior and system boundaries. Update relevant tests when those contracts change; test-file discovery and runnable commands remain defined by the package scripts, test configuration, and test runner.
