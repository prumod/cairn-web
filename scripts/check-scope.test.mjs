import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { createRepo } from "./git-test-repo.mjs";

const script = resolve("scripts/check-scope.mjs");

// Commits `before`, then `change` on top, and returns the scope of the change.
function scopeOf(before, change) {
  const repo = createRepo();

  try {
    const base = repo.commit(before);
    const head = repo.commit(change);

    return execFileSync("node", [script, base, head], { cwd: repo.dir }).toString().trim();
  } finally {
    repo.remove();
  }
}

const loader = (call) =>
  `import { readdirSync } from "node:fs";\n${call}.filter((f) => f.endsWith(".md"));\n`;

test("a Markdown-only change beside a tracked file over 1 MiB is docs", () => {
  const tree = { "docs/a.md": "one\n", "export.bin": "x".repeat(1_200_000) };
  assert.equal(scopeOf(tree, { "docs/a.md": "two\n" }), "docs");
});

test("a change to a non-Markdown file is code", () => {
  assert.equal(scopeOf({ "docs/a.md": "one\n" }, { "tool.mjs": "export {};\n" }), "code");
});

test("a file that names a document's path makes it code", () => {
  const tree = { "docs/a.md": "one\n", "tool.mjs": 'export const doc = "docs/a.md";\n' };
  assert.equal(scopeOf(tree, { "docs/a.md": "two\n" }), "code");
});

test("a deleted document that a file names is code", () => {
  const tree = { "docs/a.md": "one\n", "tool.mjs": 'export const doc = "docs/a.md";\n' };
  assert.equal(scopeOf(tree, { "docs/a.md": null }), "code");
});

test("a filename shared by several documents is not enough to make one code", () => {
  const tree = {
    "a/notes.md": "one\n",
    "b/notes.md": "one\n",
    "tool.mjs": 'export const doc = "a/notes.md";\n',
  };

  assert.equal(scopeOf(tree, { "b/notes.md": "two\n" }), "docs");
  assert.equal(scopeOf(tree, { "a/notes.md": "two\n" }), "code");
});

test("a filename that only one document has is a reference", () => {
  const tree = { "docs/only.md": "one\n", "tool.mjs": 'export const doc = "only.md";\n' };
  assert.equal(scopeOf(tree, { "docs/only.md": "two\n" }), "code");
});

test("a loader consumes the documents of the directory it names", () => {
  const tree = {
    "docs/in/x.md": "one\n",
    "docs/out/y.md": "one\n",
    "docs/README.md": "one\n",
    "load.mjs": loader('const files = readdirSync("docs/in")'),
  };

  assert.equal(scopeOf(tree, { "docs/in/x.md": "two\n" }), "code");
  assert.equal(scopeOf(tree, { "docs/out/y.md": "two\n" }), "docs");
  assert.equal(scopeOf(tree, { "docs/README.md": "two\n" }), "docs");
});

test("a recursive loader consumes every document", () => {
  const tree = {
    "docs/out/y.md": "one\n",
    "load.mjs": loader('const files = readdirSync("docs", { recursive: true })'),
  };

  assert.equal(scopeOf(tree, { "docs/out/y.md": "two\n" }), "code");
});
