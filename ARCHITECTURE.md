# Architecture

## Current system

Cairn is a Bun workspace. `apps/web` is a React and TanStack Start application built with Vite for the Cloudflare Workers runtime. The build emits the Worker entry and static client assets under `apps/web/dist`; the Worker uses the `nodejs_compat` compatibility flag. The root `bun run dev` command starts the Alchemy development stack, which serves the application locally on a Worker runtime. This is not a Node/Nitro or Express server.

The root workspace contains these application packages:

- `packages/infra` declares the Alchemy Cloudflare `Website.Vite` resource and local development stack. Its configured local state is not evidence of remote state or cloud provisioning.
- `packages/db` provides Drizzle schemas, migrations, and the Neon serverless HTTP database client. Migration files are generated in Drizzle Kit 1.0.0-rc.4's folder-based format under `packages/db/migrations/`; run `bun run db:migrate` to apply them to the configured `DATABASE_URL`.
- `packages/auth` configures Better Auth with the Drizzle adapter and Google social sign-in.
- `packages/config` contains workspace tooling configuration. UI code remains in the application; there is no separate `packages/ui` package.

TanStack Start owns UI and server routes in `apps/web/src/routes/`. Client pages and reusable client modules live in `apps/web/src/pages/` and `apps/web/src/shared/`. Server modules handle access and the company profile; `apps/web/src/server/shared/` and `apps/web/src/services.ts` provide server-side support. Database access uses the Neon HTTP driver rather than a direct PostgreSQL wire connection.

A verified Google identity matching `BOOTSTRAP_ADMIN_EMAIL` receives administrator access on its first protected request. Other users need administrator approval. Protected handlers recheck access against the database, so revocation applies to existing sessions. The company profile has one record with a non-empty name and address and a positive finite radius. Writes require a same-origin request. `/healthz` checks database connectivity. There is no seed step.

## Test runtime

Local acceptance tests build the production Worker and client assets, then run the compiled application in a test-only Alchemy `Cloudflare.Worker` stack. That stack uses local Alchemy state and `workerd`; it is not a cloud deployment. `scripts/with-test-postgres.mjs` starts disposable Docker Compose services for PostgreSQL 18.6 and a pinned Neon HTTP proxy. Test support creates isolated databases, applies the committed migrations through the Neon HTTP driver, and tears down the Worker, proxy, databases, and Compose project. Browser-controlled identities are provided by a test-only proxy outside the application; this does not exercise Google OAuth.

See [Testing](TESTING.md) for commands, latest verification, and limits.

## Enforced module boundaries

The dependency-cruiser configuration enforces public-entry-only imports and private nested implementation paths for modules under `apps/web/src/pages`, `apps/web/src/shared`, `apps/web/src/server/modules`, `apps/web/src/server/shared`, and `shared/src`. A module may use its own private implementation in its colocated unit tests; other modules cannot import that implementation or its tests. Production code cannot import tests.

Client pages/shared modules cannot import server-only modules, environment/services, `packages/auth`, `packages/db`, `packages/infra`, their `@cairn/*` workspace specifiers, or Cloudflare runtime APIs. The same prohibition is reserved for a future `packages/ui` path; no such package currently exists, and the synthetic boundary proof exercises that case. Server modules cannot import client pages/shared modules. `shared/src` cannot depend on the application or its packages, including the reserved UI package path. Client shared code cannot import pages, and server-shared code cannot import domain modules. Circular and unresolved imports are rejected except the runtime-resolved `cloudflare:workers` module.

`bun run lint:boundaries` scans application, package, infrastructure declaration/test, and shared source paths. `bun run test:boundaries` exercises accepted and rejected imports, including workspace package imports. These checks enforce dependency shape; they do not prove application behavior, OAuth, or deployment correctness. See [Project structure](docs/reference/project-structure.md).

## Deployment and verification limits

`packages/infra/alchemy.run.ts` defines an Alchemy Cloudflare `Website.Vite` stack and scripts for local development and deployment stages. `packages/infra/test/alchemy.run.ts` defines the local acceptance Worker. No external Cloudflare provisioning, remote Alchemy state, cloud deployment, Google OAuth login, or production operation has been verified for this migration. Code and local tests do not establish production readiness. A cloud cutover needs separate authorization and validation of provider state, secrets, database/migrations, OAuth, CI/security gates, and live behavior for the exact revision.

`render.yaml`, `deploy/render.production.template.yaml`, and existing Render workflows/gates remain from the previous runtime. They do not deploy or validate the current Workers application. Their presence or historical results are not evidence for this migration; do not treat Render or production as ready.

## Change contracts

- Keep UI and route code in `apps/web/src/`, server capabilities in `apps/web/src/server/`, and cross-workspace contracts in `shared/src/` only when they do not depend on application packages.
- Keep Better Auth configuration in `packages/auth`, database schema/client/migrations in `packages/db`, and Cloudflare/Alchemy declarations in `packages/infra`.
- Do not add a parallel Node/Express runtime or import server-only packages into client code.
- For test commands and evidence limits, see [Testing](TESTING.md).
