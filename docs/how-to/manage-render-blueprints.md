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
5. Preserve `autoDeployTrigger: off` on testing. The earlier **After CI Checks Pass** configuration is historical and must not be restored: automatic deploys could replace a candidate during authenticated tests. **Auto Sync** is separate: confirm it is **No** on the Blueprint's **Settings** page before authorized adoption. Manual Sync can also change configuration and cause deployment; review proposed actions and obtain authorization before applying them. No Blueprint sync or adoption was performed during the testing gate cutover.
6. After authorized adoption, verify the existing service ID, origin, Free plan and automatic-deploy-off state. Use the trusted candidate workflow below after prerequisite CI passes; do not infer live success from configuration validation.

## Candidate deployed-E2E gate

The workflow on `main` uses a manual `workflow_dispatch` from `main`, with a PR number and full lowercase 40-character head SHA. A repository write-capable maintainer's dispatch approves that exact candidate's build/runtime code for the testing service; it is a deliberate trust checkpoint, not automatic testing of arbitrary forks. The gate verifies an open, non-draft same-repository PR to `main`, exact current head and base, a candidate head descended from current `main` (or identical to it), a successful candidate PR run of `Agent checks` attached to its head SHA, and that GitHub's current merge candidate tree exactly matches the PR head tree. It serializes the entire testing run globally without cancellation, deploys the exact SHA via Render `commitId`, waits for that revision, runs authenticated E2E with cleanup, rechecks candidate/base/service/live revision, then publishes final status. Any failure or drift fails closed. Cancellation may leave a pending status; rerun rather than bypass it.

The authorized testing cutover stored the existing key as `CAIRN_RENDER_API_KEY` in the protected main-only `cairn-testing-e2e` environment, checked old workflows/deploys were quiescent, and verified automatic deploy off on the existing Free service. The tracked Blueprint and local policy also require `off`; no Blueprint sync/adoption was performed. A live dispatch with closed PR #73 failed before deployment as intended ([run 38927827211](https://github.com/prumod/cairn-web/actions/runs/38927827211)). Positive [run 38929024165](https://github.com/prumod/cairn-web/actions/runs/38929024165) deployed and tested exact candidate `777db0c9b3fdf845ff2fa3f12f18a287aa56f7a2`, including cleanup and final success. That candidate used the earlier Express runtime; the run proves the gate path for Express, not compatibility with the TanStack Start replacement. **Both `Agent checks` and `Deployed company profile E2E` were made required on `main`**, with strict checks and admin enforcement retained, pinned to the GitHub Actions app. The Start replacement needs its own CI and exact-SHA deployment/E2E evidence.

For an authorized, trusted candidate, update its branch with current `main`, wait for `Agent checks`, and obtain its full head SHA. From the repository root run:

```sh
gh workflow run deployed-e2e.yml --repo prumod/cairn-web --ref main \
  -f pr_number=<PR_NUMBER> -f candidate_sha=<FULL_HEAD_SHA>
```

Replace both placeholders with the reviewed PR and immutable head. Inspect the resulting run and candidate commit status; a queued dispatch or successful deployment alone is not functional E2E proof. Never dispatch untrusted build/runtime code against testing secrets/data.

Each new candidate SHA must pass CI and its own deployed test; do not reuse a prior candidate's success. Required protection was enabled with explicit approval and independently read back. The closed-PR negative run demonstrates pre-deploy rejection; an isolated live missing-status merge-blocking test remains a separate evidence gap. Do not bypass protections to merge. Production and billing are not authorized by the testing cutover.

## Opt into future production separately

Do not perform live steps until a non-Free production plan, provisioning and the HTTPS origin are explicitly approved. The committed file is an unvalidated proposal, not a deployment instruction.

1. Obtain an explicit non-Free production plan decision; no paid tier is currently approved. Replace `__APPROVED_PRODUCTION_PLAN_REQUIRED__` only in an authorized repository change that also updates the local policy/tests for the selected plan. Validate the resulting Blueprint against Render's schema before any live operation. Review workspace usage and overage safeguards. Render [advises against Free instances for production](https://render.com/docs/free). Free services spin down after 15 idle minutes and can take about a minute to restart. The workspace shares 750 Free instance hours monthly; bandwidth and build pipeline quotas can cause suspension or charges. `plan: free` is not a spending guarantee. Do not change billing settings without separate authorization.
2. Prepare a production-only PostgreSQL database, Google OAuth web client and secrets through an approved private workflow. Local, testing and production must not share databases, OAuth clients or secrets. These Blueprints do not provision databases. Neon is the future database provider, but the production plan and its cost controls are not selected.
3. Set production `APP_ORIGIN` privately to the approved HTTPS origin. Configure that exact origin in Google and its redirect URI as `<approved-origin>/api/auth/callback/google`. Testing retains `https://cairn-testing.onrender.com` and callback `https://cairn-testing.onrender.com/api/auth/callback/google`.
4. In a **separate** authorized Blueprint flow, select this repository, branch `main` and the explicitly approved production Blueprint path (currently the proposal is `deploy/render.production.template.yaml`). Do not submit the unresolved template. Review provider validation and proposed actions. They must affect only the intended production service, never testing. Supply production-only values for the five `sync: false` variables and `APP_ORIGIN` privately; do not invent a production URL or commit values.
5. Set this Blueprint's **Auto Sync** to **No** separately and confirm the production service's automatic deploy trigger remains off. For each authorized deployment, verify `/healthz`, the expected revision, live OAuth, bootstrap administration, second-account approval/revocation and profile persistence after reload. Confirm environment/data isolation before claiming production readiness.

## Evidence limits

Exact testing revision `eb8f66a54dbd6265440f72ffebe4a6be4c900224` passed deployed functional E2E with real Google ID-token sessions, profile persistence and same-session approval/revocation; that revision used Express and does not certify the Start replacement. See [Testing](../../TESTING.md) for evidence and limits. The deployed flow obtains Google ID tokens from refresh tokens; it does not exercise browser redirect/state/PKCE. The historical Express scenario started from an already-approved member. The current uncommitted Start feature adds pending-before-approval and approval-in-existing-session scenarios, but they have not been run against Render or real Google. Render schema/API validation of these files was not run. Blueprint adoption, production provisioning, production OAuth and production data isolation remain unverified. Replacement-gate live proof and required-protection evidence are described above. No live operation or credential entry is performed by `bun run check:blueprints`.
