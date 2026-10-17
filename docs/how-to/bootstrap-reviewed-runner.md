# Run the reviewed runner bootstrap (unapproved proposal)

**Preparation only. Do not execute these remote steps without explicit security-policy approval. Never merge `bootstrap/63-reviewed-runner` into `main`.**

This proposal lets an explicitly reviewed immutable runner validate repair PR #79 when the current main runner cannot validate its own repair. Required merge contexts, application security limits, all four scenarios, cleanup, serialization and candidate drift checks remain intact. No automatic merge, production, provisioning or spending is included.

## Preconditions and limits

- The user approves the final full runner commit SHA, the pinned candidate `7b1687cd39bb45e4a03cef586302fcf96038e06f` in PR #79, and this temporary environment exception. A dispatch input alone is not proof of human review.
- The bootstrap branch contains PR #79's reviewed helper plus only the workflow/guard/tests and this runbook. Review the complete diff from `main`, lockfile and executable scripts, not only this file. Any code change requires a new review SHA.
- `main` remains `40abb4d66a8fdfe460d2ee7a0109cbe9399613ca`; PR #79 must remain open at the pinned head and pass `Agent checks`. If either changes, stop and re-plan rather than broaden the pin.
- Existing `cairn-testing-e2e` policy is custom branches, with only `main` allowed (policy ID `63264276`). Verify this live before changing it. Never change required main checks or remove its main policy.
- Native GitHub environment policy restricts a branch name, not an immutable SHA. The workflow and CLI guard require the operator-reviewed SHA to equal the actual event SHA; these checks do not defend against a malicious maintainer replacing the workflow itself during the temporary window. Keep the window short, verify the remote branch head immediately before dispatch and the run's head SHA immediately afterward, and coordinate exclusive use. The operator's exact-code review is the trust decision.
- The existing testing service stays Free, auto-deploy off, same ID/origin. Credentials remain in the existing protected environment; never read/copy their values or send them to local code.

## Authorized execution sequence

1. Record the final reviewed runner SHA and verify remote `bootstrap/63-reviewed-runner` has exactly that head. Run local/full checks and inspect proposed workflow/guard changes before approval. Do not execute a changed head under an earlier approval.
2. Save non-secret snapshots of the environment branch policy, main required checks and PR #79 head/base/checks. Confirm no other testing gate is queued/running and coordinate other sessions. Preserve these snapshots as restoration evidence.
3. Under the specific security approval, add one branch deployment policy for `bootstrap/63-reviewed-runner` to environment `cairn-testing-e2e`; record the returned new policy ID immediately. Do not add wildcards, protected-branches fallback, other branches, secrets or users. Do not change main protection.
4. Dispatch the existing workflow from that exact branch using the approved SHA input and pinned repair target:

   ```sh
   gh workflow run deployed-e2e.yml \
     --repo prumod/cairn-web \
     --ref bootstrap/63-reviewed-runner \
     -f pr_number=79 \
     -f candidate_sha=7b1687cd39bb45e4a03cef586302fcf96038e06f \
     -f reviewed_runner_sha="$APPROVED_RUNNER_SHA"
   ```

   `APPROVED_RUNNER_SHA` is the non-secret full reviewed commit, not a credential. Verify the resulting run event/ref/head SHA before relying on its result. Do not retry a timeout until the run is identified.

5. Monitor the genuine gate: candidate CI/ancestry/tree validation, fixed Free-service validation, exact candidate deployment and health, four Google scenarios with baseline restoration/session invalidation, final drift check, actual status publication. Only the pinned #79 candidate can use this bootstrap path. Failed E2E must publish failure, never a synthetic success.
6. On success, failure, cancellation or an execution error, remove only the newly created environment branch-policy ID and read back that only the original main policy remains. Use a local `finally`/shell `trap` or equivalent; an interrupted operator must recover from the recorded policy ID. If cleanup fails, make restoration the highest-priority blocker and do not leave the exception open silently. Preserve snapshots/read-back; do not claim restoration from tool success alone.
7. Confirm main protection is unchanged and the test sessions/baseline were restored. Preserve the run URL and exact runner/candidate SHA relationship. If HTTP 429 handling resolves the suite, record that live evidence; otherwise use the status-only error to continue diagnosis without weakening security.
8. Only after all required checks genuinely pass, ask separately for merge approval for **PR #79**, not the bootstrap branch. After an authorized merge, incorporate main into Start PR #75 and validate its fresh exact SHA using the ordinary main-only workflow. The bootstrap branch must never be merged; remote deletion also requires separate approval.

## Remote API targets for the approved operator

The following are operation references, not authorization to execute:

- Read policy: `GET /repos/prumod/cairn-web/environments/cairn-testing-e2e/deployment-branch-policies`.
- Add the sole temporary policy: `POST` to that path with JSON `{ "name": "bootstrap/63-reviewed-runner", "type": "branch" }`.
- Restore: `DELETE /repos/prumod/cairn-web/environments/cairn-testing-e2e/deployment-branch-policies/{NEW_POLICY_ID}`. Never delete `63264276`.
- Read main checks: `GET /repos/prumod/cairn-web/branches/main/protection/required_status_checks`.

## Observed diagnosis

Runs `39017220652` (Start) and `39018105101` (Express) passed deployment/health and pending denial, then failed three later sign-ins. The old runner omitted HTTP status. Read-only Render logs for the Express run warn that Better Auth could not determine a client IP and fell back to one shared per-path rate-limit bucket. A local production-enabled probe returned HTTP 429 on the fourth rapid sign-in request with `X-Retry-After: 10`. These facts strengthen the rate-limit explanation but do not independently prove the hidden live rejection status. No auth/header/proxy settings are changed by this proposal.
