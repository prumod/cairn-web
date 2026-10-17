import { YAML } from "bun";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workflow = YAML.parse(
  readFileSync(new URL("../.github/workflows/deployed-e2e.yml", import.meta.url), "utf8"),
);
const attestationWorkflow = YAML.parse(
  readFileSync(new URL("../.github/workflows/trusted-pr-submission.yml", import.meta.url), "utf8"),
);
const job = workflow.jobs.candidate;

test("the one-time bootstrap binds immutable runner and only the reviewed PR83 head", () => {
  assert.deepEqual(Object.keys(workflow.on), ["workflow_dispatch"]);
  assert.equal(workflow.on.workflow_dispatch.inputs.reviewed_runner_sha.required, true);
  assert.match(job.if, /inputs.reviewed_runner_sha == github.sha/);
  assert.match(job.if, /refs\/heads\/bootstrap\/82-reviewed-runner/);
  assert.equal(job.env.CAIRN_PR_NUMBER, "83");
  assert.equal(job.env.CAIRN_CANDIDATE_SHA, "1c80fad8e8eb96ecb197fb872e217882ef85d3a3");
  assert.equal(job.env.CAIRN_CI_RUN_ID, "39023061871");
  assert.equal(job.environment.name, "cairn-testing-e2e");
  const prepare = job.steps.find((step) => step.run === "node scripts/candidate-gate.mjs prepare");
  assert.ok(!prepare.env.CAIRN_RENDER_API_KEY);
});

test("the trusted submission event is main-defined and limited to opened/synchronize", () => {
  assert.deepEqual(attestationWorkflow.on.pull_request_target.types, ["opened", "synchronize"]);
  assert.deepEqual(attestationWorkflow.on.pull_request_target.branches, ["main"]);
  assert.equal(attestationWorkflow.permissions.contents, undefined);
  assert.match(attestationWorkflow.jobs.record.if, /github.actor_id == '99197066'/);
  assert.match(attestationWorkflow.jobs.record.if, /head\.repo\.full_name == github\.repository/);
  assert.equal(attestationWorkflow.jobs.record.permissions.statuses, "write");
  assert.ok(!attestationWorkflow.jobs.record.env?.CAIRN_RENDER_API_KEY);
  const checkout = attestationWorkflow.jobs.record.steps.find((step) =>
    step.uses?.startsWith("actions/checkout@"),
  );
  assert.equal(checkout.with.ref, "${{ github.sha }}");
  assert.equal(checkout.with["persist-credentials"], false);
  assert.ok(
    attestationWorkflow.jobs.record.steps.some(
      (step) => step.run === "node scripts/candidate-gate.mjs attest",
    ),
  );
  assert.ok(
    attestationWorkflow.jobs.record.steps.every(
      (step) => !Object.values(step.env ?? {}).some((value) => String(value).includes("secrets.")),
    ),
  );
});

test("one global lock covers deployment, authenticated tests, and final publication", () => {
  assert.equal(workflow.concurrency.group, "cairn-testing-candidate");
  assert.equal(workflow.concurrency["cancel-in-progress"], false);
  assert.equal(Object.keys(workflow.jobs).length, 1);
  const commands = job.steps.map((step) => step.run).filter(Boolean);
  const index = (command) => commands.indexOf(command);
  assert.ok(
    index("node scripts/candidate-gate.mjs prepare") <
      index("node scripts/candidate-gate.mjs deploy"),
  );
  assert.ok(
    index("node scripts/candidate-gate.mjs deploy") <
      index("node scripts/wait-for-render-revision.mjs"),
  );
  assert.ok(index("node scripts/wait-for-render-revision.mjs") < index("bun run test:deployed"));
  assert.ok(index("bun run test:deployed") < index("node scripts/candidate-gate.mjs finish"));
});

test("only trusted workflow code is checked out; candidate artifacts are not downloaded", () => {
  const checkouts = job.steps.filter((step) => step.uses?.startsWith("actions/checkout@"));
  assert.equal(checkouts.length, 1);
  assert.equal(checkouts[0].with.ref, "${{ github.sha }}");
  assert.equal(checkouts[0].with["persist-credentials"], false);
  assert.ok(job.steps.every((step) => !step.uses?.startsWith("actions/download-artifact@")));
  for (const step of job.steps) {
    if (step.run) assert.ok(!step.run.includes("${{"));
  }
});

test("the exact candidate drives health and E2E without overriding GITHUB_SHA", () => {
  const health = job.steps.find((step) => step.run === "node scripts/wait-for-render-revision.mjs");
  assert.equal(health.env.DEPLOYED_SHA, "${{ steps.prepare.outputs.sha }}");
  assert.equal(health.env.CAIRN_TESTING_HEALTH_URL, "https://cairn-testing.onrender.com/healthz");
  assert.ok(job.steps.every((step) => !step.env?.GITHUB_SHA));
});

test("refresh tokens are present only in the authenticated test step", () => {
  for (const step of job.steps) {
    const hasRefresh = Object.keys(step.env ?? {}).some((key) => key.endsWith("_REFRESH_TOKEN"));
    assert.equal(hasRefresh, step.id === "e2e");
    if (step.id === "e2e") {
      assert.ok(!step.env.GITHUB_TOKEN);
      assert.ok(!step.env.CAIRN_RENDER_API_KEY);
    }
  }
});

test("final failure publication runs after earlier failures once preparation succeeded", () => {
  const finish = job.steps.find((step) => step.run === "node scripts/candidate-gate.mjs finish");
  assert.equal(finish.if, "always() && steps.prepare.outcome == 'success'");
  assert.equal(finish.env.CAIRN_E2E_OUTCOME, "${{ steps.e2e.outcome }}");
  assert.equal(finish.env.CAIRN_BASE_SHA, "${{ steps.prepare.outputs.base }}");
});
