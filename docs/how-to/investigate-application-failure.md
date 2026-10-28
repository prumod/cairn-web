# Investigate an application failure

Use this sequence to investigate a failed company-profile save without collecting company data or credentials. Run shell commands from the repository root. You need the affected stage, an approximate UTC time, and read access to that stage's Worker observability. Production browser events additionally need access to the intended PostHog EU project. The public `POSTHOG_PROJECT_TOKEN` sends events; it cannot query them.

## Reproduce and locate the request

1. Record whether the report concerns `testing` (`https://cairn-testing.prumod.eu`) or `production` (`https://cairn.prumod.eu`). Set the target explicitly, for example:

   ```sh
   CAIRN_DIAGNOSTIC_ORIGIN=https://cairn-testing.prumod.eu
   curl --silent --show-error --include "$CAIRN_DIAGNOSTIC_ORIGIN/healthz"
   ```

   Record the UTC time, HTTP status, `X-Request-ID`, and `revision` when returned. Readiness success is 200; database execution failure is 503; runtime/configuration failure is 500. An absent header can indicate a different revision or a response outside the instrumented application handlers. Health proves neither Google OAuth nor analytics ingestion. Compare the revision to the intended candidate before drawing conclusions.

2. In the affected browser session, repeat the profile save once with synthetic data where practical. Use the browser Network panel to record only the failed `PUT /api/company-profile` status and response `X-Request-ID`. Do not export a HAR, copy cookies/authorization, or attach the request body. The application retains this header on `ApiError`; it does not display a diagnostic ID in the current error UI.

3. Open the affected Worker's logs in Cloudflare observability. Select a narrow time range around the attempt and search for the exact UUID. For the structured application log, filter `event` to `request_failed`, `operation` to `save_company_profile`, `requestId` to the UUID, and `revision` to the observed revision. The field is camel-case `requestId` in Worker logs, whereas PostHog uses `request_id`. Field nesting in the provider UI must be checked against an ingested record. The application log has no stage property, so select the correct Worker first.

   Inspect `errorType`, `durationMs`, and sanitized `stack`. Raw exception messages and full paths are deliberately absent; recognized frames retain only function, basename, line, and column, at most five frames. A returned 401/403 or other expected response has a request ID but no `request_failed` application error. Invalid JSON returns 400 without logging its input. For readiness failures use operation `health`. Do not deliberately break production credentials to create an error.

4. For production, locate the same UTC window in PostHog EU. Filter event `company_profile_save_failed` by property `request_id` equal to the UUID, and inspect `status`. Review preceding `company_profile_viewed`, `company_profile_save_attempted`, and any `company_profile_save_succeeded` events for the opaque user ID. IDs are internal user IDs, not email addresses. Successful logout resets identity. Network failures without an HTTP response may have neither status nor request ID. Testing and local development intentionally send no PostHog events despite testing's `APP_ENV=production`.

5. If a recording is available, verify masking with synthetic values before using recordings for investigation: text, inputs, and element attributes must be masked; hidden/file inputs, images, video, and canvas blocked; request bodies, headers, and browser console excluded. Check that ordinary event URL/referrer metadata is absent and recorded network names contain origins only. These controls are configured in source but actual hosted replay behavior remains unverified. Browser exceptions are generic and may include a same-origin asset basename with line/column, not the original error message.

6. In Cloudflare, look for the platform invocation/trace in the same Worker, time window, and operation context. Alchemy declares logs/traces with head sampling `1`, but there is no application-created trace ID or automatic cross-provider link. Do not treat the request UUID as a platform trace ID. The Vite `ssr` build generates server source maps; a local build produced maps under `apps/web/dist/server` and none under `apps/web/dist/client`. Alchemy's map upload and usable original-source frames in Cloudflare remain unverified. The sanitized application stack contains strings, which may not be remapped by Cloudflare. Live replay/event/log/trace correlation also remains unverified.

Expected result: a report containing stage, revision, UTC window, operation, HTTP status, request ID, and sanitized findings, with each missing signal stated. Do not include tokens, emails, profile data, or local Alchemy state.

## Confirm analytics configuration without printing its token

After choosing the target above, this check reports only whether configuration is null and whether a returned host/token format matches the browser contract:

```sh
curl --fail --silent --show-error "$CAIRN_DIAGNOSTIC_ORIGIN/api/analytics-config" |
  python3 -c 'import json,sys; c=json.load(sys.stdin); print({"enabled": c is not None, "eu_host": isinstance(c,dict) and c.get("host")=="https://eu.i.posthog.com", "token_format": isinstance(c,dict) and isinstance(c.get("token"),str) and __import__("re").fullmatch(r"phc_[A-Za-z0-9]+",c["token"]) is not None})'
```

Testing/dev/test should return null (`enabled: False`). Production should return a matching EU host and token format. This checks public configuration, not ingestion, project permissions, recordings, or provider billing. Do not paste the endpoint's raw JSON into reports.

## API and agent query limits

The local implementation and test definitions establish the request-ID/header contract and configured SDK options. Earlier live `/healthz`, OAuth, and profile checks are recorded in [Run the company profile](run-company-profile.md#verification-and-deployment-limits) for a specific older revision. They do not verify these observability changes. No authenticated Cloudflare log/trace query, PostHog event/replay query, or observability MCP tool has been verified by this documentation task.

API/MCP automation is a proposed next step: verify a currently available read-only query interface and its actual schema against one known request before automating it. Scope credentials to the relevant account/project and read access; keep them outside the browser configuration and repository. Use the same Worker/time/revision/request-ID filters above. Do not assume a tool name, API route, global credential location, project ID, or trace correlation capability. No deployment or destroy command is part of this investigation. For any later deployment, follow the existing explicit stage-approval and local-state preparation policy in the deployment guide.
