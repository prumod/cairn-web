import { YAML } from "bun";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { blueprintPaths, validateBlueprint } from "./check-blueprints.mjs";

for (const [index, path] of blueprintPaths.entries()) {
  const environment = index === 0 ? "testing" : "production";
  const source = () => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  test(`${environment} Blueprint satisfies the deployment policy`, () => {
    validateBlueprint(source(), environment);
  });
  if (environment === "testing") {
    test("testing deploys only after CI checks pass", () => {
      const blueprint = YAML.parse(source());
      blueprint.services[0].autoDeployTrigger = "checksPass";
      assert.doesNotThrow(() => validateBlueprint(YAML.stringify(blueprint), environment));
    });
  }

  const mutations = [
    ["paid compute", (b) => (b.services[0].plan = "starter")],
    ["missing compute plan", (b) => delete b.services[0].plan],
    ["unexpected instance count", (b) => (b.services[0].numInstances = 2)],
    [
      "literal credential outside environment variables",
      (b) => (b.services[0].privateValue = "DUMMY-PRIVATE-VALUE"),
    ],
    ["deploys before CI passes", (b) => (b.services[0].autoDeployTrigger = "commit")],
    [
      "wrong CI deployment trigger",
      (b) => (b.services[0].autoDeployTrigger = environment === "testing" ? "off" : "checksPass"),
    ],
    ["extra services", (b) => b.services.push(structuredClone(b.services[0]))],
    ["Render databases", (b) => (b.databases = [{ name: "database", plan: "free" }])],
    ["preview environments", (b) => (b.previews = { generation: "automatic" })],
    ["persistent disks", (b) => (b.services[0].disk = { name: "data", mountPath: "/data" })],
    ["paid pre-deploy hook", (b) => (b.services[0].preDeployCommand = "bun run db:migrate")],
    ["wrong environment branch", (b) => (b.services[0].branch = "unreviewed")],
    ["wrong environment name", (b) => (b.services[0].name = "other-environment")],
    ["wrong region", (b) => (b.services[0].region = "oregon")],
    ["wrong repository", (b) => (b.services[0].repo = "https://example.com/other")],
    ["unreviewed build", (b) => (b.services[0].buildCommand = "bun install && bun run build")],
    ["unreviewed startup", (b) => (b.services[0].startCommand = "bun run dev")],
    ["missing health check", (b) => delete b.services[0].healthCheckPath],
    ["test login switch", (b) => b.services[0].envVars.push({ key: "TEST_AUTH", value: "true" })],
    ["wrong Bun version", (b) => (b.services[0].envVars[2].value = "latest")],
    ["wrong Node version", (b) => (b.services[0].envVars[1].value = "latest")],
    ["development runtime", (b) => (b.services[0].envVars[0].value = "development")],
    ["missing environment variable", (b) => b.services[0].envVars.pop()],
    ["duplicate environment variable", (b) => b.services[0].envVars.push(b.services[0].envVars[0])],
    [
      "cross-environment origin",
      (b) => (b.services[0].envVars[3] = { key: "APP_ORIGIN", value: "https://other.example" }),
    ],
  ];
  if (environment === "production") {
    mutations.push(["unapproved Free production", (b) => (b.services[0].plan = "free")]);
  }
  for (const key of [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "BOOTSTRAP_ADMIN_EMAIL",
  ]) {
    mutations.push([
      `inline ${key}`,
      (b) => {
        const variable = b.services[0].envVars.find((v) => v.key === key);
        delete variable.sync;
        variable.value = "DUMMY-PRIVATE-VALUE";
      },
    ]);
  }
  for (const [label, mutate] of mutations) {
    test(`${environment} Blueprint rejects ${label} without exposing values`, () => {
      const blueprint = YAML.parse(source());
      mutate(blueprint);
      assert.throws(
        () => validateBlueprint(YAML.stringify(blueprint), environment),
        (error) => {
          assert.equal(
            error.message,
            `${environment} Blueprint differs from the reviewed deployment contract.`,
          );
          assert.ok(!error.message.includes("DUMMY-PRIVATE-VALUE"));
          return true;
        },
      );
    });
  }
}

test("Blueprint parser rejects malformed YAML without printing its contents", () => {
  assert.throws(() => validateBlueprint("services: [DUMMY-PRIVATE-VALUE", "testing"), {
    message: "Blueprint must be valid YAML (contents withheld).",
  });
});

test("Blueprint validation rejects an unknown target environment", () => {
  assert.throws(() => validateBlueprint("{}", "preview"), { message: "Unknown environment." });
});

test("testing branch pushes run the full CI check Render uses for deployment", () => {
  const workflow = YAML.parse(
    readFileSync(new URL("../.github/workflows/checks.yml", import.meta.url), "utf8"),
  );
  assert.ok(workflow.on.push.branches.includes("feat/63-company-profile"));
  assert.equal(workflow.jobs.checks.name, "Agent checks");
  assert.ok(workflow.jobs.checks.steps.some((step) => step.run === "scripts/check.sh full"));
});
