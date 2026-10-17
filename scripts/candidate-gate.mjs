import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Fixed targets are a safety boundary: workflow event data cannot select
// production or redirect authenticated requests to an arbitrary provider/origin.
const repository = "prumod/cairn-web";
const service = "srv-db5aeujbc2fs73esi140";
const origin = "https://cairn-testing.onrender.com";
export const statusContext = "Deployed company profile E2E";
const trustedSubmissionContext = "Trusted PR submission";
const trustedContributorId = 99197066;
const agentChecksWorkflowId = 379348618;

// CI alone cannot authorize a deployment: candidate workflow changes could
// trigger it on incidental maintainer actions. A base-branch-only submission
// record binds the trusted contributor's opened/synchronize event to this head.
export async function validateCandidate(api, { pr, sha, ciRunId }) {
  if (
    !/^[1-9]\d*$/.test(String(pr)) ||
    !/^[a-f0-9]{40}$/.test(sha ?? "") ||
    !/^\d+$/.test(String(ciRunId))
  )
    throw new Error("A PR number, full candidate SHA, and CI run ID are required.");
  const pull = await api.pull(pr);
  if (
    pull.state !== "open" ||
    pull.draft ||
    pull.base?.ref !== "main" ||
    pull.base?.repo?.full_name !== repository ||
    pull.head?.repo?.full_name !== repository ||
    pull.head.sha !== sha
  )
    throw new Error("Candidate must be the current head of an open same-repository PR to main.");
  const base = (await api.main()).object.sha;
  if (pull.base.sha !== base)
    throw new Error("PR base changed; refresh the PR and request validation again.");
  const comparison = await api.compare(base, sha);
  if (!["ahead", "identical"].includes(comparison.status))
    throw new Error("Update the candidate with current main before requesting validation.");
  if (!/^[a-f0-9]{40}$/.test(pull.merge_commit_sha ?? ""))
    throw new Error("GitHub has not prepared a conflict-free merge candidate.");
  const [head, merge] = await Promise.all([api.commit(sha), api.commit(pull.merge_commit_sha)]);
  if (
    !head.tree?.sha ||
    head.tree.sha !== merge.tree?.sha ||
    merge.parents?.length !== 2 ||
    merge.parents[0].sha !== base ||
    merge.parents[1].sha !== sha
  )
    throw new Error(
      "The checked merge candidate must have the exact head tree and current parents.",
    );
  // GitHub attaches pull_request check runs to the head SHA, although the
  // workflow checks out the synthetic merge. Current main is an ancestor of
  // this immutable head, so the verified identical tree is also what CI tests.
  const checks = await api.checks(sha);
  const check = checks.check_runs?.find(
    (item) => item.name === "Agent checks" && item.app?.slug === "github-actions",
  );
  if (!check || check.status !== "completed" || check.conclusion !== "success")
    throw new Error("Agent checks must pass for the current candidate PR head.");
  const runId = check.details_url?.match(
    /^https:\/\/github\.com\/prumod\/cairn-web\/actions\/runs\/(\d+)(?:\/|$)/,
  )?.[1];
  if (!runId || runId !== String(ciRunId))
    throw new Error("Agent checks does not match the triggering workflow run.");
  const run = await api.run(runId);
  if (
    run.id !== Number(runId) ||
    run.path !== ".github/workflows/checks.yml" ||
    run.workflow_id !== agentChecksWorkflowId ||
    run.event !== "pull_request" ||
    run.head_repository?.full_name !== repository ||
    !run.pull_requests?.some(
      (item) =>
        String(item.number) === String(pr) && item.head?.sha === sha && item.base?.ref === "main",
    ) ||
    run.head_sha !== sha ||
    run.check_suite_id !== check.check_suite?.id ||
    run.status !== "completed" ||
    run.conclusion !== "success"
  )
    throw new Error("Agent checks does not identify the successful candidate PR workflow.");
  await validateTrustedSubmission(api, { pr, sha, base });
  // Attestation may have waited in a separate runner queue. Discard stale
  // preparation/CI snapshots before allowing a deployment or success status.
  const [latestPull, latestMain, latestChecks] = await Promise.all([
    api.pull(pr),
    api.main(),
    api.checks(sha),
  ]);
  const latestCheck = latestChecks.check_runs?.find(
    (item) => item.name === "Agent checks" && item.app?.slug === "github-actions",
  );
  if (
    latestPull.state !== "open" ||
    latestPull.draft ||
    latestPull.head?.sha !== sha ||
    latestPull.base?.sha !== base ||
    latestMain.object.sha !== base ||
    latestCheck?.status !== "completed" ||
    latestCheck?.conclusion !== "success" ||
    latestCheck?.check_suite?.id !== check.check_suite?.id ||
    latestCheck?.details_url !== check.details_url
  )
    throw new Error("Candidate or CI changed while awaiting trusted submission.");
  return { pr: String(pr), sha, base };
}

async function validateTrustedSubmission(api, { pr, sha, base }) {
  // Status publication and workflow completion are separate GitHub operations.
  // Wait for both, without making Render credentials available to this step.
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const status = (await api.statuses(sha)).find(
      (item) => item.context === trustedSubmissionContext,
    );
    if (status) {
      const runId = status.target_url?.match(
        /^https:\/\/github\.com\/prumod\/cairn-web\/actions\/runs\/(\d+)$/,
      )?.[1];
      if (
        status.state !== "success" ||
        status.creator?.login !== "github-actions[bot]" ||
        status.description !== `Trusted PR ${pr} at ${sha} on base ${base}` ||
        !runId
      )
        throw new Error("No trusted submission record authorizes this PR head and base.");
      const run = await api.run(runId);
      // pull_request_target head_sha is the trusted base, not the PR head.
      // The status description binds PR + head + base; the API's pull_requests
      // array is not reliable for this event type.
      if (
        run.id !== Number(runId) ||
        run.path !== ".github/workflows/trusted-pr-submission.yml" ||
        run.event !== "pull_request_target" ||
        run.actor?.id !== trustedContributorId ||
        run.display_title !== `Trusted PR ${pr} at ${sha}` ||
        !/^[a-f0-9]{40}$/.test(run.head_sha ?? "")
      )
        throw new Error("Trusted submission record does not match this PR head and contributor.");
      if (run.status === "completed") {
        const ancestry = await api.compare(run.head_sha, base);
        if (run.conclusion !== "success" || !["ahead", "identical"].includes(ancestry.status))
          throw new Error("Trusted submission did not succeed on main's history.");
        return;
      }
    }
    if (attempt < 59) await api.wait();
  }
  throw new Error("No completed trusted submission record appeared before the deadline.");
}

export async function validateTestingService(api) {
  const current = await api.service();
  if (
    current.id !== service ||
    current.name !== "cairn-testing" ||
    current.repo !== `https://github.com/${repository}` ||
    current.type !== "web_service" ||
    current.suspended !== "not_suspended" ||
    current.autoDeployTrigger !== "off" ||
    current.serviceDetails?.plan !== "free" ||
    current.serviceDetails?.url !== origin
  )
    throw new Error("Testing must be the reviewed Free service with automatic deployment off.");
}

export async function verifyCandidate(api, candidate) {
  const pull = await api.pull(candidate.pr);
  const main = await api.main();
  if (
    pull.state !== "open" ||
    pull.head?.sha !== candidate.sha ||
    pull.base?.sha !== candidate.base ||
    main.object.sha !== candidate.base
  )
    throw new Error("Candidate head or main changed during validation; do not publish success.");
  await validateTestingService(api);
  const health = await api.health();
  if (health.status !== "ready" || health.revision !== candidate.sha)
    throw new Error("Testing no longer serves the exact candidate.");
}

export async function deployCandidate(api, candidate, wait) {
  await validateTestingService(api);
  const deployment = await api.deploy(candidate.sha);
  if (!/^dep-[a-z0-9]+$/.test(deployment.id ?? "") || deployment.commit?.id !== candidate.sha)
    throw new Error("Render did not accept an exact-SHA deployment.");
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const current = await api.deployment(deployment.id);
    if (current.commit?.id !== candidate.sha)
      throw new Error("Render deployment revision changed.");
    if (current.status === "live") return;
    if (
      ["build_failed", "update_failed", "pre_deploy_failed", "canceled", "deactivated"].includes(
        current.status,
      )
    )
      throw new Error("Render candidate deployment failed.");
    await wait();
  }
  throw new Error("Render candidate deployment did not become live within the deadline.");
}

function liveAPI(env) {
  async function request(base, path, token, method = "GET", body) {
    if (!token) throw new Error("Required API credential is missing.");
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    };
    if (body !== undefined) options.body = JSON.stringify(body);
    const response = await fetch(`${base}${path}`, options);
    // Do not include API response bodies: providers can echo credentials/config.
    if (!response.ok) throw new Error(`Provider request failed: HTTP ${response.status}.`);
    return response.json();
  }
  const gh = (path, method, body) =>
    request(
      "https://api.github.com",
      `/repos/${repository}${path}`,
      env.GITHUB_TOKEN,
      method,
      body,
    );
  const render = (path, method, body) =>
    request(
      "https://api.render.com/v1",
      `/services/${service}${path}`,
      env.CAIRN_RENDER_API_KEY,
      method,
      body,
    );
  return {
    pull: (pr) => gh(`/pulls/${pr}`),
    main: () => gh("/git/ref/heads/main"),
    compare: (base, sha) => gh(`/compare/${base}...${sha}`),
    commit: (sha) => gh(`/git/commits/${sha}`),
    checks: (sha) =>
      gh(`/commits/${sha}/check-runs?check_name=Agent%20checks&filter=latest&per_page=100`),
    run: (id) => gh(`/actions/runs/${id}`),
    statuses: (sha) => gh(`/commits/${sha}/statuses`),
    wait: () => new Promise((resolve) => setTimeout(resolve, 10_000)),
    service: () => render(""),
    deploy: (sha) => render("/deploys", "POST", { commitId: sha }),
    deployment: (id) => render(`/deploys/${id}`),
    health: async () => {
      const response = await fetch(`${origin}/healthz`, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error("Testing health request failed.");
      return response.json();
    },
    status: (sha, state, context = statusContext, description = `${context} ${state}`) =>
      gh(`/statuses/${sha}`, "POST", {
        state,
        context,
        description,
        target_url: `https://github.com/${repository}/actions/runs/${env.GITHUB_RUN_ID}`,
      }),
  };
}

async function recordTrustedSubmission(api, { pr, sha, actorId }) {
  if (
    !/^[1-9]\d*$/.test(String(pr)) ||
    !/^[a-f0-9]{40}$/.test(sha ?? "") ||
    String(actorId) !== String(trustedContributorId)
  )
    throw new Error("Only the trusted contributor can attest a valid PR head.");
  const [pull, main] = await Promise.all([api.pull(pr), api.main()]);
  if (
    pull.state !== "open" ||
    pull.draft ||
    pull.base?.ref !== "main" ||
    pull.base?.repo?.full_name !== repository ||
    pull.base?.sha !== main.object.sha ||
    pull.head?.repo?.full_name !== repository ||
    pull.head.sha !== sha
  )
    throw new Error(
      "Trusted submission must match the current head of an open same-repository PR to main.",
    );
  await api.status(
    sha,
    "success",
    trustedSubmissionContext,
    `Trusted PR ${pr} at ${sha} on base ${main.object.sha}`,
  );
  return { pr: String(pr), sha };
}

export async function runGate(command, env, api = liveAPI(env)) {
  if (env.GITHUB_REPOSITORY !== repository)
    throw new Error("The candidate gate must run in this repository.");
  if (command === "attest") {
    if (env.GITHUB_EVENT_NAME !== "pull_request_target" || env.GITHUB_REF !== "refs/heads/main")
      throw new Error(
        "Trusted submission must run from the base-branch pull_request_target workflow.",
      );
    return recordTrustedSubmission(api, {
      pr: env.CAIRN_PR_NUMBER,
      sha: env.CAIRN_CANDIDATE_SHA,
      actorId: env.GITHUB_ACTOR_ID,
    });
  }
  if (env.GITHUB_EVENT_NAME !== "workflow_run" || env.GITHUB_REF !== "refs/heads/main")
    throw new Error(
      "The candidate gate must run from a workflow_run on this repository's main branch.",
    );
  if (command === "prepare") {
    const candidate = await validateCandidate(api, {
      pr: env.CAIRN_PR_NUMBER,
      sha: env.CAIRN_CANDIDATE_SHA,
      ciRunId: env.CAIRN_CI_RUN_ID,
    });
    await api.status(candidate.sha, "pending");
    return candidate;
  }
  const candidate = {
    pr: env.CAIRN_PR_NUMBER,
    sha: env.CAIRN_CANDIDATE_SHA,
    base: env.CAIRN_BASE_SHA,
  };
  if (
    !/^[1-9]\d*$/.test(candidate.pr ?? "") ||
    ![candidate.sha, candidate.base].every((sha) => /^[a-f0-9]{40}$/.test(sha ?? ""))
  )
    throw new Error("Validated candidate outputs are required.");
  if (command === "deploy") {
    const current = await validateCandidate(api, {
      pr: candidate.pr,
      sha: candidate.sha,
      ciRunId: env.CAIRN_CI_RUN_ID,
    });
    if (current.base !== candidate.base) throw new Error("Main changed before deployment.");
    await deployCandidate(
      api,
      candidate,
      () => new Promise((resolve) => setTimeout(resolve, 10_000)),
    );
  } else if (command === "finish") {
    let state = "failure";
    if (env.CAIRN_E2E_OUTCOME === "success") {
      try {
        const current = await validateCandidate(api, {
          pr: candidate.pr,
          sha: candidate.sha,
          ciRunId: env.CAIRN_CI_RUN_ID,
        });
        if (current.base !== candidate.base) throw new Error("Main changed during validation.");
        await verifyCandidate(api, candidate);
        state = "success";
      } catch {
        // Any drift fails closed, but still publish a final failure status.
      }
    }
    await api.status(candidate.sha, state);
    if (state !== "success") throw new Error("Candidate E2E failed or the candidate changed.");
  } else {
    throw new Error("Expected prepare, deploy, or finish.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await runGate(process.argv[2], process.env);
    if (result) {
      if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT is required.");
      const outputs = [`sha=${result.sha}`, `pr=${result.pr}`];
      if (result.base) outputs.push(`base=${result.base}`);
      appendFileSync(process.env.GITHUB_OUTPUT, `${outputs.join("\n")}\n`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
