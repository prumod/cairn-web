# Upstream

- Source: https://github.com/dmmulroy/anti-slop
- Commit: `13909c9e07590f5a85d93c62712259fe14a883f7` (2026-10-13)
- Copied from: `skills/install-anti-slop/assets/anti-slop/` at that commit, which equals upstream `src/` without the `*.test.ts` RuleTester suites.
- Entry points: `tools/oxlint/anti-slop/index.ts` (generic rules) and `tools/oxlint/anti-slop/effect/index.ts` (Effect rules; `packages/infra` depends on `effect` directly).
- Oxlint: `oxlint` and `@oxlint/plugins` pinned to `1.89.0`.

## Local deviations

None. `oxfmt` ignores this directory so the copy stays identical to upstream.
