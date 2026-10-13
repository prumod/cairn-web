# Manage Render Blueprints

Use this guide to review repository configuration and, only with explicit authorization, adopt the existing testing service or opt into a future production Blueprint. It assumes maintainer access to the repository and Render workspace. Repository changes alone do not authorize live operations, credential entry, billing changes or production provisioning.

## Check the repository configuration

1. From the repository root with Bun 1.3.14 installed, run:

   ```sh
   bun run check:blueprints
   ```

   Expected result: the testing Blueprint and production template both parse and pass the local deployment policy. The production template retains an unresolved plan; local success is not Render schema validation and does not authorize submitting it. Full and fast agent checks also run the policy tests in `scripts/check-blueprints.test.mjs`. This is not Render schema validation or a live deployment check.

2. Review the file for the intended environment:
   - **Testing:** `render.yaml`, service `cairn-testing`, branch `feat/63-company-profile`, origin `https://cairn-testing.onrender.com`. Preserve existing service ID `srv-db5aeujbc2fs73esi140`.
   - **Future production:** `deploy/render.production.template.yaml`, service `cairn-production`, branch `main`. Its `plan: __APPROVED_PRODUCTION_PLAN_REQUIRED__` preserves the unapproved plan decision; the template has not been validated with Render and must not be submitted as-is. No paid tier is approved; production is unapproved and unprovisioned. Its `APP_ORIGIN` remains `sync: false` until an HTTPS URL is approved. Do not add production to the root testing Blueprint.

   Both specify the Render `node` runtime, `region: frankfurt`, Bun 1.3.14, Node 22.23.2 and runtime `NODE_ENV=production`. Only testing uses `plan: free`; the production template has no deployable plan. The build command is `NODE_ENV=development bun install --frozen-lockfile && bun run build`; the start command is `bun run start`; the health path is `/healthz`. Neither file defines a Render database or preview environment.

3. Before an authorized provider operation, validate against the current [Render Blueprint specification](https://render.com/docs/blueprint-spec). IDE schema validation can use `https://render.com/schema/render.yaml.json`; Render also documents CLI/API validation. Local policy success does not establish provider acceptance, repository access, branch availability or adoption support.

## Adopt testing without creating a duplicate

Do not proceed without explicit authorization for the live operation.

1. Inspect the existing `cairn-testing` service in the Render Dashboard. Confirm service ID `srv-db5aeujbc2fs73esi140`, its current configuration and origin `https://cairn-testing.onrender.com`. Confirm it is not already managed by another Blueprint; one resource must not be managed by multiple Blueprints.
2. Review Render's current [existing-resource guidance](https://render.com/docs/infrastructure-as-code#adding-an-existing-resource). Its initial Blueprint creation/collision flow can append suffixes and create independent resources. Matching the name alone does **not** prove adoption.
3. In the authorized Blueprint flow, select this repository, branch `feat/63-company-profile` and Blueprint Path `render.yaml`. Inspect the provider's proposed actions before applying anything. Proceed only if they unambiguously adopt/update the exact existing service and preserve its ID and origin. If they create a duplicate, add a suffix, replace the service or cannot prove adoption, **stop without deploying** and resolve adoption with Render support/documentation. Do not use creation as a fallback.
4. Preserve existing private values for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `BOOTSTRAP_ADMIN_EMAIL`. Each is declared `sync: false`, without a tracked value. Render prompts for these values when initially creating resources but ignores these entries on later syncs; manage subsequent changes privately in the service environment settings. Never copy secrets into YAML, documentation or review output.
5. The existing testing service's **Auto-Deploy** setting was verified after reloading the Render page as **After CI Checks Pass**. This verifies the setting only; the end-to-end CI-gated deployment still requires publication and a resulting deployment observation. **Auto Sync** is a separate control: confirm it is **No** on the Blueprint's **Settings** page before any authorized adoption, and do not infer its state from the service deploy setting. `autoDeployTrigger: checksPass` gates code deploys on CI, while Auto Sync controls Blueprint configuration updates. Manual Sync can still change service configuration and cause deployment; review each proposed action and obtain authorization before applying it.
6. After an authorized adoption, record the service ID and origin. Pushes to `feat/63-company-profile` run the `Agent checks` GitHub Actions workflow; Render should deploy that commit only after its checks pass. Render does not deploy if it detects zero checks or any failing check; GitHub conclusions `success`, `neutral` and `skipped` count as passing. Verify the deployed revision and `/healthz`, Google sign-in and profile persistence after reload. Separately verify a second account's approval and revocation in its existing session. Do not infer live success from configuration validation.

## Opt into future production separately

Do not perform live steps until a non-Free production plan, provisioning and the HTTPS origin are explicitly approved. The committed file is an unvalidated proposal, not a deployment instruction.

1. Obtain an explicit non-Free production plan decision; no paid tier is currently approved. Replace `__APPROVED_PRODUCTION_PLAN_REQUIRED__` only in an authorized repository change that also updates the local policy/tests for the selected plan. Validate the resulting Blueprint against Render's schema before any live operation. Review workspace usage and overage safeguards. Render [advises against Free instances for production](https://render.com/docs/free). Free services spin down after 15 idle minutes and can take about a minute to restart. The workspace shares 750 Free instance hours monthly; bandwidth and build pipeline quotas can cause suspension or charges. `plan: free` is not a spending guarantee. Do not change billing settings without separate authorization.
2. Prepare a production-only PostgreSQL database, Google OAuth web client and secrets through an approved private workflow. Local, testing and production must not share databases, OAuth clients or secrets. These Blueprints do not provision databases. Neon is the future database provider, but the production plan and its cost controls are not selected.
3. Set production `APP_ORIGIN` privately to the approved HTTPS origin. Configure that exact origin in Google and its redirect URI as `<approved-origin>/api/auth/callback/google`. Testing retains `https://cairn-testing.onrender.com` and callback `https://cairn-testing.onrender.com/api/auth/callback/google`.
4. In a **separate** authorized Blueprint flow, select this repository, branch `main` and the explicitly approved production Blueprint path (currently the proposal is `deploy/render.production.template.yaml`). Do not submit the unresolved template. Review provider validation and proposed actions. They must affect only the intended production service, never testing. Supply production-only values for the five `sync: false` variables and `APP_ORIGIN` privately; do not invent a production URL or commit values.
5. Set this Blueprint's **Auto Sync** to **No** separately and confirm the production service's automatic deploy trigger remains off. For each authorized deployment, verify `/healthz`, the expected revision, live OAuth, bootstrap administration, second-account approval/revocation and profile persistence after reload. Confirm environment/data isolation before claiming production readiness.

## Evidence limits

Testing revision `0e3dd2d` had historical readiness, real Google OAuth and profile reload/persistence observations. They are not fresh checks of the current revision. Render schema/API validation of these files was not run. Blueprint adoption, second-account approval/revocation, production provisioning, production OAuth and production data isolation remain unverified. No live operation or credential entry is performed by `bun run check:blueprints`.
