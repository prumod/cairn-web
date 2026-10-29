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
    assert.ok(result.status !== null && result.status > 0, output);
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
    "apps/web/src/routes/api/example.ts",
    importing("apps/web/src/routes/api/example.ts", "apps/web/src/server/modules/one/entry.ts"),
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

  const page = "apps/web/src/pages/one/entry.ts";
  const rpc = "apps/web/src/pages/one/useCases/action/action.functions.ts";
  const useCase = "apps/web/src/pages/one/useCases/action/action.ts";
  const otherUseCase = "apps/web/src/pages/one/useCases/other/other.ts";
  const adapter = "apps/web/src/pages/one/infra/data.server.ts";

  for (const path of [rpc, useCase, adapter]) write(path, "export const value = 1;\n");
  write(page, importing(page, rpc));
  write(rpc, importing(rpc, useCase));
  write(adapter, importing(adapter, "packages/db/src/index.ts"));
  cruise();
  write(rpc, importing(rpc, adapter));
  cruise();
  console.log("PASS: same-feature UI → RPC → application/server adapter → database.");
  prove(page, adapter, "client-cannot-import-server");
  prove("apps/web/src/pages/two/probe.ts", rpc, "entrypoint-boundary-apps-web-src-pages");
  prove(useCase, adapter, "feature-usecase-cannot-import-adapters");
  prove(useCase, rpc, "feature-usecase-cannot-import-adapters");
  write(otherUseCase, "export const value = 1;\n");
  prove(useCase, otherUseCase, "feature-usecase-is-independent");
  const domainRule = "apps/web/src/pages/one/domain/access.ts";
  write(domainRule, "export const value = 1;\n");
  write(useCase, importing(useCase, domainRule));
  cruise();
  write(useCase, "export const value = 1;\n");
  prove(domainRule, useCase, "feature-domain-is-independent");
  prove(domainRule, adapter, "feature-domain-is-independent");

  for (const target of [
    "packages/db/src/index.ts",
    "apps/web/src/server/modules/one/entry.ts",
    "apps/web/src/pages/one/entry.ts",
  ]) {
    prove(useCase, target, "feature-usecase-is-independent");
  }

  prove(rpc, "apps/web/src/pages/one/entry.ts", "rpc-cannot-import-client");
  write(useCase, 'import { request as value } from "node:http"; export { value };\n');
  cruise("feature-usecase-is-independent");
  write(useCase, "export const value = 1;\n");
  write("shared/src/one/pure.ts", "export const value = 1;\n");
  write(useCase, importing(useCase, "shared/src/one/pure.ts"));
  cruise();
  prove(
    "shared/src/one/pure.ts",
    "packages/auth/src/index.ts",
    "cross-application-shared-is-independent",
  );
  prove(
    "apps/web/src/routes/index.tsx",
    "apps/web/src/server/modules/one/entry.ts",
    "client-cannot-import-server",
  );

  for (const packageName of ["react", "@tanstack/react-start", "drizzle-orm"]) {
    const target = `node_modules/${packageName}/index.ts`;
    write(target, "export const value = 1;\n");
    prove(useCase, target, "feature-usecase-is-independent");
    prove("shared/src/one/pure.ts", target, "cross-application-shared-is-independent");
  }

  // Indirect UI imports cannot hide server-only dependencies in a generic app helper.
  write("apps/web/src/bridge.ts", "export const value = 1;\n");
  write(page, importing(page, "apps/web/src/bridge.ts"));
  prove("apps/web/src/bridge.ts", "packages/db/src/index.ts", "client-cannot-import-server");
  prove("apps/web/src/bridge.ts", adapter, "client-cannot-import-server");
  prove(
    "shared/src/two/probe.ts",
    "packages/db/src/index.ts",
    "cross-application-shared-is-independent",
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
