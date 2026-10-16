import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const paths = ["web/src", "web/tests", "backend/src", "backend/tests", "shared/src"].filter(
  (path) => existsSync(path),
);
if (paths.length === 0) throw new Error("No application source found for boundary checks.");
const result = spawnSync(
  process.execPath,
  ["node_modules/dependency-cruiser/bin/dependency-cruiser.mjs", ...paths],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
