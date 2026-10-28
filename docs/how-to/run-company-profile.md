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

A cloud deploy needs these inputs from a human:

- `NEON_API_KEY`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `BOOTSTRAP_ADMIN_EMAIL`
- `GIT_SHA`, the full 40-character lowercase hexadecimal commit
- `POSTHOG_PROJECT_TOKEN` for production: the public write-only PostHog project token, supplied through ignored local configuration or the process environment; never a personal API key
- Cloudflare authorization for Alchemy

Put secrets in the ignored `packages/infra/.env.local` (Varlock loads it over `.env.schema`) or in the process environment. Never commit them. Each deployed stage uses its own generated secrets and its own Google OAuth client in Google Cloud project `cairn`. Both clients use an External/Testing consent screen; the test users are `tiagojacintodev@gmail.com` and `tiagojacinto7@gmail.com`. For production deploys, supply the production client's `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; process variables override the local file. Do not assume a worktree contains the earlier stage inputs.

For routine deploys of an existing stage, set `NEON_API_KEY` to that stage's project-scoped key. An exported variable overrides `packages/infra/.env.local`; confirm its stage without printing its values. The earlier deployment used a testing scoped key in that file, which is not a guarantee about this checkout. The keys `cairn-testing-scoped` and `cairn-production-scoped` returned 200 for their own project and 404 for the other project, project listing, and project creation; they cannot delete projects or create keys. Creating a new stage or running `destroy:<stage>` requires the organization API key `cairn-alchemy`, kept outside the repository and `.env.local`. A no-op deploy does not call Neon, so an Alchemy Neon update with a scoped key has not yet been verified.

Neon project-scoped keys can be created only with a personal API key or OAuth session; an organization key is rejected. After `neonctl auth`, create one with `neonctl api-keys create --name <name> --project-id <project-id>`. Neon shows the key once. It stops working if the project is transferred out of the organization. `ALCHEMY_PASSWORD` appears only as an empty key in `packages/infra/.env.schema`; no value is configured.

These steps cannot be infrastructure code and stay manual:

- Create a separate Google OAuth Web client for each environment in Google Cloud Console, with redirect URI `https://<domain>/api/auth/callback/google`.
- Change the nameservers and the DNSSEC DS record at the registrar, Spaceship.

### Prepare the existing stage safely

Before planning from a new worktree, locate the checkout that owns the stage's existing Alchemy state. The earlier cloud deployment used a separate worktree; this checkout's `.alchemy` directory is not proof that it owns either hosted stage. Confirm the stage, Worker resource, Neon project, and expected revision with the state owner. Do not deploy with an empty or unrelated state directory: it can propose duplicate resources.

With that owner, back up the existing `packages/infra/.alchemy` locally and prepare the intended stage state and ignored inputs in the deployment checkout. Preserve restrictive permissions (`umask 077`, directories `0700`, files `0600`) for state, backups, and credential files. Do not concatenate, dump, commit, or attach these files to a report: Alchemy state contains plaintext credentials. Do not invent a source path or copy all stage inputs blindly; confirm which stage each input belongs to. Check that local input files are ignored without displaying their contents:

```sh
git check-ignore packages/infra/.env.local packages/infra/.alchemy/state
```

Supply the correct stage's Neon key, OAuth client, Cloudflare authorization, and approved `GIT_SHA`; production also needs `POSTHOG_PROJECT_TOKEN`. Keep values out of command transcripts and shell tracing. Review the plan privately because provider output can contain sensitive details. Stop if an update to the existing stage instead proposes unexpected resource creation or deletion; reconcile state with its owner. Do not destroy resources or clear state to resolve this mismatch.

### Configure observability inputs

Alchemy sets `DEPLOYMENT_STAGE` to its selected stage. Both hosted stages set `APP_ENV=production`; only `DEPLOYMENT_STAGE=production` enables PostHog. Do not override the stage binding to test capture on testing. The development and acceptance stacks disable browser capture. The production stack requires a non-empty `POSTHOG_PROJECT_TOKEN`; the browser accepts only a `phc_` token and `https://eu.i.posthog.com`. Obtain the project's public write-only token from the intended EU project; no token value or external project ID is prescribed by this guide. Account/project provisioning and query credentials are separate from this binding.

The Worker declaration explicitly enables invocation logs, application logs, and traces, with log and trace head sampling set to `1`. These settings do not establish free-tier usage. On 2026-10-28, testing ran merged revision `ee24e21ea46428d32d18e15006f5b011050f2b23`; `/healthz` returned `ready` with that revision, and `/api/analytics-config` returned `null`, as intended for testing. A native Cloudflare REST query found events and traces for testing health requests. A pre-merge production replay showed masked page text, but does not verify the merged build. Production was still on revision `5ff1cf43fbaaff790a1d959631947424c73a27fb`; the production deployment of the merged revision remains pending.

The Vite server maps were generated and included in the testing Worker upload as `application/source-map`. Live remapping to original-source frames remains unverified. Cloudflare trace querying was verified for testing health events; linking an application request ID to a platform trace is unverified. See [Architecture](../../ARCHITECTURE.md#observability) for privacy controls, [Testing](../../TESTING.md#merged-and-hosted-verification-2026-10-28) for the evidence summary, and [Investigate an application failure](investigate-application-failure.md) for query steps that do not print credentials.

### Plan and deploy testing

After the stage preparation above, from `packages/infra`, review the testing plan for the exact approved 40-character lowercase commit SHA. Replace the placeholder below with that SHA:

```sh
env -u CLOUDFLARE_API_KEY -u CLOUDFLARE_ACCOUNT_ID GIT_SHA='<approved-full-SHA>' bun node_modules/alchemy/bin/cli.js plan --stage testing --detailed
```

The plan describes the changes Alchemy intends to make; it does not itself verify the live application, billing, or sign-in. Deploy only after separate approval for that exact SHA. For a non-interactive run, pass both `--no-input` and `--yes`:

```sh
env -u CLOUDFLARE_API_KEY -u CLOUDFLARE_ACCOUNT_ID GIT_SHA='<40-hex>' bun run deploy:testing --no-input --yes
```

Replace `<40-hex>` with the approved revision's full 40-character lowercase hexadecimal SHA.

### Plan and deploy production

After the stage preparation above, from `packages/infra`, supply the production OAuth client's `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Process values override `.env.local`; confirm the inputs belong to production. Then deploy the approved revision:

```sh
env -u CLOUDFLARE_API_KEY -u CLOUDFLARE_ACCOUNT_ID GIT_SHA='<40-hex>' bun run deploy:production --no-input --yes
```

Replace `<40-hex>` with the approved revision's full 40-character lowercase hexadecimal SHA. `destroy:testing` and `destroy:production` delete the corresponding Neon project and its data.

### State and recovery

Alchemy state is local (`Alchemy.localState()`, `packages/infra/.alchemy/state`); remote state is not enabled. It contains generated credentials: Alchemy's state encoding serializes redacted secrets as plaintext JSON. `Redacted` masks logs; it does not encrypt state. Use `umask 077`, keep `.alchemy` and backup directories at mode `0700` and files at `0600`, and do not commit or store state or backups remotely. Preserve `.alchemy` and ignored credentials such as `.env.local` across deployment attempts; losing state loses Alchemy's record of resources and the generated auth secret.

After a partial failure, inspect the plan for the same stage and `GIT_SHA`. A failed Neon project create can leave an orphan project outside Alchemy state; inspect the Neon console or API and delete it manually before retrying. After addressing the failure, rerun the deploy command for the same revision. Do not use `--adopt` or `--force`, or remove state. A code rollback is safe only to a compatible prior revision after assessing its database migrations; the first deploy has no prior deployed revision. Do not use `destroy:testing` as rollback: in installed Alchemy `2.0.0-beta.83`, the `Neon.Project` delete handler deletes the Neon project, including its database.

## Verification and deployment limits

Local development is supported only with Alchemy stage `dev`; it uses the local runtime, has no custom domain, leaves `workersDev` unset, sets `APP_ENV=development`, reads `DATABASE_URL` and `BETTER_AUTH_SECRET` from the environment, and uses revision `local`. The configured deployed stages are `testing` (`cairn-testing.prumod.eu`) and `production` (`cairn.prumod.eu`); both set `APP_ENV=production`, require a full 40-character lowercase hexadecimal `GIT_SHA`, and set `workersDev: false`. Their configuration uses only the corresponding custom domain and disables stable `workers.dev` URLs and per-version preview URLs.

Verified on 2026-10-22: testing (`https://cairn-testing.prumod.eu`) and production (`https://cairn.prumod.eu`) were deployed at revision `100ae4e3b91fe1b054c84793616d822a83707b97`. Each `GET /healthz` response reported that revision. Both stages used separate Neon Free projects in `aws-eu-central-1` with `21600`-second history retention, separate generated secrets, and separate Google OAuth clients.

Real Google sign-in and sign-out were verified in a browser on both stages. The bootstrap administrator saved the company profile, which persisted after reload. A second account saw the pending-access page, was approved by the administrator through `/access`, viewed the shared profile, and returned to the pending page after the administrator revoked access. A database read confirmed `approved=false` and zero sessions after sign-out.

Cloudflare Billable usage and Invoices showed “No invoices”; Cloudflare Workers and the `prumod.eu` zone were on Free plans. The Neon organization was on the Free plan ($0/month). No paid plan or payment method was used. Both hostnames resolved to Cloudflare IPs. The zone nameservers were `albert.ns.cloudflare.com` and `bonnie.ns.cloudflare.com`; a DS record was published at the parent and a resolver returned the AD flag, confirming DNSSEC validation.

On 2026-10-22, the Cloudflare Workers dashboard showed 708 production invocations in 24 hours, 0 errors, and 4 ms CPU time. Testing recorded 862 requests with a 4.9 ms median. The Workers Free CPU limit is 10 ms; p99 was not read. After about 7 minutes idle, `/healthz` (which runs `SELECT 1`) took 0.90 s, 0.67 s, and 0.24 s. Warm responses took 0.17–0.34 s. These are observed timings, not load-test results.

The current `/privacy` page also describes production analytics and masked replay; its deployment with this change is unverified. The legal pages do not identify the data controller or contact, state a retention period, or describe data-subject rights. A legal review remains outstanding.

The package scripts are `deploy:testing`, `deploy:production`, `destroy:testing`, and `destroy:production`; each fixes its stage, and there are no implicit `deploy` or `destroy` aliases. These script names are documented for identification, not as ready-to-run commands. They can change remote resources when run with valid Cloudflare or Neon authentication, including persistent Alchemy OAuth/token credentials; unsetting `CLOUDFLARE_API_KEY` and `CLOUDFLARE_ACCOUNT_ID` alone does not prevent that. Any deploy or destroy requires separate explicit approval for that operation and stage, plus verified isolated credentials and other inputs. For reference, the scripts are run with working directory `packages/infra`.

The local development stack and controlled-identity tests do not exercise these external services or Google's OAuth flow; the live checks above provide that evidence for the recorded revision. Still unverified: a Neon update through Alchemy using a project-scoped key, p99 CPU time, legal review, and shared (non-local) Alchemy state. The current Alchemy state remains local and is not shared between machines.
