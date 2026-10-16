import { YAML } from "bun";
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";

export const blueprintPaths = ["render.yaml", "deploy/render.production.template.yaml"];

export function validateBlueprint(source, environment) {
  if (!["testing", "production"].includes(environment)) throw new Error("Unknown environment.");
  let blueprint;
  try {
    blueprint = YAML.parse(source);
  } catch {
    throw new Error("Blueprint must be valid YAML (contents withheld).");
  }
  const testing = environment === "testing";
  const expected = {
    services: [
      {
        type: "web",
        name: testing ? "cairn-testing" : "cairn-production",
        runtime: "node",
        repo: "https://github.com/prumod/cairn-web",
        branch: testing ? "feat/63-company-profile" : "main",
        plan: testing ? "free" : "__APPROVED_PRODUCTION_PLAN_REQUIRED__",
        region: "frankfurt",
        buildCommand: "NODE_ENV=development bun install --frozen-lockfile && bun run build",
        startCommand: "bun run start",
        healthCheckPath: "/healthz",
        autoDeployTrigger: testing ? "checksPass" : "off",
        envVars: [
          { key: "NODE_ENV", value: "production" },
          { key: "NODE_VERSION", value: "22.23.2" },
          { key: "BUN_VERSION", value: "1.3.14" },
          testing
            ? { key: "APP_ORIGIN", value: "https://cairn-testing.onrender.com" }
            : { key: "APP_ORIGIN", sync: false },
          ...[
            "DATABASE_URL",
            "BETTER_AUTH_SECRET",
            "GOOGLE_CLIENT_ID",
            "GOOGLE_CLIENT_SECRET",
            "BOOTSTRAP_ADMIN_EMAIL",
          ].map((key) => ({ key, sync: false })),
        ],
      },
    ],
  };
  // The production plan is an unresolved choice; the local check does not
  // validate Render's schema. Never print parsed values on failure.
  if (!isDeepStrictEqual(blueprint, expected)) {
    throw new Error(`${environment} Blueprint differs from the reviewed deployment contract.`);
  }
}

export function checkBlueprints() {
  for (const [index, path] of blueprintPaths.entries()) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    const environment = index === 0 ? "testing" : "production";
    validateBlueprint(source, environment);
    const note = environment === "production" ? "; production plan approval is still required" : "";
    console.log(`PASS: ${path} satisfies the ${environment} deployment policy${note}.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    checkBlueprints();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
