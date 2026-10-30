import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const source = resolve(".");
const lefthook = join(source, "node_modules/.bin/lefthook");

test("ordinary commits and pushes scan docs, reject secrets, and validate referenced docs", () => {
  const dir = mkdtempSync(join(tmpdir(), "cairn-hooks-"));
  const remote = `${dir}-remote`;

  const git = (...args) =>
    execFileSync("git", args, { cwd: dir, env, stdio: "pipe" }).toString().trim();

  const env = {
    ...process.env,
    AGENT_SESSION: "1",
    GITLEAKS_BIN: join(dir, "scanner"),
    LEFTHOOK_BIN: lefthook,
    PATH: `${dir}/bin:${process.env.PATH}`,
  };

  try {
    mkdirSync(join(dir, "scripts"));
    mkdirSync(join(dir, "bin"));

    for (const file of [
      "git-checks.sh",
      "check-secrets.sh",
      "timing.sh",
      "check-scope.mjs",
      "check-doc-links.mjs",
      "pre-commit.sh",
      "pre-push.sh",
    ]) {
      cpSync(join(source, "scripts", file), join(dir, "scripts", file));
    }

    cpSync(join(source, "lefthook.yml"), join(dir, "lefthook.yml"));
    writeFileSync(
      join(dir, "scanner"),
      '#!/bin/bash\nif [[ "$*" == *--pipe* ]]; then ! grep -q TEST_SECRET; fi\n',
      { mode: 0o755 },
    );
    writeFileSync(join(dir, "bin/bun"), "#!/bin/bash\nexit 37\n", { mode: 0o755 });
    git("init");
    git("config", "user.name", "Hook Test");
    git("config", "user.email", "hook@example.test");
    git("add", ".");
    git("-c", "core.hooksPath=/dev/null", "commit", "-m", "baseline");
    execFileSync(lefthook, ["install"], { cwd: dir, env, stdio: "pipe" });
    writeFileSync(join(dir, "note.md"), "hello\n");
    git("add", "note.md");
    git("commit", "-m", "docs");
    writeFileSync(join(dir, "note.md"), "TEST_SECRET\n");
    git("add", "note.md");
    assert.throws(() => git("commit", "-m", "secret"));
    writeFileSync(join(dir, "note.md"), "[missing](missing.md)\n");
    git("add", "note.md");
    assert.throws(() => git("commit", "-m", "broken link"));
    writeFileSync(join(dir, "note.md"), "hello again\n");
    git("add", "note.md");
    git("commit", "-m", "docs again");
    execFileSync("git", ["init", "--bare", remote], { stdio: "pipe" });
    git("remote", "add", "origin", remote);
    git("-c", "core.hooksPath=/dev/null", "push", "origin", "HEAD:main");
    writeFileSync(join(dir, "note.md"), "push docs\n");
    git("add", ".");
    git("commit", "-m", "docs to push");
    git("push", "origin", "HEAD:main");
    writeFileSync(join(dir, "consumer.js"), 'const doc = "note.md";\n');
    git("add", ".");
    assert.throws(() => git("commit", "-m", "code"));
    delete env.AGENT_SESSION;
    git("commit", "-m", "human code");
    git("push", "origin", "HEAD:main");
    writeFileSync(join(dir, "note.md"), "TEST_SECRET\n");
    git("add", ".");
    assert.throws(() => git("commit", "-m", "human secret"));
    writeFileSync(join(dir, "note.md"), "[missing](missing.md)\n");
    git("add", ".");
    assert.throws(() => git("commit", "-m", "human broken link"));
    git("-c", "core.hooksPath=/dev/null", "commit", "-m", "broken link");
    assert.throws(() => git("push", "origin", "HEAD:main"));
    git("reset", "--hard", "HEAD^");
    env.AGENT_SESSION = "1";
    writeFileSync(join(dir, "consumer.js"), 'const doc = "note.md"; // changed\n');
    git("add", ".");
    git("-c", "core.hooksPath=/dev/null", "commit", "-m", "consumer");
    writeFileSync(join(dir, "note.md"), "referenced docs\n");
    git("add", ".");
    assert.throws(() => git("commit", "-m", "referenced docs"));
    git("-c", "core.hooksPath=/dev/null", "commit", "-m", "referenced docs");
    assert.throws(() => git("push", "origin", "HEAD:main"));
    assert.equal(git("status", "--porcelain"), "");
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(remote, { recursive: true, force: true });
  }
});
