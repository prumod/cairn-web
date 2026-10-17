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
    GITHUB_EVENT_NAME: "workflow_dispatch",
    GITHUB_REF: "refs/heads/main",
    GITHUB_ACTOR: "maintainer",
    CAIRN_PR_NUMBER: "73",
    CAIRN_CANDIDATE_SHA: sha,
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
    path: ".github/workflows/checks.yml",
    event: "pull_request",
    head_sha: sha,
    check_suite_id: 12,
    status: "completed",
    conclusion: "success",
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
    permission: async () => ({ permission: "write" }),
    pull: async () => pull,
    main: async () => ({ object: { sha: base } }),
    compare: async () => ({ status: "ahead" }),
    commit: async (id) => ({
      tree: { sha: tree },
      parents: id === merge ? [{ sha: base }, { sha }] : [],
    }),
    // Mirrors GitHub: the PR's check run is attached to its head, not merge SHA.
    checks: async (revision) => (revision === sha ? checks : { check_runs: [] }),
    run: async () => run,
    service: async () => service,
    health: async () => ({ status: "ready", revision: sha }),
    status: async (revision, state) => {
      statuses.push({ revision, state });
    },
    deploy: async (revision) => {
      deployments.push(revision);
      return { id: "dep-123", commit: { id: revision } };
    },
    deployment: async () => ({ status: "live", commit: { id: sha } }),
  };
  return { env, api, pull, checks, run, service, statuses, deployments };
}

test("approved current PR prepares a pending status on its immutable head, not main", async () => {
  const f = fixture();
  assert.deepEqual(await runGate("prepare", f.env, f.api), { pr: "73", sha, base });
  assert.deepEqual(f.statuses, [{ revision: sha, state: "pending" }]);
  assert.deepEqual(f.deployments, []);
});

function bootstrapFixture() {
  const f = fixture();
  const candidate = "7b1687cd39bb45e4a03cef586302fcf96038e06f";
  f.env.GITHUB_REF = "refs/heads/bootstrap/63-reviewed-runner";
  f.env.GITHUB_SHA = "e".repeat(40);
  f.env.CAIRN_REVIEWED_RUNNER_SHA = f.env.GITHUB_SHA;
  f.env.CAIRN_PR_NUMBER = "79";
  f.env.CAIRN_CANDIDATE_SHA = candidate;
  f.pull.head.sha = candidate;
  f.run.head_sha = candidate;
  f.api.checks = async (revision) => (revision === candidate ? f.checks : { check_runs: [] });
  f.api.commit = async (id) => ({
    tree: { sha: tree },
    parents: id === merge ? [{ sha: base }, { sha: candidate }] : [],
  });
  f.api.health = async () => ({ status: "ready", revision: candidate });
  f.api.deployment = async () => ({ status: "live", commit: { id: candidate } });
  return f;
}

test("an explicitly reviewed bootstrap runner may only prepare the pinned repair candidate", async () => {
  const f = bootstrapFixture();
  const result = await runGate("prepare", f.env, f.api);
  assert.equal(result.pr, "79");
  assert.equal(result.sha, f.env.CAIRN_CANDIDATE_SHA);
  assert.deepEqual(f.statuses, [{ revision: result.sha, state: "pending" }]);
  assert.deepEqual(f.deployments, []);
});

test("bootstrap only publishes success after genuine deployment and unchanged candidate checks", async () => {
  const f = bootstrapFixture();
  await runGate("prepare", f.env, f.api);
  await runGate("deploy", f.env, f.api);
  await runGate("finish", f.env, f.api);
  assert.deepEqual(f.deployments, [f.env.CAIRN_CANDIDATE_SHA]);
  assert.deepEqual(
    f.statuses.map(({ state }) => state),
    ["pending", "success"],
  );
});

test("bootstrap publishes failure when the deployed revision drifts", async () => {
  const f = bootstrapFixture();
  f.api.health = async () => ({ status: "ready", revision: "f".repeat(40) });
  await assert.rejects(runGate("finish", f.env, f.api));
  assert.deepEqual(f.statuses, [{ revision: f.env.CAIRN_CANDIDATE_SHA, state: "failure" }]);
});

for (const [name, mutate] of [
  ["a different repository", (env) => (env.GITHUB_REPOSITORY = "other/repo")],
  ["an automatic event", (env) => (env.GITHUB_EVENT_NAME = "pull_request")],
  ["a missing review SHA", (env) => delete env.CAIRN_REVIEWED_RUNNER_SHA],
  ["a different review SHA", (env) => (env.CAIRN_REVIEWED_RUNNER_SHA = "f".repeat(40))],
  [
    "an abbreviated runner SHA",
    (env) => {
      env.CAIRN_REVIEWED_RUNNER_SHA = "eeeeeee";
      env.GITHUB_SHA = "eeeeeee";
    },
  ],
  ["an unreviewed branch", (env) => (env.GITHUB_REF = "refs/heads/other")],
  ["another PR", (env) => (env.CAIRN_PR_NUMBER = "75")],
  ["another candidate", (env) => (env.CAIRN_CANDIDATE_SHA = "a".repeat(40))],
]) {
  test(`bootstrap rejects ${name} before any status or deployment`, async () => {
    for (const command of ["prepare", "deploy", "finish"]) {
      const f = bootstrapFixture();
      mutate(f.env);
      await assert.rejects(runGate(command, f.env, f.api));
      assert.deepEqual(f.statuses, []);
      assert.deepEqual(f.deployments, []);
    }
  });
}

const rejected = [
  [
    "a dispatch from candidate code",
    (f) => {
      f.env.GITHUB_REF = "refs/heads/feature";
    },
  ],
  [
    "an automatic event without approval",
    (f) => {
      f.env.GITHUB_EVENT_NAME = "pull_request";
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
    "an actor without write permission",
    (f) => {
      f.api.permission = async () => ({ permission: "read" });
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
  [
    "automatic deployment interference",
    (f) => {
      f.service.autoDeployTrigger = "checksPass";
    },
  ],
  [
    "paid compute",
    (f) => {
      f.service.serviceDetails.plan = "starter";
    },
  ],
  [
    "a production origin",
    (f) => {
      f.service.serviceDetails.url = "https://production.example";
    },
  ],
  [
    "an unexpected Render service",
    (f) => {
      f.service.id = "srv-other";
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
