import assert from "node:assert/strict";
import { test } from "node:test";
import { deployCandidate, runGate } from "./candidate-gate.mjs";

const sha = "a".repeat(40);
const base = "b".repeat(40);
const merge = "c".repeat(40);
const tree = "d".repeat(40);

function fixture() {
  const env = {
    GITHUB_REPOSITORY: "prumod/cairn-web",
    GITHUB_EVENT_NAME: "workflow_run",
    GITHUB_REF: "refs/heads/main",
    GITHUB_ACTOR_ID: "99197066",
    CAIRN_PR_NUMBER: "73",
    CAIRN_CANDIDATE_SHA: sha,
    CAIRN_CI_RUN_ID: "42",
    CAIRN_BASE_SHA: base,
    CAIRN_E2E_OUTCOME: "success",
  };
  const pull = {
    state: "open",
    draft: false,
    head: { sha, repo: { full_name: "prumod/cairn-web" } },
    base: { sha: base, ref: "main", repo: { full_name: "prumod/cairn-web" } },
    merge_commit_sha: merge,
  };
  const checks = {
    check_runs: [
      {
        name: "Agent checks",
        status: "completed",
        conclusion: "success",
        app: { slug: "github-actions" },
        check_suite: { id: 12 },
        details_url: "https://github.com/prumod/cairn-web/actions/runs/42/job/1",
      },
    ],
  };
  const run = {
    id: 42,
    path: ".github/workflows/checks.yml",
    workflow_id: 379348618,
    event: "pull_request",
    head_sha: sha,
    head_repository: { full_name: "prumod/cairn-web" },
    pull_requests: [{ number: 73, head: { sha }, base: { ref: "main" } }],
    check_suite_id: 12,
    status: "completed",
    conclusion: "success",
  };
  const submissionRun = {
    id: 43,
    path: ".github/workflows/trusted-pr-submission.yml",
    event: "pull_request_target",
    // REST run metadata reports the PR head, unlike the runner's GITHUB_SHA.
    head_sha: sha,
    display_title: `Trusted PR 73 at ${sha}`,
    pull_requests: [{ number: 73, head: { sha }, base: { ref: "main", sha: base } }],
    status: "completed",
    conclusion: "success",
    actor: { id: 99197066, login: "TiagoJacinto" },
    triggering_actor: { id: 12345, login: "untrusted-rerunner" },
  };
  const submissionStatus = {
    context: "Trusted PR submission",
    state: "success",
    description: `Trusted PR 73 at ${sha} on base ${base}`,
    creator: { login: "github-actions[bot]" },
    target_url: "https://github.com/prumod/cairn-web/actions/runs/43",
  };
  const service = {
    id: "srv-db5aeujbc2fs73esi140",
    name: "cairn-testing",
    repo: "https://github.com/prumod/cairn-web",
    type: "web_service",
    suspended: "not_suspended",
    autoDeployTrigger: "off",
    serviceDetails: { plan: "free", url: "https://cairn-testing.onrender.com" },
  };
  const statuses = [];
  const deployments = [];
  const api = {
    pull: async () => pull,
    main: async () => ({ object: { sha: base } }),
    compare: async () => ({ status: "ahead" }),
    commit: async (id) => ({
      tree: { sha: tree },
      parents: id === merge ? [{ sha: base }, { sha }] : [],
    }),
    // Mirrors GitHub: the PR's check run is attached to its head, not merge SHA.
    checks: async (revision) => (revision === sha ? checks : { check_runs: [] }),
    run: async (id) => (String(id) === "42" ? run : submissionRun),
    statuses: async () => [submissionStatus],
    wait: async () => {},
    service: async () => service,
    health: async () => ({ status: "ready", revision: sha }),
    status: async (revision, state, context, description) => {
      statuses.push({
        revision,
        state,
        ...(context ? { context } : {}),
        ...(description ? { description } : {}),
      });
    },
    deploy: async (revision) => {
      deployments.push(revision);
      return { id: "dep-123", commit: { id: revision } };
    },
    deployment: async () => ({ status: "live", commit: { id: sha } }),
  };
  return {
    env,
    api,
    pull,
    checks,
    run,
    submissionRun,
    submissionStatus,
    service,
    statuses,
    deployments,
  };
}

test("observed PR-target REST head SHA authorizes the candidate without comparing it backwards to main", async () => {
  const f = fixture();
  f.api.compare = async (from, to) => {
    assert.equal(from, base);
    assert.equal(to, sha);
    return { status: "ahead" };
  };
  assert.deepEqual(await runGate("prepare", f.env, f.api), { pr: "73", sha, base });
  assert.deepEqual(f.statuses, [{ revision: sha, state: "pending" }]);
  assert.deepEqual(f.deployments, []);
});

test("the base-branch attestation records a trusted contributor's current PR head", async () => {
  const f = fixture();
  f.env.GITHUB_EVENT_NAME = "pull_request_target";
  assert.deepEqual(await runGate("attest", f.env, f.api), { pr: "73", sha });
  assert.deepEqual(f.statuses, [
    {
      revision: sha,
      state: "success",
      context: "Trusted PR submission",
      description: `Trusted PR 73 at ${sha} on base ${base}`,
    },
  ]);
  assert.deepEqual(f.deployments, []);
});

test("the gate waits for both status publication and attestation run completion", async () => {
  const f = fixture();
  let reads = 0;
  let waits = 0;
  f.api.statuses = async () => (++reads === 1 ? [] : [f.submissionStatus]);
  f.submissionRun.status = "in_progress";
  f.api.wait = async () => {
    waits += 1;
    if (waits === 2) f.submissionRun.status = "completed";
  };
  assert.deepEqual(await runGate("prepare", f.env, f.api), { pr: "73", sha, base });
  assert.equal(waits, 2);
});

test("head, base, or CI drift while awaiting attestation prevents deployment", async () => {
  for (const mutate of [
    (f) => {
      f.pull.head.sha = base;
    },
    (f) => {
      f.api.main = async () => ({ object: { sha } });
    },
    (f) => {
      f.checks.check_runs[0].conclusion = "failure";
    },
  ]) {
    const f = fixture();
    let waiting = true;
    f.api.statuses = async () => (waiting ? [] : [f.submissionStatus]);
    f.api.wait = async () => {
      waiting = false;
      mutate(f);
    };
    await assert.rejects(runGate("deploy", f.env, f.api));
    assert.deepEqual(f.deployments, []);
  }
});

test("a trusted rerunner cannot authorize another account's submission", async () => {
  const f = fixture();
  f.submissionRun.actor.id = 12345;
  f.submissionRun.triggering_actor.id = 99197066;
  await assert.rejects(runGate("prepare", f.env, f.api));
  assert.deepEqual(f.deployments, []);
});

test("an untrusted account cannot attest a PR head", async () => {
  const f = fixture();
  f.env.GITHUB_EVENT_NAME = "pull_request_target";
  f.env.GITHUB_ACTOR_ID = "12345";
  await assert.rejects(runGate("attest", f.env, f.api));
  assert.deepEqual(f.statuses, []);
  assert.deepEqual(f.deployments, []);
});

test("a stale or draft PR cannot receive a trusted submission status", async () => {
  for (const mutate of [
    (f) => {
      f.pull.head.sha = base;
    },
    (f) => {
      f.pull.draft = true;
    },
    (f) => {
      f.pull.base.sha = "e".repeat(40);
    },
  ]) {
    const f = fixture();
    f.env.GITHUB_EVENT_NAME = "pull_request_target";
    mutate(f);
    await assert.rejects(runGate("attest", f.env, f.api));
    assert.deepEqual(f.statuses, []);
  }
});

const rejected = [
  [
    "a workflow run from candidate code",
    (f) => {
      f.env.GITHUB_REF = "refs/heads/feature";
    },
  ],
  [
    "a PR event instead of the successful CI event",
    (f) => {
      f.env.GITHUB_EVENT_NAME = "pull_request";
    },
  ],
  [
    "a manual dispatch instead of the successful CI event",
    (f) => {
      f.env.GITHUB_EVENT_NAME = "workflow_dispatch";
    },
  ],
  [
    "a different repository",
    (f) => {
      f.env.GITHUB_REPOSITORY = "other/repo";
    },
  ],
  [
    "an invalid PR number",
    (f) => {
      f.env.CAIRN_PR_NUMBER = "1/../../other";
    },
  ],
  [
    "an abbreviated SHA",
    (f) => {
      f.env.CAIRN_CANDIDATE_SHA = "aaaaaaa";
    },
  ],
  [
    "a malformed triggering CI run ID",
    (f) => {
      f.env.CAIRN_CI_RUN_ID = "42; malicious input";
    },
  ],
  [
    "a closed PR",
    (f) => {
      f.pull.state = "closed";
    },
  ],
  [
    "a draft PR",
    (f) => {
      f.pull.draft = true;
    },
  ],
  [
    "a fork",
    (f) => {
      f.pull.head.repo.full_name = "other/repo";
    },
  ],
  [
    "a different base branch",
    (f) => {
      f.pull.base.ref = "release";
    },
  ],
  [
    "a newer head",
    (f) => {
      f.pull.head.sha = "e".repeat(40);
    },
  ],
  [
    "a stale base",
    (f) => {
      f.pull.base.sha = "e".repeat(40);
    },
  ],
  [
    "a head behind main",
    (f) => {
      f.api.compare = async () => ({ status: "diverged" });
    },
  ],
  [
    "an unavailable merge commit",
    (f) => {
      f.pull.merge_commit_sha = null;
    },
  ],
  [
    "a different checked tree",
    (f) => {
      f.api.commit = async (id) => ({ tree: { sha: id }, parents: [{ sha: base }, { sha }] });
    },
  ],
  [
    "a merge for a stale head",
    (f) => {
      f.api.commit = async () => ({ tree: { sha: tree }, parents: [{ sha: base }, { sha: base }] });
    },
  ],
  [
    "failed CI",
    (f) => {
      f.checks.check_runs[0].conclusion = "failure";
    },
  ],
  [
    "incomplete CI",
    (f) => {
      f.checks.check_runs[0].status = "in_progress";
    },
  ],
  [
    "missing CI",
    (f) => {
      f.checks.check_runs = [];
    },
  ],
  [
    "a different CI workflow with the expected name",
    (f) => {
      f.run.workflow_id = 123;
    },
  ],
  [
    "a CI run from a fork",
    (f) => {
      f.run.head_repository.full_name = "untrusted/fork";
    },
  ],
  [
    "a run associated with a different PR",
    (f) => {
      f.run.pull_requests[0].number = 74;
    },
  ],
  [
    "a run associated with a different PR head",
    (f) => {
      f.run.pull_requests[0].head.sha = base;
    },
  ],
  [
    "a run associated with a different base branch",
    (f) => {
      f.run.pull_requests[0].base.ref = "release";
    },
  ],
  [
    "a missing trusted submission record",
    (f) => {
      f.api.statuses = async () => [];
    },
  ],
  [
    "a trusted submission status for an older base",
    (f) => {
      f.submissionStatus.description = `Trusted PR 73 at ${sha} on base ${sha}`;
    },
  ],
  [
    "a failed latest trusted submission record",
    (f) => {
      f.submissionStatus.state = "failure";
    },
  ],
  [
    "a submission record from another status creator",
    (f) => {
      f.submissionStatus.creator.login = "someone-else";
    },
  ],
  [
    "a forged trusted submission URL",
    (f) => {
      f.submissionStatus.target_url = "https://example.com/actions/runs/43";
    },
  ],
  [
    "a trusted submission status pointing at another run",
    (f) => {
      f.submissionStatus.target_url = "https://github.com/prumod/cairn-web/actions/runs/44";
    },
  ],
  [
    "a trusted submission from another workflow",
    (f) => {
      f.submissionRun.path = ".github/workflows/other.yml";
    },
  ],
  [
    "a trusted submission from another event",
    (f) => {
      f.submissionRun.event = "pull_request";
    },
  ],
  [
    "a trusted submission from another account",
    (f) => {
      f.submissionRun.actor.id = 12345;
    },
  ],
  [
    "a trusted submission associated with another PR",
    (f) => {
      f.submissionRun.display_title = `Trusted PR 74 at ${sha}`;
    },
  ],
  [
    "a trusted submission associated with another head",
    (f) => {
      f.submissionRun.display_title = `Trusted PR 73 at ${base}`;
    },
  ],
  [
    "a trusted submission run for another head SHA",
    (f) => {
      f.submissionRun.head_sha = "e".repeat(40);
    },
  ],
  [
    "an unrelated workflow with the same check name",
    (f) => {
      f.run.path = ".github/workflows/other.yml";
    },
  ],
  [
    "a check from a different app",
    (f) => {
      f.checks.check_runs[0].app.slug = "other";
    },
  ],
  [
    "a forged check URL",
    (f) => {
      f.checks.check_runs[0].details_url = "https://example.com/42";
    },
  ],
  [
    "a different workflow run from the event",
    (f) => {
      f.env.CAIRN_CI_RUN_ID = "43";
    },
  ],
  [
    "CI for another candidate",
    (f) => {
      f.run.head_sha = base;
    },
  ],
  [
    "CI for another check suite",
    (f) => {
      f.run.check_suite_id = 13;
    },
  ],
  [
    "a failed overall CI run",
    (f) => {
      f.run.conclusion = "failure";
    },
  ],
];
for (const [name, mutate] of rejected) {
  test(`prepare rejects ${name} without requesting a deploy or status success`, async () => {
    const f = fixture();
    mutate(f);
    await assert.rejects(runGate("prepare", f.env, f.api));
    assert.deepEqual(f.deployments, []);
    assert.deepEqual(f.statuses, []);
  });
}

const rejectedService = [
  ["automatic deployment interference", (f) => (f.service.autoDeployTrigger = "checksPass")],
  ["paid compute", (f) => (f.service.serviceDetails.plan = "starter")],
  ["a production origin", (f) => (f.service.serviceDetails.url = "https://production.example")],
  ["an unexpected Render service", (f) => (f.service.id = "srv-other")],
];
for (const [name, mutate] of rejectedService) {
  test(`deploy rejects ${name} without contacting the deployment endpoint`, async () => {
    const f = fixture();
    mutate(f);
    await assert.rejects(runGate("deploy", f.env, f.api));
    assert.deepEqual(f.deployments, []);
  });
}

test("deploy sends the approved head to Render and waits for its live deployment", async () => {
  const f = fixture();
  // The previous service revision must not be mistaken for a prerequisite.
  f.api.health = async () => ({ status: "ready", revision: base });
  await runGate("deploy", f.env, f.api);
  assert.deepEqual(f.deployments, [sha]);
  assert.deepEqual(f.statuses, []);
});

test("a head changed after preparation cannot be deployed", async () => {
  const f = fixture();
  f.pull.head.sha = base;
  await assert.rejects(runGate("deploy", f.env, f.api));
  assert.deepEqual(f.deployments, []);
});

for (const status of [
  "build_failed",
  "update_failed",
  "pre_deploy_failed",
  "canceled",
  "deactivated",
]) {
  test(`Render ${status} cannot pass deployment`, async () => {
    const f = fixture();
    f.api.deployment = async () => ({ status, commit: { id: sha } });
    await assert.rejects(deployCandidate(f.api, { sha }, async () => {}));
  });
}

test("a wrong Render revision fails even if marked live", async () => {
  const f = fixture();
  f.api.deployment = async () => ({ status: "live", commit: { id: base } });
  await assert.rejects(deployCandidate(f.api, { sha }, async () => {}));
});

test("a Render deployment that never becomes live fails within a bounded deadline", async () => {
  const f = fixture();
  f.api.deployment = async () => ({ status: "build_in_progress", commit: { id: sha } });
  await assert.rejects(
    deployCandidate(f.api, { sha }, async () => {}),
    /deadline/,
  );
});

test("successful E2E publishes success only for the unchanged live candidate", async () => {
  const f = fixture();
  await runGate("finish", f.env, f.api);
  assert.deepEqual(f.statuses, [{ revision: sha, state: "success" }]);
});

for (const [name, mutate] of [
  [
    "a prerequisite CI rerun that failed",
    (f) => {
      f.checks.check_runs[0].conclusion = "failure";
    },
  ],
  [
    "test failure",
    (f) => {
      f.env.CAIRN_E2E_OUTCOME = "failure";
    },
  ],
  [
    "test cancellation",
    (f) => {
      f.env.CAIRN_E2E_OUTCOME = "cancelled";
    },
  ],
  [
    "head drift",
    (f) => {
      f.pull.head.sha = base;
    },
  ],
  [
    "base drift",
    (f) => {
      f.api.main = async () => ({ object: { sha } });
    },
  ],
  [
    "PR closure",
    (f) => {
      f.pull.state = "closed";
    },
  ],
  [
    "health revision drift",
    (f) => {
      f.api.health = async () => ({ status: "ready", revision: base });
    },
  ],
  [
    "auto-deploy re-enabled",
    (f) => {
      f.service.autoDeployTrigger = "checksPass";
    },
  ],
  [
    "unavailable health",
    (f) => {
      f.api.health = async () => {
        throw new Error("unavailable");
      };
    },
  ],
]) {
  test(`finish publishes failure for ${name}`, async () => {
    const f = fixture();
    mutate(f);
    await assert.rejects(runGate("finish", f.env, f.api));
    assert.deepEqual(f.statuses, [{ revision: sha, state: "failure" }]);
  });
}
