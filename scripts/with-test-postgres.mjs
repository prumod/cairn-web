import { randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error("Provide the test command.");
const root = fileURLToPath(new URL("../", import.meta.url));
const project = "cairn-test-" + randomUUID();
function compose(...args) {
  const result = spawnSync(
    "docker",
    ["compose", "-f", "compose.test.yaml", "-p", project, ...args],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout.trim();
}
function port(service, target) {
  return compose("port", service, target).split(":").at(-1);
}

let started = false;
try {
  started = true;
  compose("up", "-d", "--wait", "--wait-timeout", "60");
  const pgPort = port("postgres", "5432");
  const neonPort = port("neon", "4444");
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      TEST_DATABASE_URL: `postgres://postgres:local-test-only@127.0.0.1:${pgPort}/postgres`,
      TEST_NEON_PORT: neonPort,
    },
  });
  const terminate = () => child.kill("SIGTERM");
  process.on("SIGTERM", terminate);
  process.on("SIGINT", terminate);
  try {
    process.exitCode = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (status) => resolve(status ?? 1));
    });
  } finally {
    process.removeListener("SIGTERM", terminate);
    process.removeListener("SIGINT", terminate);
  }
} finally {
  if (started) compose("down", "--volumes", "--remove-orphans");
}
