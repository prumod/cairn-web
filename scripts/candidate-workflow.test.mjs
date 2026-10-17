import { YAML } from "bun";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workflow = YAML.parse(
  readFileSync(new URL("../.github/workflows/deployed-e2e.yml", import.meta.url), "utf8"),
);
const job = workflow.jobs.candidate;

test("candidate gate requires an explicit dispatch with an immutable approval", () => {
  assert.deepEqual(Object.keys(workflow.on), ["workflow_dispatch"]);
  assert.equal(workflow.on.workflow_dispatch.inputs.pr_number.required, true);
  assert.equal(workflow.on.workflow_dispatch.inputs.candidate_sha.required, true);
  assert.match(job.if, /github.ref == 'refs\/heads\/main'/);
  assert.equal(job.environment.name, "cairn-testing-e2e");
});

test("bootstrap requires the reviewed runner SHA and pinned repair PR and candidate", () => {
  assert.equal(workflow.on.workflow_dispatch.inputs.reviewed_runner_sha.required, false);
  assert.equal(job.env.CAIRN_REVIEWED_RUNNER_SHA, "${{ inputs.reviewed_runner_sha }}");
  assert.match(job.if, /github.ref == 'refs\/heads\/bootstrap\/63-reviewed-runner'/);
  assert.match(job.if, /inputs.reviewed_runner_sha == github.sha/);
  assert.match(job.if, /inputs.pr_number == '79'/);
  assert.match(job.if, /inputs.candidate_sha == '7b1687cd39bb45e4a03cef586302fcf96038e06f'/);
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
  assert.equal(job.env.CAIRN_CANDIDATE_SHA, "${{ inputs.candidate_sha }}");
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
