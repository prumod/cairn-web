# Architecture

## Current system

The Bun workspace contains a React/Vite frontend in `web/` and Node/Express backend in `backend/`. The frontend provides company-profile and access-management pages. The backend serves the built UI and API on one origin; `/` and `/access` serve the two pages and `/healthz` checks PostgreSQL and reports the revision. Vite development proxies `/api` to `127.0.0.1:3000`; Vite preview serves assets only and is not the integrated application.

Better Auth handles Google OAuth and PostgreSQL sessions; Drizzle with `pg` applies committed SQL migrations before the server listens. On a protected request, a verified Google account matching `BOOTSTRAP_ADMIN_EMAIL` is initialized as administrator. Other signed-in users await approval; administrators approve or revoke them. Every protected request checks current database access, so revocation affects existing sessions. One shared company profile stores name, address, and positive finite radius. API writes require same-origin `Origin`; requests validate basic input. No seeding is part of startup: the administrator is bootstrapped on first protected request. The testing deployment has historical live Google OAuth evidence; this is not current production-readiness evidence.

## Enforced module boundaries

`dependency-cruiser` enforces public-entry-only imports between modules and blocks circular and unresolved imports. Module production files at a module root are public entry points; nested folders are private. A module's own unit tests may import its private files. Other modules and application code may not import private files or tests. Frontend, backend, and root shared code are isolated; frontend shared code cannot depend on pages, and backend shared code cannot depend on domain modules. `bun run lint:boundaries` checks the graph and `bun run test:boundaries` proves representative allowed and forbidden imports. These import rules do not verify application behavior or deployments. See [Project structure](docs/reference/project-structure.md).

## Deployment configuration and evidence

`render.yaml` targets the existing service name `cairn-testing` on `feat/63-company-profile`, at `https://cairn-testing.onrender.com` (current service ID `srv-db5aeujbc2fs73esi140`); provider adoption is not verified. `deploy/render.production.template.yaml` separately describes the future `cairn-production` service on `main`. Its `plan: __APPROVED_PRODUCTION_PLAN_REQUIRED__` records the unapproved plan decision. The file has not been validated with Render and must not be submitted until a non-Free plan is approved. No paid tier is approved. Production is unapproved and unprovisioned; checking in its template does not authorize provisioning or deployment. Blueprint adoption has not been verified.

Both files specify the Render `node` runtime, Frankfurt region, Bun 1.3.14, Node 22.23.2 and runtime `NODE_ENV=production`. Only testing specifies a deployable Free plan; production requires a plan decision. The build temporarily uses `NODE_ENV=development bun install --frozen-lockfile && bun run build` to install build dependencies. `bun run start` serves the compiled application; `/healthz` is the health check. The testing Blueprint uses `autoDeployTrigger: checksPass`, and GitHub Actions is configured to run the `Agent checks` workflow on pushes to `feat/63-company-profile`. The existing service's live **After CI Checks Pass** setting was verified after reloading the Render page. This confirms the setting, not an end-to-end CI-gated deployment; verify the deployed revision after the workflow is published. Each Blueprint's **Auto Sync** is a separate control and was not changed. The production template keeps `autoDeployTrigger: off`.

Local, testing and production use separate PostgreSQL databases, Google OAuth clients and secrets. The testing Blueprint and production template define no Render databases or preview environments. `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `BOOTSTRAP_ADMIN_EMAIL` are supplied privately with `sync: false`, never committed values. Testing fixes `APP_ORIGIN` to its existing origin; production leaves it `sync: false` until an HTTPS URL is approved. The future database target is external PostgreSQL on Neon, with production plan and cost controls still to be selected; it is not a Blueprint-managed Render database.

Historical testing revision `0e3dd2d` had readiness, live Google OAuth and company-profile reload/persistence checks. This does not verify the current revision, Blueprint adoption, production provisioning, production OAuth, second-account approval/revocation or production data isolation. Private data is protected by backend authentication and authorization; the frontend is not an access-control boundary.

Free instances have cold starts and shared workspace usage limits; `plan: free` is not a zero-spend guarantee. Render advises against Free instances for production. Review usage and overage safeguards before authorized live operations; no billing changes are implied. See [Manage Render Blueprints](docs/how-to/manage-render-blueprints.md) for adoption safeguards and manual validation.

## Change contracts

- Keep frontend concerns in `web/` and backend concerns in `backend/`. Create root `shared/` only for genuinely reused, runtime-independent contracts.
- Distinguish repository policy checks, historical testing observations and fresh provider/live validation. None establishes production readiness.
- For test scope and test contracts, see [Testing](TESTING.md).
