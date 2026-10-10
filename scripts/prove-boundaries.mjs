import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("../", import.meta.url));
const sandbox = mkdtempSync(join(tmpdir(), "cairn-boundaries-"));
const roots = [
  "web/src/pages",
  "web/src/shared",
  "backend/src/modules",
  "backend/src/shared",
  "shared/src",
];

function write(path, content) {
  const target = join(sandbox, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function importing(from, to) {
  let path = relative(dirname(from), to).replaceAll("\\", "/").replace(/\.ts$/, "");
  if (!path.startsWith(".")) path = `./${path}`;
  return `import { value } from "${path}"; export { value };\n`;
}

function cruise(expectedRule) {
  const result = spawnSync(
    process.execPath,
    [
      join(repository, "node_modules/dependency-cruiser/bin/dependency-cruiser.mjs"),
      "--config",
      join(repository, ".dependency-cruiser.cjs"),
      "web",
      "backend",
      "shared",
    ],
    { cwd: sandbox, encoding: "utf8" },
  );
  if (result.error) throw result.error;
  const output = `${result.stdout}\n${result.stderr}`;
  if (expectedRule) {
    assert.equal(result.status, 1, output);
    assert.ok(output.includes(expectedRule), output);
  } else {
    assert.equal(result.status, 0, output);
  }
}

function prove(from, to, rule) {
  write(from, importing(from, to));
  cruise(rule);
  write(from, "export const value = 1;\n");
  cruise();
  console.log(`PASS: ${rule} rejects the import; restored graph passes.`);
}

try {
  for (const root of roots) {
    write(
      `${root}/one/entry.ts`,
      importing(`${root}/one/entry.ts`, `${root}/one/implementation/value.ts`),
    );
    write(`${root}/one/implementation/value.ts`, "export const value = 1;\n");
    write(
      `${root}/one/implementation/value.spec.ts`,
      importing(`${root}/one/implementation/value.spec.ts`, `${root}/one/implementation/value.ts`),
    );
    write(
      `${root}/one/entry.spec.ts`,
      importing(`${root}/one/entry.spec.ts`, `${root}/one/entry.ts`),
    );
    write(`${root}/two/entry.ts`, "export const value = 1;\n");
  }
  write("web/src/main.ts", importing("web/src/main.ts", "web/src/pages/one/entry.ts"));
  write(
    "backend/tests/acceptance/integration/example.spec.ts",
    importing(
      "backend/tests/acceptance/integration/example.spec.ts",
      "backend/src/modules/one/entry.ts",
    ),
  );
  cruise();
  console.log(
    "PASS: public entry points, own-module private unit imports, and non-unit public imports.",
  );

  for (const root of roots) {
    prove(
      `${root}/two/probe.ts`,
      `${root}/one/implementation/value.ts`,
      `entrypoint-boundary-${root.replaceAll("/", "-")}`,
    );
    prove(
      `${root}/two/probe.spec.ts`,
      `${root}/one/entry.spec.ts`,
      `tests-private-${root.replaceAll("/", "-")}`,
    );
  }
  prove(
    "web/src/main.ts",
    "web/src/pages/one/implementation/value.ts",
    "entrypoint-boundary-from-app",
  );
  prove(
    "backend/tests/acceptance/integration/example.spec.ts",
    "backend/src/modules/one/implementation/value.ts",
    "entrypoint-boundary-from-app",
  );
  prove(
    "web/src/pages/two/probe.ts",
    "web/src/pages/two/probe.spec.ts",
    "production-cannot-import-tests",
  );
  prove(
    "backend/tests/acceptance/integration/example.spec.ts",
    "backend/src/modules/one/entry.spec.ts",
    "app-cannot-import-module-tests",
  );
  prove(
    "web/src/pages/two/probe.ts",
    "backend/src/modules/one/entry.ts",
    "frontend-cannot-import-backend",
  );
  prove(
    "backend/src/modules/two/probe.ts",
    "web/src/pages/one/entry.ts",
    "backend-cannot-import-frontend",
  );
  prove(
    "shared/src/two/probe.ts",
    "web/src/pages/one/entry.ts",
    "cross-application-shared-is-independent",
  );
  prove(
    "shared/src/two/probe.ts",
    "backend/src/modules/one/entry.ts",
    "cross-application-shared-is-independent",
  );
  prove(
    "web/src/shared/two/probe.ts",
    "web/src/pages/one/entry.ts",
    "frontend-shared-cannot-import-pages",
  );
  prove(
    "backend/src/shared/two/probe.ts",
    "backend/src/modules/one/entry.ts",
    "backend-shared-cannot-import-domain-modules",
  );
  write(
    "web/src/pages/two/cycle.ts",
    importing("web/src/pages/two/cycle.ts", "web/src/pages/two/probe.ts"),
  );
  prove("web/src/pages/two/probe.ts", "web/src/pages/two/cycle.ts", "no-circular");
  prove("web/src/pages/two/probe.ts", "web/src/pages/two/missing.ts", "no-unresolved-imports");
} finally {
  // Remove only the isolated temporary project created by this process.
  rmSync(sandbox, { recursive: true, force: true });
}
