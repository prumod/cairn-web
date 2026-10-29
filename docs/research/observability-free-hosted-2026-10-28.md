# Free hosted observability for Cairn

**Research date:** 2026-10-28  
**Scope:** Technical fit and current public free-tier limits for one client that requires managed services and cannot self-host. Pricing and plan terms are time-sensitive; verify them again before implementation.

## Finding

Use PostHog Cloud Free for small, explicit product analytics and carefully masked browser session replay. Use Cloudflare Workers' built-in observability for application logs, platform metrics, and low-volume traces. Keep the pipeline within each provider; do not add Grafana, ClickStack, or an export pipeline. Treat this as a proposed fit, not a verified free-running deployment: one client does not establish actual event or log volume.

## Confirmed in this checkout

- `packages/infra/alchemy.run.ts` deploys `Cloudflare.Website.Vite("web", ...)`, sets compatibility date `2026-10-09` and `nodejs_compat`, binds `GIT_SHA`, and provisions `Neon.Project`. `packages/infra/package.json` pins Alchemy `2.0.0-beta.83`.
- The installed Alchemy package source is not in this checkout. The inspected source is the published [Alchemy 2.0.0-beta.83 archive](https://registry.npmjs.org/alchemy/2.0.0-beta.83), read without modifying the checkout. `Website/Vite.ts` extends `WorkerProps`. `Workers/Worker.ts` documents defaults for enabled Workers Logs and invocation logs, with traces disabled unless opted in. `Workers/WorkerAsyncBindings.ts` resolves omitted settings to enabled logging and invocation logs. Thus current IaC relies on defaults; it does not configure observability explicitly.
- `apps/web/src/server/application.server.ts` catches request failures, writes only `Request failed.`, then returns a generic 500. The health check runs `SELECT 1`; its database-failure branch returns 503 without logging the caught error. Runtime config exposes the deployment revision. These paths currently lack useful correlated failure context.
- `apps/web/vite.config.ts` does not set sourcemap options. No PostHog dependency or configuration was found. Source-map generation and upload are unverified.
- Integration support provisions an isolated database and Worker with controlled test identities. Its captured process output retains only the last 40 chunks. This is useful fixture infrastructure, but does not itself prove an observability test exists.
- `packages/infra/src/deployment.ts` sets `appEnv: "production"` for both hosted stages. Product analytics must be gated by the actual deployment stage, not by `APP_ENV` or Vite production mode, so testing traffic does not pollute the one production analytics project.

Pinned dependency evidence: [Alchemy 2.0.0-beta.83 package metadata](https://registry.npmjs.org/alchemy/2.0.0-beta.83) identifies the exact published source archive inspected. Dependency defaults establish what this version intends to deploy, not the settings of an existing live Worker.

## Public service facts checked on 2026-10-28

- Cloudflare's pricing page, updated Oct 25, says that from **Dec 1, 2026**, Free includes 0.5 GB/day ingestion and seven-day retention across listed logs and traces. Cloudflare stops Free ingestion at the daily cap until 00:00 UTC. This replaces the older Workers Logs figures (200,000 logs/day and three-day retention), so budget against the Dec 1 terms and recheck if deploying earlier. These allowances are account-level and shared across listed data sources; free does not mean unlimited. [Cloudflare Observability pricing](https://developers.cloudflare.com/observability/pricing/) [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- Workers Traces is the native trace channel and can be enabled on the Worker; sampling and persistence are configurable. The Workers Query Builder documents programmatic queries against stored Workers Logs. Trace retrieval through agent tools must be verified separately. The Cloudflare MCP repository recommends its API MCP server and marks the former Observability MCP server as deprecated. [Workers Traces](https://developers.cloudflare.com/workers/observability/traces/) [Workers Query Builder](https://developers.cloudflare.com/workers/observability/query-builder/) [Cloudflare MCP server](https://github.com/cloudflare/mcp-server-cloudflare)
- PostHog lists monthly free allowances of 1M analytics events, 5K session recordings, and 100K exceptions, with no card required. Those caps reset monthly; caps and what happens at them must be checked during account setup, and no account was inspected here. [PostHog pricing](https://posthog.com/pricing)
- PostHog documents TanStack Start browser initialization and event capture, alongside a separate `posthog-node` server SDK example. Since Cairn runs server code in a Cloudflare Worker, do not copy the Node server SDK setup without verifying Worker compatibility. Browser analytics/replay still requires an application change, project configuration, and CSP review if applicable. [PostHog TanStack Start guide](https://posthog.com/docs/libraries/tanstack-start)

## Minimal implementation proposal

1. Make Cloudflare observability settings explicit in the existing Alchemy Worker configuration: retain logs and invocation logs, then opt into low-volume trace sampling after confirming the pinned provider behavior and account controls. Prefer native Cloudflare logs, metrics, and traces.
2. Replace the generic server failure log with sanitized structured context: request ID, deployment revision, duration, and a bounded operation name or error category. Preserve the underlying exception for diagnosis without logging request bodies, credentials, session data, or personal data. Add equivalent context to the health-check database failure.
3. Add a small set of explicit PostHog browser events for meaningful product actions and enable replay only with masking/redaction appropriate for auth and company-profile fields. Enable capture only for the real production stage, use opaque user IDs rather than emails, and reset identity at logout. Configure a managed PostHog project and browser key; account creation and project provisioning through IaC have not been demonstrated. Only expose explicitly public browser configuration, never the server environment wholesale. Update the existing privacy page to describe the actual collection before enabling production capture.
4. Give agent workflows read-only query access to Cloudflare's native observability APIs/MCP. Do not grant mutation authority for diagnosis.
5. Reuse the isolated integration fixtures to create one controlled failure and verify its structured log/trace can be queried and tied to the deployed revision. Confirm source-map generation and upload separately before promising source-level stack traces.

## Unknowns and decision boundary

No Cloudflare or PostHog account, deployed environment, quotas, auth configuration, ingest volume, retention behavior, or cost controls were inspected. IaC's ability to manage Worker settings and bindings is visible, but automated creation of a PostHog account/project is not proven. Neither source-map upload nor end-to-end error correlation has been tested. The proposal is suitable to implement as a small first slice; it is not evidence that the service will remain inside free limits for the client's traffic.

## Subsequent read-only desktop verification (2026-10-28)

The earlier account-access limitation above was partially resolved through the user's existing Chrome desktop session:

- Opened the production Worker identified by its `cairn.prumod.eu` custom domain. Its overview showed Workers Logs enabled and Workers Traces disabled.
- Production overview showed 334 invocations and zero errors for the selected last-24-hours window. This is a snapshot, not a traffic forecast or ingestion-volume measurement.
- Its Observability Events page explicitly stated the account was on the free plan with 200K events/day. The last-hour selection showed no events. Historical retention, trace enablement, and API authorization were not tested.
- PostHog EU opened at its login page. This establishes only that this browser was not authenticated there; it does not establish whether the user has an account or which plan it uses.
- No production settings, subscription, capture settings, or account permissions were changed.
