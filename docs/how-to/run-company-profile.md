# Run the company profile locally

The complete application needs PostgreSQL and Google OAuth credentials. Do not commit credentials or put them in tracked files. Startup applies committed database migrations before listening; it does not seed users. On the first protected request, the signed-in, verified Google identity matching `BOOTSTRAP_ADMIN_EMAIL` becomes administrator.

## Configure local environment

Set these variables in your shell or an untracked local environment manager:

```sh
export DATABASE_URL='postgres://…'
export APP_ORIGIN='http://localhost:3000'
export BETTER_AUTH_SECRET='at-least-32-random-characters-here'
export GOOGLE_CLIENT_ID='…'
export GOOGLE_CLIENT_SECRET='…'
export BOOTSTRAP_ADMIN_EMAIL='your-verified-google-email@example.com'
export PORT=3000 # optional; defaults to 3000
```

Create an OAuth web client in Google Cloud and configure its authorized origin as `http://localhost:3000` and redirect URI as `http://localhost:3000/api/auth/callback/google`. Use the exact origin where the app is served; update both the OAuth client and `APP_ORIGIN` together if it changes. Production requires an HTTPS origin. Keep OAuth secrets private.

## Run integrated application

With Bun 1.3.14, dependencies installed, and PostgreSQL reachable:

```sh
bun run build
bun run start
```

Open `http://localhost:3000`. Express serves the built UI, API, and `/healthz` on one origin. The Vite development server (`bun run dev`, normally `http://localhost:5173`) proxies API requests to port 3000, but browser OAuth uses that Vite origin; configure `APP_ORIGIN` and Google's authorized origin/redirect consistently for the chosen origin. The simplest OAuth verification path is the compiled same-origin server at port 3000. `bun run preview` serves only built assets and does not provide the application API.

The access page lets the first verified bootstrap administrator approve or revoke signed-in users. Pending users cannot read or write company data; changes to approval are checked against the database on every protected request. No database seeding is required or performed.

## Verification limits

The automated browser suite uses controlled Google-like identities through Better Auth test utilities, real database sessions, and an isolated test server. That proves application behavior but does not validate real Google OAuth. Manually verify by completing the Google sign-in redirect on the configured origin, confirming the bootstrap account reaches the administrator view, then signing in with a second Google account, approving/revoking it, and checking that revoked access fails in the existing session. Never use browser-test identity endpoints against production.

Render and Neon are not yet configured or deployed. Local build/test success is not deployment evidence.
