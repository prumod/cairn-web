# Run the company profile locally

This guide runs the full-stack app through the local Alchemy development stack and Cloudflare Workers runtime. It does not deploy the app to Cloudflare or Render. Local development needs a Neon-compatible HTTP database URL and private authentication values. Do not reuse testing/production credentials or data.

## Configure local values

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

If you want to try Google sign-in, configure a local-only Google OAuth web client for `http://localhost:3001` and the callback `http://localhost:3001/api/auth/callback/google`. Keep the client secret private. This configuration is an instruction for local setup, not evidence that the Google flow has been verified in this migration.

## Apply migrations and start the app

Use a development database that you control. Apply the committed Drizzle migrations, then start the local Worker stack:

```sh
bun run db:migrate
bun run dev
```

Open `http://localhost:3001`. The root `bun run dev` command starts `packages/infra`'s Alchemy development stage and the TanStack Start app in the local Workers runtime. Standalone Vite dev/preview is not supported; use the Worker stack. The app's database client uses Neon HTTP; a plain PostgreSQL URL is not a substitute for the HTTP endpoint expected by the app.

The first protected request from a verified Google identity matching `BOOTSTRAP_ADMIN_EMAIL` initializes administrator access. Other users need administrator approval. Pending users cannot access company data, and protected requests check current access against the database. There is no seed command.

## Run local tests

Tests use a separate disposable environment. Docker Compose starts a temporary PostgreSQL 18.6 container and the pinned local Neon HTTP proxy; the test fixture builds the app, runs it in `workerd`, creates isolated test databases, and cleans up its containers. Browser tests use Chromium and controlled identities through an external test-only proxy. They do not use your local OAuth credentials or verify Google's OAuth flow.

```sh
bun run test:fast
bun run test:browser
```

For test boundaries and the current verification status, see [Testing](../../TESTING.md).

## Cloud stages

The `testing` and `production` stages are provisioned by Alchemy, not by hand. Each stage gets its own `Neon.Project` named `database` in `aws-eu-central-1` (Frankfurt). `Neon.Project` applies `packages/db/migrations/` on every deploy; on the first deploy, Alchemy takes over drizzle-kit's migration history. The Worker receives the project's pooled connection URI as a secret `DATABASE_URL`, and a generated `BETTER_AUTH_SECRET` that Alchemy keeps in its state. Do not create a Neon database or copy a `DATABASE_URL` for these stages. `bun run db:migrate` is only for the local `dev` database.

A cloud deploy needs these inputs from a human:

- `NEON_API_KEY`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `BOOTSTRAP_ADMIN_EMAIL`
- `GIT_SHA`, the full 40-character lowercase hexadecimal commit
- Cloudflare authorization for Alchemy

Put secrets in the ignored `packages/infra/.env.local` (Varlock loads it over `.env.schema`) or in the process environment. Never commit them.

These steps cannot be infrastructure code and stay manual:

- Create the Google OAuth Web client for each environment in Google Cloud Console, with redirect URI `https://<domain>/api/auth/callback/google`. No known API creates a standard Web client; this is unconfirmed.
- Change the nameservers and the DNSSEC DS record at the registrar, Spaceship.

Alchemy state is local (`Alchemy.localState()`, directory `.alchemy`). Remote state is not enabled, so only the machine that holds `.alchemy` can update or destroy the stack. Losing it loses Alchemy's record of the deployed resources and the generated auth secret.

## Verification and deployment limits

Local development is supported only with Alchemy stage `dev`; it uses the local runtime, has no custom domain, leaves `workersDev` unset, sets `APP_ENV=development`, reads `DATABASE_URL` and `BETTER_AUTH_SECRET` from the environment, and uses revision `local`. The configured deployed stages are `testing` (`cairn-testing.prumod.eu`) and `production` (`cairn.prumod.eu`); both set `APP_ENV=production`, require a full 40-character lowercase hexadecimal `GIT_SHA`, and set `workersDev: false`. Their configuration uses only the corresponding custom domain and disables stable `workers.dev` URLs and per-version preview URLs.

Verified: the typecheck and unit tests pass. Unverified: nothing has been deployed or planned against Neon or Cloudflare. Neon provisioning, migration takeover, DNS, certificates, Google OAuth, and live behavior are untested.

The package scripts are `deploy:testing`, `deploy:production`, `destroy:testing`, and `destroy:production`; each fixes its stage, and there are no implicit `deploy` or `destroy` aliases. These script names are documented for identification, not as ready-to-run commands. They can change remote resources when run with valid Cloudflare or Neon authentication, including persistent Alchemy OAuth/token credentials; unsetting `CLOUDFLARE_API_KEY` and `CLOUDFLARE_ACCOUNT_ID` alone does not prevent that. Any deploy or destroy requires separate explicit approval for that operation and stage, plus verified isolated credentials and other inputs. For reference, the scripts are run with working directory `packages/infra`.

Local development and controlled-identity tests do not verify Cloudflare or Neon provisioning, an external deployment, real Google sign-in, CI, or production behavior. The retained Render files and workflows target the previous runtime and are not a deployment path for this Worker. A cloud cutover requires separate authorization and validation of provider state, credentials, migrations, OAuth, security gates, and live behavior for the exact revision.
