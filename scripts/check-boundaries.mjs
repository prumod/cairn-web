import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const paths = [
  "apps/web/src",
  "apps/web/tests",
  "packages/auth/src",
  "packages/db/src",
  "packages/ui/src",
  "packages/infra/alchemy.run.ts",
  "packages/infra/test",
  "shared/src",
].filter((path) => existsSync(path));
if (paths.length === 0) throw new Error("No application source found for boundary checks.");
const result = spawnSync(
  process.execPath,
  ["node_modules/dependency-cruiser/bin/dependency-cruiser.mjs", ...paths],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
