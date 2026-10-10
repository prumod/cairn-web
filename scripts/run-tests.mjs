import { globSync } from "node:fs";
import { spawnSync } from "node:child_process";

function run(binary, args) {
  const entrypoints = {
    vitest: "node_modules/vitest/vitest.mjs",
    bddgen: "node_modules/playwright-bdd/dist/cli/index.js",
    playwright: "node_modules/@playwright/test/cli.js",
  };
  const result = spawnSync(process.execPath, [entrypoints[binary], ...args], {
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const suite = process.argv[2];
if (suite === "fast") {
  const tests = globSync([
    "{web,backend,shared}/src/**/*.{spec,test}.{ts,tsx}",
    "{web,backend}/tests/{acceptance,typical}/integration/**/*.{spec,test}.{ts,tsx}",
  ]);
  run("vitest", ["run", ...(tests.length === 0 ? ["--passWithNoTests"] : [])]);
  if (tests.length === 0) console.log("SKIPPED: no Vitest tests yet; no behavior verified.");
} else if (suite === "browser") {
  run("bddgen", []);
  if (globSync("features/**/*.feature").length === 0) {
    // Listing still loads Playwright's configuration, without requiring a browser.
    run("playwright", ["test", "--list", "--pass-with-no-tests"]);
    console.log("SKIPPED: no Playwright-BDD scenarios yet; no browser behavior verified.");
  } else {
    run("playwright", ["test"]);
  }
} else {
  throw new Error("Expected fast or browser suite.");
}
