# Use TypeScript 7 and parse dependencies with swc

## Status

Accepted

## Context

TypeScript 7 is the native Go compiler and has no JavaScript API. dependency-cruiser used that API to parse `.ts` files; with TypeScript 7 it silently cruised 11 of 84 modules.

## Decision

Upgrade to TypeScript 7 and configure dependency-cruiser to parse with `@swc/core` (`options.parser: "swc"` in `.dependency-cruiser.cjs`).

The rejected alternative was keeping TypeScript 6 for its JavaScript API and adding the native preview compiler only for type checking. That keeps two TypeScript versions in the toolchain.

## Consequences

- One TypeScript version serves type checking and the editor.
- swc reports type-only imports, so the boundary rules now apply to `import type`. The circular-dependency rule ignores cycles made only of type-only imports, because TanStack Router's generated route tree imports the router type.
- Tools that need the TypeScript JavaScript API cannot run against this toolchain.
