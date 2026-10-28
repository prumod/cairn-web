import { execFileSync } from "node:child_process";

const [base, head] = process.argv.slice(2);
// Tracked files such as the .tldraw research export exceed the 1 MiB default.
const git = (...args) => execFileSync("git", args, { maxBuffer: 256 * 1024 * 1024 });
const paths = git("diff", "--name-only", "--no-renames", "-z", base, head)
  .toString()
  .split("\0")
  .filter(Boolean);
let code = paths.some((path) => !path.endsWith(".md"));
// Check both sides: deleted docs can have consumers too. Treat any literal
// filename reference in a non-Markdown tracked file conservatively as a consumer.
for (const tree of [base, head]) {
  if (code) break;
  const files = git("ls-tree", "-r", "--name-only", "-z", tree)
    .toString()
    .split("\0")
    .filter((path) => path && !path.endsWith(".md"));
  for (const file of files) {
    const content = git("show", `${tree}:${file}`).toString();
    if (paths.some((path) => content.includes(path.split("/").at(-1)))) {
      code = true;
      break;
    }
    // Wildcard imports or filesystem traversal can consume docs dynamically.
    if (
      /\.md\b|markdown/i.test(content) &&
      /import\.meta\.glob\s*\(|\b(?:readFile|readFileSync|readdir|readdirSync)\s*\(/.test(content)
    ) {
      code = true;
      break;
    }
  }
}
console.log(code ? "code" : "docs");
