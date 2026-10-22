import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("../", import.meta.url));
const sandbox = mkdtempSync(join(tmpdir(), "cairn-boundaries-"));
const roots = [
  "apps/web/src/pages",
  "apps/web/src/shared",
  "apps/web/src/server/modules",
  "apps/web/src/server/shared",
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
      "apps/web",
      "packages",
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
  write("packages/auth/src/index.ts", "export const value = 1;\n");
  write("packages/db/src/index.ts", "export const value = 1;\n");
  write("packages/infra/alchemy.run.ts", "export const value = 1;\n");
  write("packages/ui/src/probe.ts", "export const value = 1;\n");
  write(
    "apps/web/src/main.ts",
    importing("apps/web/src/main.ts", "apps/web/src/pages/one/entry.ts"),
  );
  write(
    "apps/web/tests/acceptance/integration/example.spec.ts",
    importing(
      "apps/web/tests/acceptance/integration/example.spec.ts",
      "apps/web/src/server/modules/one/entry.ts",
    ),
  );
  write(
    "apps/web/src/routes/index.ts",
    importing("apps/web/src/routes/index.ts", "apps/web/src/server/modules/one/entry.ts"),
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
    "apps/web/src/main.ts",
    "apps/web/src/pages/one/implementation/value.ts",
    "entrypoint-boundary-from-app",
  );
  prove(
    "apps/web/tests/acceptance/integration/example.spec.ts",
    "apps/web/src/server/modules/one/implementation/value.ts",
    "entrypoint-boundary-from-app",
  );
  prove(
    "apps/web/src/pages/two/probe.ts",
    "apps/web/src/pages/two/probe.spec.ts",
    "production-cannot-import-tests",
  );
  prove(
    "apps/web/tests/acceptance/integration/example.spec.ts",
    "apps/web/src/server/modules/one/entry.spec.ts",
    "app-cannot-import-module-tests",
  );
  prove(
    "apps/web/src/pages/two/probe.ts",
    "apps/web/src/server/modules/one/entry.ts",
    "client-cannot-import-server",
  );
  for (const target of [
    "packages/auth/src/index.ts",
    "packages/db/src/index.ts",
    "packages/infra/alchemy.run.ts",
  ]) {
    prove("apps/web/src/pages/two/probe.ts", target, "client-cannot-import-server");
    prove("packages/ui/src/probe.ts", target, "client-cannot-import-server");
  }
  prove(
    "apps/web/src/server/modules/two/probe.ts",
    "apps/web/src/pages/one/entry.ts",
    "server-cannot-import-client",
  );
  prove(
    "shared/src/two/probe.ts",
    "apps/web/src/pages/one/entry.ts",
    "cross-application-shared-is-independent",
  );
  prove(
    "shared/src/two/probe.ts",
    "apps/web/src/server/modules/one/entry.ts",
    "cross-application-shared-is-independent",
  );
  prove(
    "apps/web/src/shared/two/probe.ts",
    "apps/web/src/pages/one/entry.ts",
    "frontend-shared-cannot-import-pages",
  );
  prove(
    "apps/web/src/server/shared/two/probe.ts",
    "apps/web/src/server/modules/one/entry.ts",
    "server-shared-cannot-import-domain-modules",
  );
  write(
    "apps/web/src/pages/two/cycle.ts",
    importing("apps/web/src/pages/two/cycle.ts", "apps/web/src/pages/two/probe.ts"),
  );
  prove("apps/web/src/pages/two/probe.ts", "apps/web/src/pages/two/cycle.ts", "no-circular");
  prove(
    "apps/web/src/pages/two/probe.ts",
    "apps/web/src/pages/two/missing.ts",
    "no-unresolved-imports",
  );
} finally {
  // Remove only the isolated temporary project created by this process.
  rmSync(sandbox, { recursive: true, force: true });
}
