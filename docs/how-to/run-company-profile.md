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

## Verification and deployment limits

Local development is supported only with Alchemy stage `dev`; it has no custom domain, sets `APP_ENV=development`, and uses revision `local`. The configured deployed stages are `testing` (`cairn-testing.prumod.eu`) and `production` (`cairn.prumod.eu`); both set `APP_ENV=production` and require a full 40-character lowercase hexadecimal `GIT_SHA`. These are code configuration values, not evidence of working DNS, certificates, Cloudflare provisioning, OAuth, or a live deployment. Alchemy is configured with local state; remote state and database/OAuth/credential isolation are not provisioned here.

The package scripts are `deploy:testing`, `deploy:production`, `destroy:testing`, and `destroy:production`; each fixes its stage, and there are no implicit `deploy` or `destroy` aliases. These script names are documented for identification, not as ready-to-run commands. They can change remote resources when run with valid Cloudflare authentication, including persistent Alchemy OAuth/token credentials; unsetting `CLOUDFLARE_API_KEY` and `CLOUDFLARE_ACCOUNT_ID` alone does not prevent that. Any deploy or destroy requires separate explicit approval for that operation and stage, plus verified isolated credentials, state, and other inputs. For reference, the scripts are run with working directory `packages/infra`.

Local development and controlled-identity tests do not verify Cloudflare account provisioning, remote Alchemy state, an external deployment, real Google sign-in, CI, or production behavior. The retained Render files and workflows target the previous runtime and are not a deployment path for this Worker. A cloud cutover requires separate authorization and validation of provider state, credentials, database and migrations, OAuth, security gates, and live behavior for the exact revision.
