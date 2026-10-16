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
  "web/src/server/modules",
  "web/src/server/shared",
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
    "web/tests/acceptance/integration/example.spec.ts",
    importing(
      "web/tests/acceptance/integration/example.spec.ts",
      "web/src/server/modules/one/entry.ts",
    ),
  );
  write(
    "web/src/routes/index.ts",
    importing("web/src/routes/index.ts", "web/src/server/modules/one/entry.ts"),
  );
  cruise();
  console.log(
    "PASS: public entry points, route-to-server imports, own-module tests, and integration tests.",
  );

  for (const root of roots) {
    const ruleName = `entrypoint-boundary-${root.replaceAll("/", "-")}`;
    prove(`${root}/two/probe.ts`, `${root}/one/implementation/value.ts`, ruleName);
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
    "web/tests/acceptance/integration/example.spec.ts",
    "web/src/server/modules/one/implementation/value.ts",
    "entrypoint-boundary-from-app",
  );
  prove(
    "web/src/pages/two/probe.ts",
    "web/src/pages/two/probe.spec.ts",
    "production-cannot-import-tests",
  );
  prove(
    "web/tests/acceptance/integration/example.spec.ts",
    "web/src/server/modules/one/entry.spec.ts",
    "app-cannot-import-module-tests",
  );
  prove(
    "web/src/pages/two/probe.ts",
    "web/src/server/modules/one/entry.ts",
    "client-cannot-import-server",
  );
  prove(
    "web/src/server/modules/two/probe.ts",
    "web/src/pages/one/entry.ts",
    "server-cannot-import-client",
  );
  prove(
    "shared/src/two/probe.ts",
    "web/src/pages/one/entry.ts",
    "cross-application-shared-is-independent",
  );
  prove(
    "shared/src/two/probe.ts",
    "web/src/server/modules/one/entry.ts",
    "cross-application-shared-is-independent",
  );
  prove(
    "web/src/shared/two/probe.ts",
    "web/src/pages/one/entry.ts",
    "frontend-shared-cannot-import-pages",
  );
  prove(
    "web/src/server/shared/two/probe.ts",
    "web/src/server/modules/one/entry.ts",
    "server-shared-cannot-import-domain-modules",
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
