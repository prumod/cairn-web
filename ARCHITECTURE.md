# Architecture

## Current system

The Bun workspace contains a React/Vite frontend in `web/` and Node/Express backend in `backend/`. The frontend provides company-profile and access-management pages. The backend serves the built UI and API on one origin; `/` and `/access` serve the two pages and `/healthz` checks PostgreSQL and reports the revision. Vite development proxies `/api` to `127.0.0.1:3000`; Vite preview serves assets only and is not the integrated application.

Better Auth handles Google OAuth and PostgreSQL sessions; Drizzle with `pg` applies committed SQL migrations before the server listens. On a protected request, a verified Google account matching `BOOTSTRAP_ADMIN_EMAIL` is initialized as administrator. Other signed-in users await approval; administrators approve or revoke them. Every protected request checks current database access, so revocation affects existing sessions. One shared company profile stores name, address, and positive finite radius. API writes require same-origin `Origin`; requests validate basic input. No seeding is part of startup: the administrator is bootstrapped on first protected request. The live Google provider and deployment are not yet configured or verified.

## Enforced module boundaries

`dependency-cruiser` enforces public-entry-only imports between modules and blocks circular and unresolved imports. Module production files at a module root are public entry points; nested folders are private. A module's own unit tests may import its private files. Other modules and application code may not import private files or tests. Frontend, backend, and root shared code are isolated; frontend shared code cannot depend on pages, and backend shared code cannot depend on domain modules. `bun run lint:boundaries` checks the graph and `bun run test:boundaries` proves representative allowed and forbidden imports. These import rules do not verify application behavior or deployments. See [Project structure](docs/reference/project-structure.md).

## Deployment target (not yet verified)

The approved target is a single-origin Render Free deployment serving React and Express, with PostgreSQL on Neon Free. Keep the plan at zero spend using free tiers. Neither provider is configured or deployed; there is no `render.yaml` or publishing pipeline. Google OAuth credentials and callback setup also remain unverified. Private data is protected by backend authentication and authorization; the frontend is not an access-control boundary.

## Change contracts

- Keep frontend concerns in `web/` and backend concerns in `backend/`. Create root `shared/` only for genuinely reused, runtime-independent contracts.
- Treat hosting as a target. The access-control implementation is verified locally, not through live Google OAuth or a deployed service.
- For test scope and test contracts, see [Testing](TESTING.md).
