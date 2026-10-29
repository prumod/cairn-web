// Public production files sit at each module root; all subfolders are private.
const roots = [
  "apps/web/src/pages",
  "apps/web/src/shared",
  "apps/web/src/server/modules",
  "apps/web/src/server/shared",
  "shared/src",
];
const modulePath = `^(?:${roots.join("|")})/[^/]+/`;
const internals = `^(?:${roots.join("|")})/[^/]+/[^/]+/`;
const tests = "(?:\\.(?:spec|test)\\.[cm]?[jt]sx?$|(?:^|/)(?:tests|testSupport|fixtures)/)";

module.exports = {
  forbidden: [
    {
      name: "entrypoint-boundary-from-app",
      severity: "error",
      from: { pathNot: modulePath },
      to: { path: internals },
    },
    ...roots.flatMap((root) => [
      {
        name: `entrypoint-boundary-${root.replaceAll("/", "-")}`,
        severity: "error",
        from: { path: `^${root}/([^/]+)/` },
        to: { path: internals, pathNot: `^${root}/$1/` },
      },
      {
        name: `tests-private-${root.replaceAll("/", "-")}`,
        severity: "error",
        from: { path: `^${root}/([^/]+)/` },
        to: { path: `^(?:${roots.join("|")})/[^/]+/.*${tests}`, pathNot: `^${root}/$1/` },
      },
    ]),
    {
      name: "app-cannot-import-module-tests",
      severity: "error",
      from: { pathNot: modulePath },
      to: { path: `^(?:${roots.join("|")})/[^/]+/.*${tests}` },
    },
    {
      name: "production-cannot-import-tests",
      severity: "error",
      from: { pathNot: tests },
      to: { path: tests },
    },
    {
      name: "client-cannot-import-server",
      severity: "error",
      from: { path: "^(?:apps/web/src/(?:pages|shared)/|packages/ui/)" },
      to: {
        path: "^(?:apps/web/src/(?:server/|env\\.server|services)|packages/(?:auth|db|infra)/|@cairn/(?:auth|db|infra)(?:/|$)|cloudflare:)",
      },
    },
    {
      name: "server-cannot-import-client",
      severity: "error",
      from: { path: "^apps/web/src/server/" },
      to: { path: "^apps/web/src/(?:pages|shared)/" },
    },
    {
      name: "cross-application-shared-is-independent",
      severity: "error",
      from: { path: "^shared/" },
      to: { path: "^(?:apps/web/|packages/(?:auth|db|infra|ui)/)" },
    },
    {
      name: "frontend-shared-cannot-import-pages",
      severity: "error",
      from: { path: "^apps/web/src/shared/" },
      to: { path: "^apps/web/src/pages/" },
    },
    {
      name: "server-shared-cannot-import-domain-modules",
      severity: "error",
      from: { path: "^apps/web/src/server/shared/" },
      to: { path: "^apps/web/src/server/modules/" },
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      // TanStack Router's generated route tree imports the router back as a type.
      to: { circular: true, viaOnly: { dependencyTypesNot: ["type-only"] } },
    },
    {
      name: "no-unresolved-imports",
      severity: "error",
      from: {},
      to: { couldNotResolve: true, pathNot: "^cloudflare:workers$" },
    },
  ],
  options: {
    // TypeScript 7 has no JavaScript API, so parse TypeScript with swc.
    parser: "swc",
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "node", "default"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
    },
  },
};
