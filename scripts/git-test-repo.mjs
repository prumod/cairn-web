import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

// A throwaway Git repository for script tests. `commit` writes the files
// (a null value deletes one), commits them, and returns the commit.
export function createRepo() {
  const dir = mkdtempSync(join(tmpdir(), "cairn-script-"));
  const git = (...args) => execFileSync("git", args, { cwd: dir, stdio: "pipe" }).toString().trim();
  git("init", "--quiet");
  git("config", "user.name", "Script Test");
  git("config", "user.email", "script@example.test");
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", "/dev/null");
  return {
    dir,
    commit(files) {
      for (const [path, content] of Object.entries(files)) {
        const full = join(dir, path);
        if (content === null) rmSync(full);
        else {
          mkdirSync(dirname(full), { recursive: true });
          writeFileSync(full, content);
        }
      }
      git("add", "--all");
      git("commit", "--quiet", "-m", "commit");
      return git("rev-parse", "HEAD");
    },
    remove: () => rmSync(dir, { recursive: true, force: true }),
  };
}
