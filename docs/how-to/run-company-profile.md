# Run the company profile locally

This guide runs the full-stack TanStack Start application with local PostgreSQL. Google sign-in also requires a local OAuth web client. Do not commit credentials or use testing/production secrets or data.

## Configure the environment

Set these variables in your shell or an untracked local environment manager:

```sh
export DATABASE_URL='postgres://…'
export APP_ORIGIN='http://localhost:5173'
export BETTER_AUTH_SECRET='at-least-32-random-characters-here'
export GOOGLE_CLIENT_ID='…'
export GOOGLE_CLIENT_SECRET='…'
export BOOTSTRAP_ADMIN_EMAIL='your-verified-google-email@example.com'
```

For the built Node server, set `APP_ORIGIN` to `http://localhost:3000` and optionally set `PORT=3000` (the default). Use the exact origin you open in the browser. Create a local-only Google OAuth web client with that authorized origin and redirect URI `<APP_ORIGIN>/api/auth/callback/google`. Update the OAuth client and `APP_ORIGIN` together if the origin changes. Production requires HTTPS. Keep OAuth secrets private.

Use separate local PostgreSQL, OAuth and secrets; never reuse testing or production credentials or data. The application applies committed migrations from `web/migrations/` when the first server handler initializes its runtime. `/healthz` triggers this initialization and reports readiness. Builds do not need database or authentication secrets.

## Run the application

With Bun 1.3.14, dependencies installed, and PostgreSQL reachable, start the full-stack Vite/TanStack Start development server:

```sh
bun run dev
```

Open `http://localhost:5173`. UI routes and server handlers are part of the same Start application; there is no Express service or separate `/api` proxy.

To verify the built Node server instead:

```sh
bun run build
bun run start
```

Open `http://localhost:3000`. Use the root `bun run start` command: it sets the working directory to `web/`, which the runtime uses to locate SQL migrations. Do not start `web/.output/server/index.mjs` from the repository root. `bun run preview` also starts the built integrated server. To apply migrations explicitly, run `bun run db:migrate` with the same local `DATABASE_URL`.

The first verified Google identity matching `BOOTSTRAP_ADMIN_EMAIL` becomes administrator on a protected request. The administrator can approve or revoke signed-in users. Pending users cannot read or write company data; access is checked against PostgreSQL on every protected request, including for existing sessions. The application does not seed users.

## Verification limits

`bun run test:fast` and `bun run test:browser` use disposable PostgreSQL and controlled local identities. Browser identities enter through a test-only proxy outside the application. These tests verify application behavior; they do not validate Google redirect, consent, state, PKCE or a real account.

The earlier testing-service Google OAuth/E2E evidence was produced by the Express implementation. It does not certify the Start replacement. Fresh exact-SHA testing, real-Google browser verification and deployed functional E2E are still required before the replacement can be treated as accepted. No production deployment or provider change is authorized by this guide.

For deployment constraints and Blueprint safeguards, see [Manage Render Blueprints](manage-render-blueprints.md). Root `render.yaml` describes the existing testing service; the production template retains an unresolved plan decision and is not approved for submission. Keep databases, OAuth clients and secrets separate across local, testing and production environments.
