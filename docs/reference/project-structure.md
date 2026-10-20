# Project structure

This reference describes the current Bun workspace and the enforced dependency boundaries. Do not create empty directories just to match this tree.

## Workspace layout

```text
apps/web/
  src/routes/                         # TanStack Start UI and server-handler routes
  src/pages/<page>/                   # client page capabilities
  src/shared/<module>/                # reusable client modules
  src/server/modules/<domain>/        # server access and company-profile capabilities
  src/server/shared/<module>/         # server-only support
  tests/acceptance/integration/       # HTTP/database integration tests
  tests/acceptance/e2e/               # Playwright-BDD step bindings
  dist/                               # generated Worker entry and client assets
packages/
  auth/src/                           # Better Auth and provider configuration
  db/src/                              # database client, schemas, and relations
  db/migrations/<timestamp_name>/     # Drizzle 1.0.0-rc.4 folder-based migrations
  infra/alchemy.run.ts                # Alchemy Cloudflare Website.Vite stack
  infra/src/deployment.ts             # validated dev/testing/production bindings and domains
  infra/test/alchemy.run.ts           # local acceptance Worker stack
  config/                             # workspace configuration package
shared/src/<module>/                  # optional runtime-independent cross-workspace code
features/<capability>/<use-case>.feature  # root Playwright-BDD contracts
```

The repository is a Bun workspace over `apps/*` and `packages/*`. `apps/web` is a TanStack Start application built for Cloudflare Workers. `packages/infra` uses Alchemy to run the app locally and declares a Cloudflare target; the test fixture separately serves the compiled Worker in `workerd`. `packages/db` uses Drizzle with the Neon serverless HTTP driver. `packages/auth` configures Better Auth and Google. These package roles describe code structure, not a verified cloud deployment.

Generated build output, `.alchemy`/`.tanstack` local state/cache, and generated environment types are ignored. Keep secrets in ignored local environment files. The tracked `.env.schema` files define safe environment inputs.

## Module privacy and dependency boundaries

For modules under `apps/web/src/pages`, `apps/web/src/shared`, `apps/web/src/server/modules`, `apps/web/src/server/shared`, and `shared/src`, production files at the module root are public entry points. Nested files are private. Other modules must import through the public entry point. A module's own colocated unit tests may import its private production files; other modules may not import private implementations or tests. Production code cannot import tests.

The dependency rules also enforce these workspace boundaries:

- Client pages/shared modules cannot import server-only app modules, server environment/services, `packages/auth`, `packages/db`, `packages/infra`, their `@cairn/auth`, `@cairn/db`, and `@cairn/infra` workspace specifiers, or Cloudflare runtime APIs.
- There is no current `packages/ui` workspace package. A reserved rule rejects server imports from that future client package shape, and synthetic boundary tests exercise it.
- Server modules cannot import client pages or shared UI modules.
- `shared/src` cannot depend on `apps/web` or application packages (`auth`, `db`, or `infra`); the rule also reserves the absent `ui` package path. Keep this code runtime-independent.
- Client shared modules cannot import page modules; server-shared modules cannot import domain modules.
- Circular dependencies and unresolved imports fail. The runtime-resolved `cloudflare:workers` import is the explicit unresolved-import exception.

`bun run lint:boundaries` scans the application source/tests, `packages/auth/src`, `packages/db/src`, Alchemy declarations/tests under `packages/infra` (including `packages/infra/src`), and `shared/src`. `.alchemy` generated cache/state is excluded. `bun run test:boundaries` proves allowed route-to-server and own-module test imports, and rejects representative private imports, workspace package imports from client code, cross-application shared dependencies, cycles, and unresolved imports. It also creates a temporary `packages/ui` client file to prove that the reserved UI boundary rejects server imports; the package is absent from the actual workspace. These checks enforce dependency shape, not runtime behavior or provider configuration.

## Test discovery

Vitest discovers colocated tests under `{apps/web,shared}/src/**/*.{spec,test}.{ts,tsx}` and `packages/*/src/**/*.{spec,test}.{ts,tsx}`. It also discovers integration tests under `apps/web/tests/{acceptance,typical}/integration/`. Playwright-BDD discovers root contracts under `features/company/` and `features/access/`, with bindings under `apps/web/tests/acceptance/e2e/`. Browser fixtures use the compiled Worker and disposable database/proxy pair. Controlled Google-like identities do not prove Google's OAuth provider. See [Testing](../../TESTING.md) for commands and current evidence limits.
