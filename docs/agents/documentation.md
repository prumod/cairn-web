# Documentation maintenance

Before changing a documented contract, read the current architecture and testing contracts relevant to the work. After changing code, update affected documentation in the same commit.

- Update `ARCHITECTURE.md` when system boundaries, dependencies, or invariants change. Record current behavior separately from plans.
- Record an ADR in `docs/adr/` only for a real, consequential trade-off with meaningful alternatives. Create the directory with the first decision; preserve earlier decisions when a later one supersedes them.
- Update root or nested `AGENTS.md` only for conventions that apply at that scope. Add a nested file only when a module has its own convention.
- Update `TESTING.md` when test boundaries or testing contracts change. Keep runnable command and file-discovery lists in package scripts and native test configuration.
- Update `CODING_STANDARDS.md` when an agreed coding convention changes. It owns the [code comment standards](../../CODING_STANDARDS.md#comments).

When given a Git commit range, review the code and affected contracts at both endpoints. Use `git diff <base>..<head> -- <relevant-paths>` and `git show <revision>:<path>` to distinguish changed behavior from documentation drift; cite file and line evidence. Update current contracts in the same change, rather than maintaining a duplicate chronological code changelog.
