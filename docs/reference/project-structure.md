# Project structure

This reference describes the TanStack Start application layout and the import boundaries enforced by `dependency-cruiser`. Do not create empty directories just to match the tree.

## Application layout

```text
web/
  src/pages/<page>/                 # client page capabilities
  src/shared/<module>/              # client-side reusable modules
  src/routes/                       # TanStack Start UI and server-handler routes
  src/server/
    application.server.ts            # server-side application use cases and HTTP behavior
    modules/<domain>/                # server access and company-profile capabilities
    shared/<module>/                 # auth, database, and other server-only support
  migrations/                        # committed SQL migrations and Drizzle metadata
  tests/acceptance/integration/      # HTTP/PostgreSQL integration tests
  tests/acceptance/e2e/              # Playwright-BDD step bindings
  references/                        # reference wireframe and its standalone viewer
shared/src/<module>/                 # optional cross-repository contracts/utilities
features/<capability>/<use-case>.feature  # root capability contracts
```

There is one application workspace: `web/`. The Node server is built by Nitro from TanStack Start; Express and a separate backend workspace are not part of the current application. Start route files bind UI and API paths to the client or to a `server.handlers` function. Keep database access, authentication, authorization, and domain operations on the server side.

`web/references/` holds the reference wireframe and its standalone Vite viewer (`bun run wireframe`; `wireframe:build` in `web` writes git-ignored `web/.wireframe-dist/`). It is outside the application build and `web/src`, so TanStack Start does not route it and dependency-cruiser boundaries do not cover it.

## Module privacy

- Production files directly in a module root are its public entry points. Import other modules through those root files, never their nested implementation files.
- Every module subfolder is private; do not add a `lib/` convention or public barrels. Keep private helpers and persistence implementations below the module root.
- A module's own unit tests may import its private implementation. Unit tests are colocated with source as `*.spec.ts[x]` or `*.test.ts[x]`; production code cannot import tests, and tests of another module cannot import private implementation or tests.
- Non-unit acceptance/typical integration and E2E tests live outside `src`. Approved Gherkin capability contracts live at root `features/`.
- Route files may import the server-side application entry point to declare TanStack Start handlers. Client page and shared UI modules must not import server modules.

## Current enforcement

The dependency-cruiser rules cover `web/src/pages`, `web/src/shared`, `web/src/server/modules`, `web/src/server/shared`, and optional `shared/src`. They reject cross-module private imports, test imports, client/server coupling, dependencies from root shared into the application, dependencies from client shared code into pages, dependencies from server shared code into domain modules, cycles, and unresolved imports. They permit a module's own unit test to import its private production files. `bun run lint:boundaries` checks the repository graph; `bun run test:boundaries` checks representative allowed and rejected graphs.

Fast Vitest discovery includes colocated `web` and optional `shared` source tests plus `web/tests/{acceptance,typical}/integration`. Playwright-BDD discovers root `features/**/*.feature` and bindings under `web/tests/acceptance/e2e`. Browser fixtures use the built Start server and a disposable database. Controlled Google-like identities are created through a test-only proxy outside the application; they do not prove Google's OAuth provider. There is no database seed step. See [Testing](../../TESTING.md) for commands and evidence limits.
