# Run the company profile locally

This guide runs the full-stack app through the local Alchemy development stack and Cloudflare Workers runtime. It does not deploy the app to Cloudflare. Local development needs a Neon-compatible HTTP database URL and private authentication values. Do not reuse testing/production credentials or data.

## Configure local values

On a new machine, the `setup-project` wizard (see the README) already does this: it starts the local development database from `compose.dev.yaml`, applies the migrations, and writes `packages/infra/.env.local` with `DATABASE_URL` (the local Neon HTTP proxy), a generated `BETTER_AUTH_SECRET`, and `BOOTSTRAP_ADMIN_EMAIL` taken from `git config user.email`. Only `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` remain, because Google offers no way to create the OAuth client by script. Follow the steps below to configure a machine by hand or to use a different database.

Install the locked workspace dependencies and tools from the repository root:

```sh
bun run setup
bun run env:generate
```

Provide these variables through your local environment or an ignored local environment file consumed by Varlock:

```dotenv
DATABASE_URL=postgres://... # Neon serverless HTTP connection URL
BETTER_AUTH_SECRET=...     # at least 32 random characters
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BOOTSTRAP_ADMIN_EMAIL=your-verified-google-email@example.com
NODE_ENV=development
```

The local Alchemy stack supplies the app origin and Better Auth URL from its Worker URL. Do not commit `.env` files or generated `env.ts` files. The committed `.env.schema` files are safe templates, not credential stores.

If you want to try Google sign-in locally, configure a local-only Google OAuth web client for `http://localhost:3001` and the callback `http://localhost:3001/api/auth/callback/google`. Keep the client secret private. Live Google sign-in and sign-out have been verified on both cloud stages; this local-only client remains a separate configuration.

## Apply migrations and start the app

Use a development database that you control. Apply the committed Drizzle migrations, then start the local Worker stack:

```sh
bun run db:migrate
bun run dev
```

With the wizard's database, run `bun run dev:db` instead of `bun run db:migrate`. It starts the Compose services if they are stopped and applies pending migrations, so run it again after you pull new migrations. `db:migrate` talks the PostgreSQL protocol, so it cannot use the Neon HTTP proxy URL that `.env.local` holds; `dev:db` passes the direct PostgreSQL URL (`127.0.0.1:54320`).

Open `http://localhost:3001`. The root `bun run dev` command starts `packages/infra`'s Alchemy development stage and the TanStack Start app in the local Workers runtime. Standalone Vite dev/preview is not supported; use the Worker stack. The app's database client uses Neon HTTP; a plain PostgreSQL URL is not a substitute for the HTTP endpoint expected by the app.

The first protected request from a verified Google identity matching `BOOTSTRAP_ADMIN_EMAIL` initializes administrator access. Other users need administrator approval. Pending users cannot access company data, and protected requests check current access against the database. There is no seed command.

## Run local tests

Tests use a separate disposable environment. Docker Compose starts a temporary PostgreSQL 18.6 container and the pinned local Neon HTTP proxy; the test fixture builds the app, runs it in `workerd`, creates isolated test databases, and cleans up its containers. Browser tests use Chromium and controlled identities through an external test-only proxy. They do not use your local OAuth credentials or exercise Google's OAuth flow; live Google OAuth was verified separately on both cloud stages as recorded below.

```sh
bun run test:fast
bun run test:browser
```

For test boundaries and the current verification status, see [Testing](../../TESTING.md).

## Cloud stages

The `testing` and `production` stages are provisioned by Alchemy, not by hand. Each stage gets its own `Neon.Project` named `database` in `aws-eu-central-1` (Frankfurt). `Neon.Project` applies `packages/db/migrations/` on every deploy; on the first deploy, Alchemy takes over drizzle-kit's migration history. The Worker receives the project's pooled connection URI as a secret `DATABASE_URL`, and a generated `BETTER_AUTH_SECRET` that Alchemy keeps in its state. Do not create a Neon database or copy a `DATABASE_URL` for these stages. `bun run db:migrate` is only for the local `dev` database.

Neon Free caps history retention at `21600` seconds (6 hours). `packages/infra/alchemy.run.ts` sets `historyRetentionSeconds: 21600` because Alchemy's default of 86400 seconds (24 hours) is rejected by Neon Free and the project create request fails. A failed request can leave an orphan Neon project outside Alchemy's local state; inspect the Neon console or API and delete that project manually. On 2026-10-22, both deployed environments had their own Neon project in `aws-eu-central-1`, on the Neon organization Free plan ($0/month), with `21600`-second history retention. Free-plan eligibility was verified for both projects.

The infra `.env.schema` marks imported `DATABASE_URL` and `BETTER_AUTH_SECRET` as optional, so loading infra configuration for cloud stages does not need either value. The `dev` stack still reads both through `Config.Redacted` and fails if either is missing.

Alchemy reads the Worker `domain` and `workersDev` props before resolving Effect-valued props. `alchemy.run.ts` therefore resolves `deploymentConfig` inside the stack Effect and passes plain values. Passing Effect values for these props makes deployment fail with `Cloudflare zone not found for undefined`.

### Configure the testing pipeline

1. Bootstrap the Cloudflare state store once from `packages/infra` with `alchemy provider cloudflare bootstrap`. The store is named `alchemy-state-store`. Its state is encrypted. Its token and encryption key are held in the account's Secrets Store. Preserve the existing testing state when switching stores; an empty store can propose duplicate resources.
2. Create the GitHub environment `testing`. Allow deployments only from `main`.
3. Add the environment secrets `CLOUDFLARE_API_TOKEN`, `NEON_API_KEY`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. Add the environment variables `CLOUDFLARE_ACCOUNT_ID` and `BOOTSTRAP_ADMIN_EMAIL`.
4. Give the CI Cloudflare API token Workers scripts edit, Secrets Store edit, and Zone DNS edit permissions. Scope it to the account and the `prumod.eu` zone. Keep all values private.
5. Use the testing Google OAuth Web client with redirect URI `https://cairn-testing.prumod.eu/api/auth/callback/google`. Configure that client in Google Cloud Console. Registrar nameserver and DNSSEC DS changes remain manual at Spaceship.

Do not supply `DATABASE_URL` or `BETTER_AUTH_SECRET` to CI. Alchemy owns the testing database and generated auth secret. Use the testing project's scoped `NEON_API_KEY` for routine updates. Creating a Neon project requires an appropriate organization key. Do not print credentials or state contents in logs or reports.

### Operate the testing pipeline

1. Push the intended commit to `main` through the repository contribution workflow. This starts `Agent checks` in `.github/workflows/checks.yml`.
2. After `Agent checks` succeeds on `main`, inspect `Deploy testing` in `.github/workflows/deploy.yml`. It starts automatically, with no manual step, in the GitHub environment `testing`.
3. Inspect the deployment result. The workflow supplies the deployed commit SHA and runs `bun run --cwd packages/infra deploy:testing`.
4. Inspect the health check result. The workflow polls `https://cairn-testing.prumod.eu/healthz` until `revision` equals the deployed commit SHA.

A successful check run alone does not establish a successful deployment. Confirm the `Deploy testing` run result and the `/healthz` revision for the same commit.

### Configure observability inputs

Alchemy sets `DEPLOYMENT_STAGE` to its selected stage. Both hosted stages set `APP_ENV=production`; only `DEPLOYMENT_STAGE=production` enables PostHog. Do not override the stage binding to test capture on testing. The development and acceptance stacks disable browser capture. The production stack requires a non-empty `POSTHOG_PROJECT_TOKEN`; the browser accepts only a `phc_` token and `https://eu.i.posthog.com`. Obtain the project's public write-only token from the intended EU project; no token value or external project ID is prescribed by this guide. Account/project provisioning and query credentials are separate from this binding.

The Worker declaration explicitly enables invocation logs, application logs, and traces, with log and trace head sampling set to `1`. These settings do not establish free-tier usage. On 2026-10-28, testing ran merged revision `ee24e21ea46428d32d18e15006f5b011050f2b23`; `/healthz` returned `ready` with that revision, and `/api/analytics-config` returned `null`, as intended for testing. A native Cloudflare REST query found events and traces for testing health requests. A pre-merge production replay showed masked page text, but does not verify the merged build. Production was still on revision `5ff1cf43fbaaff790a1d959631947424c73a27fb`; the production deployment of the merged revision remains pending.

The Vite server maps were generated and included in the testing Worker upload as `application/source-map`. Live remapping to original-source frames remains unverified. Cloudflare trace querying was verified for testing health events; linking an application request ID to a platform trace is unverified. See [Architecture](../../ARCHITECTURE.md#observability) for privacy controls, [Testing](../../TESTING.md#merged-and-hosted-verification-2026-10-28) for the evidence summary, and [Investigate an application failure](investigate-application-failure.md) for query steps that do not print credentials.

### Production follow-up

Production automation is a follow-up. It needs a copy of its existing local state into the Cloudflare state store and a switch to that store. It also needs a deploy job, a GitHub environment with an approval gate, its secrets and variables, and a `/healthz` revision check. These are not built by the testing pipeline.

The Worker entry and compatibility-flag change in `packages/infra/alchemy.run.ts` applies to every stage, so the first production deploy ships it too. Plan production first and confirm the Worker change is intended there.

Production keeps local state for now. Before a separately approved production operation, locate the checkout that owns that state. Back up `packages/infra/.alchemy` privately and preserve the production inputs. Production also requires `POSTHOG_PROJECT_TOKEN`. Confirm the stage and intended revision with the state owner before planning or deploying. Stop if the plan proposes unexpected resource creation or deletion.

### State and recovery

Testing uses the encrypted Cloudflare state store `alchemy-state-store`. Local development and the `dev` stage keep local state under `packages/infra/.alchemy`. Production also keeps local state for now. Local state contains plaintext credentials; `Redacted` masks logs but does not encrypt that state. Keep local state and backups private, with directories at mode `0700` and files at `0600`. Never commit them.

After a failed testing deployment, inspect the workflow failure privately before retrying the same revision. Confirm that it uses the testing environment and existing testing state. Do not clear state or use `--adopt` or `--force` to bypass a mismatch. A failed Neon project create can leave an orphan outside Alchemy state; reconcile it with the state owner before retrying. A rollback needs a compatible prior revision and an assessment of database migrations. `destroy:testing` is not a rollback: it deletes the Neon project and its data.

## Verification and deployment limits

Local development is supported only with Alchemy stage `dev`; it uses the local runtime, has no custom domain, leaves `workersDev` unset, sets `APP_ENV=development`, reads `DATABASE_URL` and `BETTER_AUTH_SECRET` from the environment, and uses revision `local`. The configured deployed stages are `testing` (`cairn-testing.prumod.eu`) and `production` (`cairn.prumod.eu`); both set `APP_ENV=production`, require a full 40-character lowercase hexadecimal `GIT_SHA`, and set `workersDev: false`. Their configuration uses only the corresponding custom domain and disables stable `workers.dev` URLs and per-version preview URLs.

Verified on 2026-10-22: testing (`https://cairn-testing.prumod.eu`) and production (`https://cairn.prumod.eu`) were deployed at revision `100ae4e3b91fe1b054c84793616d822a83707b97`. Each `GET /healthz` response reported that revision. Both stages used separate Neon Free projects in `aws-eu-central-1` with `21600`-second history retention, separate generated secrets, and separate Google OAuth clients.

Real Google sign-in and sign-out were verified in a browser on both stages. The bootstrap administrator saved the company profile, which persisted after reload. A second account saw the pending-access page, was approved by the administrator through `/access`, viewed the shared profile, and returned to the pending page after the administrator revoked access. A database read confirmed `approved=false` and zero sessions after sign-out.

Cloudflare Billable usage and Invoices showed “No invoices”; Cloudflare Workers and the `prumod.eu` zone were on Free plans. The Neon organization was on the Free plan ($0/month). No paid plan or payment method was used. Both hostnames resolved to Cloudflare IPs. The zone nameservers were `albert.ns.cloudflare.com` and `bonnie.ns.cloudflare.com`; a DS record was published at the parent and a resolver returned the AD flag, confirming DNSSEC validation.

On 2026-10-22, the Cloudflare Workers dashboard showed 708 production invocations in 24 hours, 0 errors, and 4 ms CPU time. Testing recorded 862 requests with a 4.9 ms median. The Workers Free CPU limit is 10 ms; p99 was not read. After about 7 minutes idle, `/healthz` (which runs `SELECT 1`) took 0.90 s, 0.67 s, and 0.24 s. Warm responses took 0.17–0.34 s. These are observed timings, not load-test results.

The current `/privacy` page also describes production analytics and masked replay; its deployment with this change is unverified. The legal pages do not identify the data controller or contact, state a retention period, or describe data-subject rights. A legal review remains outstanding.

The package scripts are `deploy:testing`, `deploy:production`, `destroy:testing`, and `destroy:production`; each fixes its stage, and there are no implicit `deploy` or `destroy` aliases. These script names are documented for identification, not as ready-to-run commands. They can change remote resources when run with valid Cloudflare or Neon authentication, including persistent Alchemy OAuth/token credentials; unsetting `CLOUDFLARE_API_KEY` and `CLOUDFLARE_ACCOUNT_ID` alone does not prevent that. Any deploy or destroy requires separate explicit approval for that operation and stage, plus verified isolated credentials and other inputs. For reference, the scripts are run with working directory `packages/infra`.

The local development stack and controlled-identity tests do not exercise these external services or Google's OAuth flow; the live checks above provide that evidence for the recorded revision. Still unverified: a Neon update through Alchemy using a project-scoped key, p99 CPU time, legal review, and shared (non-local) Alchemy state. The current Alchemy state remains local and is not shared between machines.
