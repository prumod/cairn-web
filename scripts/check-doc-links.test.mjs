import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { createRepo } from "./git-test-repo.mjs";

const script = resolve("scripts/check-doc-links.mjs");

// Commits `files` and runs the link check on that commit.
function check(files) {
  const repo = createRepo();
  try {
    const commit = repo.commit(files);
    const { status, stderr } = spawnSync("node", [script, commit], { cwd: repo.dir });
    return { status, stderr: stderr.toString() };
  } finally {
    repo.remove();
  }
}

const tree = { "docs/b.md": "b\n", "apps/web/references/x.tsx": "x\n", "my file.md": "m\n" };

test("links to tracked files and directories pass", () => {
  const page = [
    "[file](b.md) [up](../apps/web/references/x.tsx) [dir](../apps/web/references/)",
    "[space](<../my file.md>) [encoded](../my%20file.md) [anchor](b.md#top)",
    "[root](/docs/b.md) ![image](b.md)",
    "[ref]: b.md",
  ].join("\n");
  assert.deepEqual(check({ ...tree, "docs/a.md": page }), { status: 0, stderr: "" });
});

test("a link to a missing target fails with its file, line, and resolved path", () => {
  const { status, stderr } = check({ ...tree, "docs/a.md": "ok\n[bad](../web/x.tsx)\n" });
  assert.equal(status, 1);
  assert.match(stderr, /docs\/a\.md:2: \.\.\/web\/x\.tsx -> web\/x\.tsx/);
});

test("a link that leaves the repository fails", () => {
  assert.equal(check({ ...tree, "docs/a.md": "[out](../../outside.md)\n" }).status, 1);
});

test("URLs, other schemes, anchors, code spans, and fenced code are not checked", () => {
  const page = [
    "[web](https://example.test/missing.md) [mail](mailto:a@example.test)",
    "[thread](t3-thread://v1/missing) [here](#section) `[code](missing.md)`",
    "```md",
    "[fenced](missing.md)",
    "```",
  ].join("\n");
  assert.deepEqual(check({ ...tree, "docs/a.md": page }), { status: 0, stderr: "" });
});
