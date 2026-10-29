import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const transcriptionsDir = "docs/product/transcriptions";
// The product README links every incorporated source in "Estatuto das fontes e
// convenções", so a link there is the record that a transcription was incorporated.
export const markerDoc = "docs/product/README.md";

// Sensor and controller in one pass: list sources the marker document does not
// link yet, and select the oldest one as the next interview to incorporate.
export function pendingTranscriptions({ files, marker, addedAt }) {
  const linked = (file) =>
    marker.includes(`transcriptions/${file}`) ||
    marker.includes(`transcriptions/${encodeURI(file)}`);
  const pending = files
    .filter((file) => !linked(file))
    .toSorted((a, b) => addedAt(a) - addedAt(b) || a.localeCompare(b));
  const interviews = [...marker.matchAll(/\[T(\d+)\]\(transcriptions\//g)].map((m) => Number(m[1]));
  const lastInterview = Math.max(0, ...interviews);
  return {
    pending,
    next: pending.length ? { file: pending[0], interview: lastInterview + 1 } : null,
  };
}

// Untracked files (dropped locally, not yet committed) sort after committed ones.
function gitAddedAt(file) {
  const out = execFileSync(
    "git",
    ["log", "--diff-filter=A", "--format=%ct", "--", `${transcriptionsDir}/${file}`],
    { encoding: "utf8" },
  ).trim();
  return out ? Number(out.split("\n").at(-1)) : Number.POSITIVE_INFINITY;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = readdirSync(transcriptionsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => entry.name);
  const result = pendingTranscriptions({
    files,
    marker: readFileSync(markerDoc, "utf8"),
    addedAt: gitAddedAt,
  });
  console.log(JSON.stringify(result, null, 2));
}
