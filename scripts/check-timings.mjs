// Show recorded Git gate runs as job/step durations, newest first.
// Usage: bun run checks:timings [count]
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const gitDir = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
  encoding: "utf8",
}).trim();

const dir = join(gitDir, "check-timings");
const count = Number(process.argv[2] ?? 1);

let files;

try {
  files = readdirSync(dir).filter((file) => file.endsWith(".jsonl"));
} catch {
  files = [];
}

if (files.length === 0) {
  console.log("No gate runs recorded yet. Run git commit or git push with the hooks installed.");
  process.exit(0);
}

const duration = (seconds) => {
  const total = Math.round(seconds);

  return total >= 60 ? `${Math.floor(total / 60)}m ${total % 60}s` : `${seconds.toFixed(1)}s`;
};

const mark = (status) => (status === 0 ? "✓" : "✗");

for (const file of files.toSorted().reverse().slice(0, count)) {
  const [run, ...steps] = readFileSync(join(dir, file), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));

  const end = steps.at(-1)?.end ?? run.start;
  const failed = steps.some((step) => step.status !== 0);
  const started = new Date(run.start * 1000).toLocaleString();
  console.log(
    `\n${failed ? "✗" : "✓"} ${run.gate}  ${run.branch}  ${duration(end - run.start)}  (${started})`,
  );
  console.log(`  ${run.worktree}`);
  const width = Math.max(...steps.map((step) => step.step.length));
  let group;

  for (const step of steps) {
    if (step.group !== group) {
      group = step.group;

      if (group) console.log(`  ${group}`);
    }

    const seconds = step.end - step.start;
    const bar = "█".repeat(Math.max(1, Math.round((seconds / (end - run.start)) * 30)));
    console.log(
      `    ${mark(step.status)} ${step.step.padEnd(width)}  ${duration(seconds).padStart(7)}  ${bar}`,
    );
  }
}
