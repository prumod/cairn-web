# Coding standards

## Sources of truth

Formatting, linting, and compiler rules live in the native tool configuration and root `package.json`; use the existing checks instead of maintaining a second style guide. Follow [Architecture](ARCHITECTURE.md) for system boundaries and [Testing](TESTING.md) for test contracts.

## Code and contracts

- Use names that expose intent. For domain vocabulary and architectural decisions, follow [Domain docs](docs/agents/domain.md).
- Match types to the runtime values and states the code supports. Validate external input at the boundary where it enters the application.
- Make failure behavior explicit; preserve useful error context rather than silently treating a failure as success.
- Keep changes scoped to the requested behavior. Add dependencies or abstractions for a concrete need, not a hypothetical one. For data-structure design, follow [Data structures](docs/agents/data-structures.md).
- When replacing a code path or interface, remove the obsolete implementation rather than retaining compatibility layers.

## Comments

Keep comments at the code site where they explain non-obvious rationale, invariants, external quirks or workarounds (including why they remain and when they can be removed), or safety-sensitive assumptions. Prefer clear names and tests for mechanics. Comments have no quota and should not narrate routine code.

## Documentation

Follow [Documentation maintenance](docs/agents/documentation.md) when a change affects a documented contract. Keep these standards current when an agreed coding convention changes.
