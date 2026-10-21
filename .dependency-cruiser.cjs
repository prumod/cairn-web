// Public production files sit at each module root; all subfolders are private.
const roots = [
  "web/src/pages",
  "web/src/shared",
  "web/src/server/modules",
  "web/src/server/shared",
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
      from: { path: "^web/src/(?:pages|shared)/" },
      to: { path: "^web/src/server/" },
    },
    {
      name: "server-cannot-import-client",
      severity: "error",
      from: { path: "^web/src/server/" },
      to: { path: "^web/src/(?:pages|shared)/" },
    },
    {
      name: "cross-application-shared-is-independent",
      severity: "error",
      from: { path: "^shared/" },
      to: { path: "^web/" },
    },
    {
      name: "frontend-shared-cannot-import-pages",
      severity: "error",
      from: { path: "^web/src/shared/" },
      to: { path: "^web/src/pages/" },
    },
    {
      name: "server-shared-cannot-import-domain-modules",
      severity: "error",
      from: { path: "^web/src/server/shared/" },
      to: { path: "^web/src/server/modules/" },
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-unresolved-imports",
      severity: "error",
      from: {},
      // cloudflare:* modules are provided by the Workers runtime, not installed packages.
      to: { couldNotResolve: true, pathNot: "^cloudflare:" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "node", "default"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
    },
  },
};
