import { execFileSync } from "node:child_process";
import { posix } from "node:path";

// Fails on relative Markdown links whose target is not tracked in a Git tree.
// The hooks pass the commit or staged tree; `bun run check:links` checks HEAD.
// Anchors are not checked.
const tree = process.argv[2] ?? "HEAD";
const git = (...args) => execFileSync("git", args, { maxBuffer: 256 * 1024 * 1024 }).toString();
const files = git("ls-tree", "-r", "--name-only", "-z", tree).split("\0").filter(Boolean);
const known = new Set(files);

for (const file of files) {
  for (let dir = posix.dirname(file); dir !== "."; dir = posix.dirname(dir)) known.add(dir);
}

const inlineLink = /!?\[[^\]]*\]\(\s*(<[^>]*>|[^)\s]*)/g;
const definition = /^\s*\[[^\]]+\]:\s*(<[^>]*>|\S+)/;
const external = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function resolve(file, target) {
  const path = target.replace(/^<|>$/g, "").replace(/[#?].*$/, "");

  if (!path || external.test(target.replace(/^</, ""))) return null;
  let decoded = path;

  try {
    decoded = decodeURI(path);
  } catch {}

  const resolved = decoded.startsWith("/")
    ? posix.normalize(decoded.slice(1))
    : posix.join(posix.dirname(file), decoded);

  return resolved.replace(/\/$/, "");
}

const broken = [];

for (const file of files.filter((path) => path.endsWith(".md"))) {
  let fenced = false;
  git("show", `${tree}:${file}`)
    .split("\n")
    .forEach((line, index) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;

      if (fenced) return;
      const prose = line.replace(/`[^`]*`/g, "");
      const targets = [...prose.matchAll(inlineLink)].map((match) => match[1]);
      const reference = definition.exec(prose);

      if (reference) targets.push(reference[1]);

      for (const target of targets) {
        const resolved = resolve(file, target);

        if (resolved !== null && !known.has(resolved)) {
          broken.push(`${file}:${index + 1}: ${target.replace(/^<|>$/g, "")} -> ${resolved}`);
        }
      }
    });
}

if (broken.length) {
  console.error(`Broken relative Markdown links in ${tree}:\n${broken.join("\n")}`);
  process.exit(1);
}
