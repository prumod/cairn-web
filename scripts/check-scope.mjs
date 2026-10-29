import { execFileSync } from "node:child_process";
import { posix } from "node:path";

const [base, head] = process.argv.slice(2);

// Tracked files such as the .tldraw research export exceed the 1 MiB default.
const git = (...args) => execFileSync("git", args, { maxBuffer: 256 * 1024 * 1024 });

const list = (...args) =>
  git(...args)
    .toString()
    .split("\0")
    .filter(Boolean);

const paths = list("diff", "--name-only", "--no-renames", "-z", base, head);
let code = paths.some((path) => !path.endsWith(".md"));

// A tracked non-Markdown file consumes a changed document when it names the
// document's path, or its filename when no other tracked file shares it. A file
// that reads Markdown (a loader) also consumes the documents in a directory it
// names, and every document when it uses a wildcard or recursion. Paths a loader
// builds from segments are not matched.
const reads = /import\.meta\.glob\s*\(|\b(?:readFile|readFileSync|readdir|readdirSync)\s*\(/;
const wildcard = /import\.meta\.glob\s*\(|recursive\s*:\s*true|\*\*\//;

// A directory is mentioned by its whole path: "docs" is not named by "docs/product".
const mentions = (content, dir) =>
  new RegExp(`${dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?(?![\\w./-])`).test(content);

// Check both sides: deleted docs can have consumers too.
for (const tree of [base, head]) {
  if (code) break;
  const tracked = list("ls-tree", "-r", "--name-only", "-z", tree);
  const sharing = new Map();

  for (const path of tracked) {
    const name = posix.basename(path);
    sharing.set(name, (sharing.get(name) ?? 0) + 1);
  }

  const consumes = (content, loader, path) => {
    const name = posix.basename(path);
    const dir = posix.dirname(path);

    return (
      content.includes(path) ||
      ((sharing.get(name) ?? 0) <= 1 && content.includes(name)) ||
      (loader && (wildcard.test(content) || (dir !== "." && mentions(content, dir))))
    );
  };

  for (const file of tracked.filter((path) => !path.endsWith(".md"))) {
    const content = git("show", `${tree}:${file}`).toString();
    const loader = /\.md\b|markdown/i.test(content) && reads.test(content);

    if (paths.some((path) => consumes(content, loader, path))) {
      code = true;
      break;
    }
  }
}

console.log(code ? "code" : "docs");
