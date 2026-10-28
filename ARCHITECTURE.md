# Architecture

## Current system

Cairn is a Bun workspace. `apps/web` is a React and TanStack Start application built with Vite for the Cloudflare Workers runtime. The build emits the Worker entry and static client assets under `apps/web/dist`; the Worker uses the `nodejs_compat` compatibility flag. The root `bun run dev` command starts the Alchemy development stack, which serves the application locally on a Worker runtime. This is not a Node/Nitro or Express server.

The root workspace contains these application packages:

- `packages/infra` declares the Alchemy `Cloudflare.Website.Vite` resource, the per-stage Neon project and generated auth secret for cloud stages, and the local development stack. Its configured local state is not evidence of remote state or cloud provisioning.
- `packages/db` provides Drizzle schemas, migrations, and the Neon serverless HTTP database client. Migration files are generated in Drizzle Kit 1.0.0-rc.4's folder-based format under `packages/db/migrations/`; `bun run db:migrate` applies them to the local `DATABASE_URL`, and `Neon.Project` applies them to cloud-stage databases on every deploy (see [Deployment and verification limits](#deployment-and-verification-limits)).
- `packages/auth` configures Better Auth with the Drizzle adapter and Google social sign-in.
- `packages/config` contains workspace tooling configuration. UI code remains in the application; there is no separate `packages/ui` package.

TanStack Start owns UI and server routes in `apps/web/src/routes/`. Client pages and reusable client modules live in `apps/web/src/pages/` and `apps/web/src/shared/`. Server modules handle access and the company profile; `apps/web/src/server/shared/` and `apps/web/src/services.ts` provide server-side support. Database access uses the Neon HTTP driver rather than a direct PostgreSQL wire connection.

A verified Google identity matching `BOOTSTRAP_ADMIN_EMAIL` receives administrator access on its first protected request. Other users need administrator approval. Protected handlers recheck access against the database, so revocation applies to existing sessions. The company profile has one record with a non-empty name and address and a positive finite radius. Writes require a same-origin request. `packages/infra/src/deployment.ts` validates the main Alchemy stack configuration: local development is supported only at stage `dev`, with no custom domain, `workersDev` unset for the local runtime, `APP_ENV=development`, and revision `local`. Deployed stages are only `testing` and `production`; they map respectively to `cairn-testing.prumod.eu` and `cairn.prumod.eu`, both with `APP_ENV=production`, a required full 40-character lowercase hexadecimal `GIT_SHA`, `workersDev: false`, and `managed: true` (Alchemy owns the database and auth secret). This configures those stages for their custom domains only and disables stable `workers.dev` URLs and per-version preview URLs. The separate acceptance-only Alchemy stack supplies `APP_ENV=test`. Unsupported stages and development-mode/stage mismatches fail validation. `Alchemy.Stage` selects the stage, `Cloudflare.Website.Vite` receives the configured domain, and `Cloudflare.Worker.URL` supplies `APP_ORIGIN` and `BETTER_AUTH_URL`. Production requires an HTTPS application origin; this check is independent of Vite's build-time `NODE_ENV`. A trusted deployment process must supply the actual deployed commit; input validation alone does not attest to the running code. `/healthz` checks database connectivity and reports the Worker's `GIT_SHA` binding as `revision`. There is no seed step.

## Observability

`packages/infra/alchemy.run.ts` explicitly enables Worker observability, logs (including invocation logs), and traces. Logs and traces each use `headSamplingRate: 1`. This declares full head sampling, not a verified ingestion rate, retention period, or cost limit. There is no application OpenTelemetry exporter or automatic PostHog-to-Cloudflare trace link.

Alchemy supplies `DEPLOYMENT_STAGE` separately from `APP_ENV`: both hosted stages use `APP_ENV=production`, but only `DEPLOYMENT_STAGE=production` exposes browser analytics. `GET /api/analytics-config` returns only the public write-only project token and `https://eu.i.posthog.com`, or `null` when the stage is not production or the token is absent. Alchemy requires non-empty `POSTHOG_PROJECT_TOKEN` for production and supplies an empty token elsewhere; the acceptance stack uses stage `test` and an empty token. The token is supplied through ignored local configuration or the process environment, never committed. It is not a personal API key and grants no query access. The browser additionally validates the token's `phc_` format and the exact EU host before lazily loading `posthog-js`.

The browser disables autocapture, automatic pageview/pageleave, automatic exception capture, performance capture, and replay console capture. Replay configuration masks all text (`maskTextSelector: "*"`), inputs, and element attributes; blocks hidden/file inputs, images, video, and canvas; and disables request body/header recording. Captured network names are reduced to their origin. Non-snapshot event properties with URL, referrer, referring-domain, pathname, or search names are removed, including inside `$set` and `$set_once`; snapshots use the replay masking configuration instead. These are configured protections, not evidence from inspecting a live recording.

Explicit events are `company_profile_viewed`, `company_profile_save_attempted`, `company_profile_save_succeeded`, and `company_profile_save_failed`. Failure properties contain only HTTP `status` when available and a UUID-shaped `request_id` when available. Profile names, addresses, and radius values are not event properties. After `/api/me`, identification uses the opaque internal user ID without email or name traits. PostHog identity is held in memory and reset on logout or a confirmed missing session; a generation check prevents pending initialization from identifying a user after reset. Analytics failures do not interrupt application actions. Custom browser error listeners send generic errors with sanitized stacks; a same-origin `/assets/*.js` filename may include line/column metadata, without its query string or original error message.

Application handlers wrapped by `handleRequest` return `Cache-Control: no-store` and a generated `X-Request-ID`. Unexpected failures emit `request_failed` with `operation`, `requestId`, `revision`, `durationMs`, allowlisted `errorType`, and up to five recognized stack frames containing function name, basename, line, and column. Raw messages, request bodies, headers, and full stack paths are omitted by this application logger. This does not assert redaction of every platform invocation log. Expected denials returned as responses do not emit `request_failed`; invalid JSON returns 400 without an error log. `/healthz` returns 200 with revision after `SELECT 1`; a database execution failure is logged and returns 503, while runtime/configuration initialization failures return 500. Structured application errors have no stage field: select the stage's Worker first, then filter by revision and request ID. The browser API client retains `X-Request-ID` on `ApiError` to correlate failed profile saves with the server log; platform traces require a separate lookup.

Source-map generation/upload, provider-side ingestion, actual replay masking, and live event/log/trace correlation for this working-tree change remain unverified. See [Investigate an application failure](docs/how-to/investigate-application-failure.md) for the bounded diagnostic procedure.

## Test runtime

Local acceptance tests build the production Worker and client assets, then run the compiled application in a test-only Alchemy `Cloudflare.Worker` stack. That stack uses local Alchemy state and `workerd`; it is not a cloud deployment. `scripts/with-test-postgres.mjs` starts disposable Docker Compose services for PostgreSQL 18.6 and a pinned Neon HTTP proxy. Test support creates isolated databases, applies the committed migrations through the Neon HTTP driver, and tears down the Worker, proxy, databases, and Compose project. Browser-controlled identities are provided by a test-only proxy outside the application; this does not exercise Google OAuth.

See [Testing](TESTING.md) for commands, latest verification, and limits.

## Enforced module boundaries

The dependency-cruiser configuration enforces public-entry-only imports and private nested implementation paths for modules under `apps/web/src/pages`, `apps/web/src/shared`, `apps/web/src/server/modules`, `apps/web/src/server/shared`, and `shared/src`. A module may use its own private implementation in its colocated unit tests; other modules cannot import that implementation or its tests. Production code cannot import tests.

Client pages/shared modules cannot import server-only modules, environment/services, `packages/auth`, `packages/db`, `packages/infra`, their `@cairn/*` workspace specifiers, or Cloudflare runtime APIs. The same prohibition is reserved for a future `packages/ui` path; no such package currently exists, and the synthetic boundary proof exercises that case. Server modules cannot import client pages/shared modules. `shared/src` cannot depend on the application or its packages, including the reserved UI package path. Client shared code cannot import pages, and server-shared code cannot import domain modules. Circular and unresolved imports are rejected except the runtime-resolved `cloudflare:workers` module. The rules apply to type-only imports too; only the circular-import rule ignores cycles made entirely of type-only imports, such as TanStack Router's generated route tree importing the router type.

`bun run lint:boundaries` scans application, package, infrastructure declaration/test, and shared source paths. `bun run test:boundaries` exercises accepted and rejected imports, including workspace package imports. These checks enforce dependency shape; they do not prove application behavior, OAuth, or deployment correctness. See [Project structure](docs/reference/project-structure.md).

## Deployment and verification limits

`packages/infra/alchemy.run.ts` defines an Alchemy Cloudflare `Website.Vite` stack and a Neon provider; `packages/infra/package.json` exposes `dev`, `deploy:testing`, `deploy:production`, `destroy:testing`, and `destroy:production`, with no implicit production deploy/destroy aliases.

Cloud stages (`testing`, `production`) are fully provisioned by Alchemy:

- Each stage declares a `Neon.Project` named `database` in `aws-eu-central-1` (Frankfurt). On every deploy, `Neon.Project` applies the SQL in `packages/db/migrations/`; on the first deploy, Alchemy takes over drizzle-kit's migration history.
- The Worker's `DATABASE_URL` is that project's pooled connection URI, passed as a Worker secret. No one copies it by hand.
- `BETTER_AUTH_SECRET` is generated by `Alchemy.makeRandom` and persisted in Alchemy state.
- A human supplies `NEON_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BOOTSTRAP_ADMIN_EMAIL`, `GIT_SHA`, Cloudflare authorization for Alchemy, and `POSTHOG_PROJECT_TOKEN` for production.

The `dev` stage is unchanged: `DATABASE_URL` and `BETTER_AUTH_SECRET` come from the environment through varlock.

Two steps cannot be expressed as infrastructure code and stay manual: creating the Google OAuth Web client per environment in Google Cloud Console (no known API creates a standard Web client; unconfirmed), and the registrar nameserver/DNSSEC DS change at Spaceship.

Alchemy state is local (`Alchemy.localState()`, `.alchemy`). Remote state is not enabled, so only the machine holding `.alchemy` can update or destroy the stack. If that state is lost, the deployed resources and the generated auth secret cannot be recovered through Alchemy.

The [deployment guide](docs/how-to/run-company-profile.md#verification-and-deployment-limits) records earlier live checks at revision `100ae4e3b91fe1b054c84793616d822a83707b97`. Those observations do not verify the current working-tree observability changes, their deployment, or the final checks for this change. Do not run deploy/destroy without separate explicit approval and isolated inputs. Code and local tests do not establish production readiness. A cloud cutover needs separate authorization and validation of provider state, migrations, OAuth, CI/security gates, and live behavior for the exact revision.

## Transcription documentation automation

`.github/workflows/agent-incorporate-transcription.yml` runs on manual dispatch and after a PR into `main` is merged with the `transcription` label (a new source) or `agent-incorporate-transcription` label (the loop's own PR). `scripts/transcriptions-pending.mjs` selects the oldest source transcription not linked from `docs/product/now/funcionalidades.md`; the workflow skips when none is pending or while a loop PR is open. A manual run checks out the selected branch, while a merged-PR run checks out `main`. Claude Code follows `.agents/skills/incorporate-transcription/SKILL.md` and is instructed to edit only `docs/product/` and `apps/web/references/interactive-wireframe.tsx`. The workflow checks that the selected source is linked, enforces this file scope, and runs formatting, lint, and type checks before opening a labelled PR. It uses `CLAUDE_CODE_OAUTH_TOKEN` to authenticate Claude Code and `AGENT_PR_TOKEN` to push and open the PR; `GITHUB_TOKEN` PRs do not trigger the required `Agent checks`. Merging the loop PR starts another run for the next pending source. This describes configured workflow behavior; the first successful run remains unverified.

## Change contracts

- Keep UI and route code in `apps/web/src/`, server capabilities in `apps/web/src/server/`, and cross-workspace contracts in `shared/src/` only when they do not depend on application packages.
- Keep Better Auth configuration in `packages/auth`, database schema/client/migrations in `packages/db`, and Cloudflare/Alchemy declarations in `packages/infra`.
- Do not add a parallel Node/Express runtime or import server-only packages into client code.
- For test commands and evidence limits, see [Testing](TESTING.md).
