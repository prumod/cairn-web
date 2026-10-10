import { mkdtempSync, readdirSync, existsSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";

const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error("Provide the test command.");
async function run(env) {
  const child = spawn(command, args, { stdio: "inherit", env });
  const terminate = () => child.kill("SIGTERM");
  process.once("SIGTERM", terminate);
  process.once("SIGINT", terminate);
  try {
    return await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (status) => resolve(status ?? 1));
    });
  } finally {
    process.removeListener("SIGTERM", terminate);
    process.removeListener("SIGINT", terminate);
  }
}
if (process.env.TEST_DATABASE_URL) {
  process.exitCode = await run(process.env);
} else {
  const candidates = ["/usr/lib/postgresql", "/usr/local/opt/postgresql@18"];
  const installed = candidates.flatMap((root) => {
    if (!existsSync(root)) return [];
    return root.endsWith("@18")
      ? [join(root, "bin")]
      : readdirSync(root)
          .sort((a, b) => Number(b) - Number(a))
          .map((version) => join(root, version, "bin"));
  });
  const bin = installed.find((path) => existsSync(join(path, "initdb")));
  if (!bin)
    throw new Error(
      "Install PostgreSQL locally or set TEST_DATABASE_URL to a dedicated test server with CREATE DATABASE permission.",
    );
  const directory = mkdtempSync(join(tmpdir(), "cairn-postgres-test-"));
  const data = join(directory, "data");
  const listener = createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  let started = false;
  try {
    const init = spawnSync(
      join(bin, "initdb"),
      ["-D", data, "-U", "postgres", "-A", "trust", "--no-locale"],
      { encoding: "utf8" },
    );
    if (init.status !== 0) throw new Error(init.stderr);
    const start = spawnSync(
      join(bin, "pg_ctl"),
      [
        "-D",
        data,
        "-l",
        join(directory, "postgres.log"),
        "-o",
        `-h 127.0.0.1 -k ${directory} -p ${port} -F`,
        "-w",
        "start",
      ],
      { encoding: "utf8" },
    );
    if (start.status !== 0)
      throw new Error(start.stderr + readFileSync(join(directory, "postgres.log"), "utf8"));
    started = true;
    process.exitCode = await run({
      ...process.env,
      TEST_DATABASE_URL: `postgres://postgres@127.0.0.1:${port}/postgres`,
    });
  } finally {
    let safeToRemove = true;
    if (started) {
      const stopped = spawnSync(
        join(bin, "pg_ctl"),
        ["-D", data, "-m", "immediate", "-t", "3", "-w", "stop"],
        { encoding: "utf8" },
      );
      if (stopped.status !== 0) {
        safeToRemove = false;
        console.error(
          "Test PostgreSQL shutdown failed; retained " + directory + ": " + stopped.stderr,
        );
        process.exitCode = 1;
      }
    }
    if (safeToRemove) rmSync(directory, { recursive: true, force: true });
  }
}
