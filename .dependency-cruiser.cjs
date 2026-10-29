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

// Only compiled RPC entries may bridge client code to server-only implementations.
const serverRoutes = "^apps/web/src/routes/(?:api/|healthz\\.ts$)";
const featureServer = "^apps/web/src/pages/[^/]+/.*\\.server\\.[jt]sx?$";
const featureFunctions = "^apps/web/src/pages/[^/]+/useCases/[^/]+/[^/]+\\.functions\\.[jt]s$";

const serverSource =
  "^(?:apps/web/src/(?:server/|env\\.server|services)|apps/web/src/pages/[^/]+/.*\\.server\\.[jt]sx?$)";

const serverTarget =
  "^(?:apps/web/src/(?:server/|env\\.server|services)|.*\\.server\\.[jt]sx?$|packages/(?:auth|db|infra)/|@cairn/(?:auth|db|infra)(?:/|$)|cloudflare:)";

const pureUseCase = "^apps/web/src/pages/([^/]+)/useCases/([^/]+)/[^/]+\\.ts$";
const pureDomain = "^apps/web/src/pages/([^/]+)/domain/[^/]+\\.ts$";

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
      from: {
        path: "^(?:apps/web/src/|packages/ui/)",
        pathNot: [
          serverSource,
          featureFunctions,
          serverRoutes,
          "^apps/web/src/routeTree\\.gen\\.ts$",
          tests,
        ],
      },
      to: {
        path: [
          serverTarget,
          serverRoutes,
          "^(?:node:|.*node_modules/(?:drizzle-orm/|@neondatabase/|@tanstack/(?:start-server-core/|react-start/.*server)))",
        ],
      },
    },
    {
      name: "feature-usecase-is-independent",
      severity: "error",
      from: { path: pureUseCase, pathNot: ["\\.(?:server|functions)\\.ts$", tests] },
      to: {
        pathNot: [
          "^apps/web/src/pages/$1/useCases/$2/[^/]+\\.ts$",
          "^apps/web/src/pages/$1/domain/[^/]+\\.ts$",
          "^shared/src/",
        ],
      },
    },
    {
      name: "feature-domain-is-independent",
      severity: "error",
      from: { path: pureDomain, pathNot: ["\\.(?:server|functions)\\.ts$", tests] },
      to: { pathNot: ["^apps/web/src/pages/$1/domain/[^/]+\\.ts$", "^shared/src/"] },
    },
    {
      name: "feature-usecase-cannot-import-adapters",
      severity: "error",
      from: { path: pureUseCase, pathNot: ["\\.(?:server|functions)\\.ts$", tests] },
      to: { path: "\\.(?:server|functions)\\.ts$" },
    },
    {
      name: "rpc-cannot-import-client",
      severity: "error",
      from: { path: featureFunctions },
      to: {
        path: "^apps/web/src/(?:shared/|pages/)",
        pathNot: "^apps/web/src/pages/[^/]+/(?:useCases|domain|infra)/",
      },
    },
    {
      name: "server-cannot-import-client",
      severity: "error",
      from: { path: serverSource },
      to: {
        path: "^apps/web/src/(?:pages|shared)/",
        pathNot: [
          featureServer,
          featureFunctions,
          "^apps/web/src/pages/[^/]+/(?:useCases/[^/]+|domain)/[^/]+\\.ts$",
        ],
      },
    },
    {
      name: "cross-application-shared-is-independent",
      severity: "error",
      from: { path: "^shared/" },
      to: {
        path: "^(?:apps/web/|packages/(?:auth|db|infra|ui)/|@cairn/|@tanstack/|react(?:/|$)|drizzle-orm|cloudflare:|node:|zod(?:/|$)|.*node_modules/(?:@tanstack/|react(?:/|$)|react-dom/|drizzle-orm/|@neondatabase/|zod/))",
      },
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
