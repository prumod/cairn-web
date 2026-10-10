// Public production files sit at each module root; all subfolders are private.
const roots = [
  "web/src/pages",
  "web/src/shared",
  "backend/src/modules",
  "backend/src/shared",
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
      name: "frontend-cannot-import-backend",
      severity: "error",
      from: { path: "^web/" },
      to: { path: "^backend/" },
    },
    {
      name: "backend-cannot-import-frontend",
      severity: "error",
      from: { path: "^backend/" },
      to: { path: "^web/" },
    },
    {
      name: "cross-application-shared-is-independent",
      severity: "error",
      from: { path: "^shared/" },
      to: { path: "^(web|backend)/" },
    },
    {
      name: "frontend-shared-cannot-import-pages",
      severity: "error",
      from: { path: "^web/src/shared/" },
      to: { path: "^web/src/pages/" },
    },
    {
      name: "backend-shared-cannot-import-domain-modules",
      severity: "error",
      from: { path: "^backend/src/shared/" },
      to: { path: "^backend/src/modules/" },
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
      to: { couldNotResolve: true },
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
