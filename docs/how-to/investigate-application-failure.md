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

5. If a recording is available, verify masking with synthetic values before using recordings for investigation: text, inputs, and element attributes must be masked; hidden/file inputs, images, video, and canvas blocked; request bodies, headers, and browser console excluded. Check that ordinary event URL/referrer metadata is absent and recorded network names contain origins only. These controls are configured in source. In one hosted replay canary, an unsaved synthetic company name and other form text rendered as masked characters. Its activity panel showed `Company_profile_viewed` and `Identify`, with zero recorded clicks, keystrokes, or exceptions. This confirms visible replay output and those activity-panel values for that sample; the raw snapshot and network payload were not audited. `maskAllElementAttributes` also removes class and ID attributes, which reduced visual fidelity and left the replay unstyled. Browser exceptions are generic and may include a same-origin asset basename with line/column, not the original error message.

6. In Cloudflare, look for the platform invocation/trace in the same Worker, time window, and operation context. Alchemy declares logs/traces with head sampling `1`, but there is no application-created trace ID or automatic PostHog-to-Cloudflare link. Do not treat the request UUID as a platform trace ID. Testing-stage REST queries have matched health-event trace IDs to trace summaries: an earlier query matched seven; a later query on 2026-10-28 returned two events, two traces, and two matching trace IDs in its 30-minute window. This verifies query access and trace availability for those events, not a successful application's `X-Request-ID` to platform-event correlation.

   The Vite `ssr` build generates server source maps; a local build produced maps under `apps/web/dist/server` and none under `apps/web/dist/client`. Pinned Alchemy includes emitted `.map` files in the Cloudflare Workers script upload as `application/source-map`, a supported upload part ([Cloudflare example](https://github.com/cloudflare/cloudflare-python/blob/main/examples/workers/script_upload.py)). The merged testing deployment confirmed the map upload path. Live acceptance and mapped original-source frames remain unverified. Cloudflare maps uncaught exception stacks after the Worker finishes; `Error.stack` read or logged inside the Worker stays unmapped ([source-map behavior](https://developers.cloudflare.com/workers/observability/source-maps/)). Cairn's sanitized `safeFrames` field is a string array, so it must not be treated as source-mapped. Cross-provider correlation between PostHog replays/events and Cloudflare logs/traces remains unverified.

Expected result: a report containing stage, revision, UTC window, operation, HTTP status, request ID, and sanitized findings, with each missing signal stated. Do not include tokens, emails, profile data, or local Alchemy state.

## Confirm analytics configuration without printing its token

After choosing the target above, this check reports only whether configuration is null and whether a returned host/token format matches the browser contract:

```sh
curl --fail --silent --show-error "$CAIRN_DIAGNOSTIC_ORIGIN/api/analytics-config" |
  python3 -c 'import json,sys; c=json.load(sys.stdin); print({"enabled": c is not None, "eu_host": isinstance(c,dict) and c.get("host")=="https://eu.i.posthog.com", "token_format": isinstance(c,dict) and isinstance(c.get("token"),str) and __import__("re").fullmatch(r"phc_[A-Za-z0-9]+",c["token"]) is not None})'
```

Testing/dev/test should return null (`enabled: False`). Production should return a matching EU host and token format. This checks public configuration, not ingestion, project permissions, recordings, or provider billing. Do not paste the endpoint's raw JSON into reports.

## Query Cloudflare events and traces

The account's Workers Observability token is stored at `~/.config/cairn/cloudflare-observability-token` with mode `0600`. It has the account-scoped Workers Observability Edit permission; Cloudflare requires this write permission for the telemetry query API, even for a dry query. Keep the token outside the repository and do not print it. Use the dashboard or your environment to find the account ID and the affected stage's Worker name. From the repository root, set both values and query the last hour:

```sh
export CAIRN_ACCOUNT_ID='<Cloudflare account ID>'
export CAIRN_WORKER_NAME='<testing Worker name>'
python3 - <<'PY'
import json, os, time, urllib.error, urllib.request
from pathlib import Path

account = os.environ['CAIRN_ACCOUNT_ID']
worker = os.environ['CAIRN_WORKER_NAME']
token = (Path.home() / '.config/cairn/cloudflare-observability-token').read_text().strip()
now = int(time.time() * 1000)
url = f'https://api.cloudflare.com/client/v4/accounts/{account}/workers/observability/telemetry/query'

def query(view):
    payload = {
        'queryId': 'cairn-safe-health-audit',
        'timeframe': {'from': now - 3600000, 'to': now},
        'dry': True,
        'limit': 200,
        'view': view,
        'parameters': {'datasets': ['cloudflare-workers'], 'needle': {'value': worker}},
    }
    request = urllib.request.Request(url, data=json.dumps(payload).encode(), method='POST',
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.load(response)
    except urllib.error.HTTPError as error:
        raise SystemExit(f'Cloudflare {view} query failed: HTTP {error.code}') from None
    if not body.get('success'):
        raise SystemExit(f'Cloudflare {view} query was not successful')
    return body['result']

events_result, traces_result = query('events'), query('traces')
events = events_result.get('events', {}).get('events', [])
traces = traces_result.get('traces', [])
event_ids = {e.get('$metadata', {}).get('traceId') or e.get('$metadata.traceId') for e in events}
trace_ids = {t.get('traceId') for t in traces}
print({'events': len(events), 'traces': len(traces),
       'matched_trace_ids': len((event_ids & trace_ids) - {None})})
PY
```

The example prints counts only; it does not print the token or raw telemetry, which may contain sensitive data. It limits each view to 200 results, so matching counts are not a complete audit. Adjust the time window and Worker for the report. The endpoint accepts `view` at the top level: `events` and `traces` are separate queries. Compare Cloudflare's event `$metadata.traceId` with a trace summary's `traceId`; do not equate those IDs with the application's `X-Request-ID`. This query was verified for testing health events and traces, not for a failed company-profile save or PostHog replay. No authenticated PostHog event/replay query or observability MCP tool is verified here.
