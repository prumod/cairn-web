# Project structure

This document distinguishes enforced module boundaries from the implemented application layout. Do not create empty directories just to match the tree.

## Application layout

```text
web/
  src/pages/<page>/             # frontend page capability
  src/shared/<module>/          # frontend-local reusable module
backend/
  src/modules/<domain>/         # backend domain capabilities
  src/shared/<module>/          # backend-local reusable module
shared/src/<module>/            # optional cross-application contracts/utilities
features/<capability>/<use-case>.feature   # root capability contracts
web/tests/{acceptance,typical}/{integration,e2e}/
backend/tests/{acceptance,typical}/{integration,e2e}/
```

### Module privacy

- Production files directly in a module root are its public entry points. Import other modules through those root files, never their nested implementation files.
- Every module subfolder is private; do not add a `lib/` convention or public barrels. Keep private helpers and implementation files below the module root.
- A module's own unit tests may import its private implementation. Unit tests are colocated with source as `*.spec.ts[x]` or `*.test.ts[x]`; production code cannot import tests, and tests of another module cannot import private implementation or tests.
- Non-unit acceptance/typical integration and e2e tests live outside `src`. Approved Gherkin capability contracts live at root `features/`.

## Current enforcement

The dependency-cruiser rules currently cover `web/src/pages`, `web/src/shared`, `backend/src/modules`, `backend/src/shared`, and `shared/src`. They reject cross-module private imports, test imports, frontend/backend coupling, dependencies from root shared into either app, dependencies from frontend shared into pages or backend shared into modules, cycles, and unresolved imports. They permit a module's own unit test to import its private production files. `bun run lint:boundaries` checks the repository graph; `bun run test:boundaries` checks representative allowed and rejected graphs.

Fast Vitest discovery includes colocated `web`, `backend`, and `shared` source tests plus `web`/`backend` integration tests under `tests/{acceptance,typical}/integration`. Playwright-BDD discovers root `features/**/*.feature` and bindings under `web/tests/acceptance/e2e`. Browser fixtures use real application routes and a disposable database; controlled Google-like identities use Better Auth test utilities and do not prove Google's OAuth provider. There is no database seed step. Current production modules include backend access and company-profile domains and frontend page modules; deployment and live OAuth remain unverified.
