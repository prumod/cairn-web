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

async function waitForNeon(port, signal) {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    signal.throwIfAborted();

    try {
      const response = await fetch(`http://127.0.0.1:${port}/sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Neon-Connection-String": `postgres://postgres:local-test-only@db.localtest.me:${port}/postgres`,
        },
        body: JSON.stringify({ query: "SELECT 1 AS ready", params: [] }),
        signal: AbortSignal.any([signal, AbortSignal.timeout(2_000)]),
      });

      if (response.ok) {
        const result = await response.json();

        if (result?.rows?.[0]?.ready === 1 || result?.rows?.[0]?.ready === "1") return;
      }
    } catch {
      // The proxy may accept connections before its backend is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Local Neon proxy did not become ready within 60 seconds.");
}

let started = false;
let child;
const cancellation = new AbortController();

const terminate = () => {
  cancellation.abort(new Error("Test run interrupted."));
  child?.kill("SIGTERM");
};

process.on("SIGTERM", terminate);

process.on("SIGINT", terminate);

try {
  started = true;
  compose("up", "-d", "--wait", "--wait-timeout", "60");
  const pgPort = port("postgres", "5432");
  const neonPort = port("neon", "4444");
  await waitForNeon(neonPort, cancellation.signal);
  child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      TEST_DATABASE_URL: `postgres://postgres:local-test-only@127.0.0.1:${pgPort}/postgres`,
      TEST_NEON_PORT: neonPort,
    },
  });
  process.exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (status) => resolve(status ?? 1));
  });
} finally {
  if (started) compose("down", "--volumes", "--remove-orphans");
  process.removeListener("SIGTERM", terminate);
  process.removeListener("SIGINT", terminate);
}
