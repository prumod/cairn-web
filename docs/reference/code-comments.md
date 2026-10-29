# Code comments

A comment records what the author knew but the code cannot express: the abstraction a module provides, the meaning of a value, the reason for a choice, and the conditions under which code runs. Without it, the next reader must rederive or guess that knowledge, and a wrong guess becomes a bug.

Use one test for every comment: **could someone who has never seen this code write the comment by reading only the code next to it?** If yes, the comment repeats the code; delete it or say something the code does not. If no, the comment carries information and belongs.

Comments complement clear code; they do not replace it. Fix a bad name or a confusing structure in the code first, then comment what remains non-obvious.

## Kinds of comment

### Interface comments

An interface comment tells a caller what they need to know to use a function, class, type, or module without reading its body. It defines the abstraction.

Write one on each export that other modules use, unless its name and type already say everything a caller needs (for example, a typed constant or a plain re-export). Include only the items that apply, in this order:

1. **Behavior**: one or two sentences describing what the caller observes, not how the code achieves it.
2. **Arguments and result**: units, allowed ranges, inclusive or exclusive bounds, the meaning of `null`, `undefined`, or an empty value, and dependencies between arguments. Skip anything the type already states.
3. **Side effects**: any consequence that changes later behavior but is not part of the result, such as a database write, a network call, an analytics event, a cookie, or module-level state.
4. **Failures**: what the function throws or returns on failure, and which failures the caller must handle.
5. **Preconditions**: what must be true or must run first. Prefer removing a precondition to documenting it.
6. **How we get here**: for code that is not called directly (route handlers, server functions, event listeners, React effects, framework or Alchemy callbacks), say who invokes it and when.

For a deep module whose methods must work together in a non-obvious order, add a short usage example.

If the interface comment must describe the implementation for a caller to use the code correctly, the module is shallow. Treat that as a design problem, not a documentation problem.

### Data-structure members

Comment a field, property, or variable declaration when its name and type do not fully define it. Think nouns, not verbs: say what the value **represents**, not how code manipulates it. Cover, when relevant:

- Units (pixels or characters, milliseconds or seconds, cents or euros).
- Bounds (inclusive or exclusive) and the meaning of `null`, `undefined`, or empty.
- Invariants, such as "always contains at least one entry".
- Ownership: who must close, release, or clean up a resource.
- Domain meaning: use the term from the [glossary](../../GLOSSARY.md) and do not redefine it.

Prefer a named type with named fields over a tuple, a `Pair`-like object, or a generic `Record` whose keys and values do not say what they mean. A named type gives each element a name and a place for its comment.

### Implementation comments

An implementation comment helps a reader of the body understand **what** the code does and **why**, at a higher level than the code. It does not restate **how**.

- At the top of a long function, state the overall strategy, for example: `// Three phases: collect candidates, score each one, keep the best.` Put any phase detail just above that phase.
- Before a non-trivial loop, describe what one iteration does.
- Explain a tricky or surprising choice: a workaround, an external quirk, a security or safety assumption, or a deliberate omission. For a workaround, say why it remains and when it can be removed.
- For a bug fix with a subtle cause, explain the cause in one or two sentences and link the GitHub Issue for the full history.
- Comment a local variable only in a long function, and only when its uses are far apart.

### Cross-module comments

When a decision spans modules (a contract between client and server, a value that two packages must keep in sync, an ordering that one module relies on in another), document it once, in the most obvious place a maintainer would look. In every other affected place, add a short pointer, such as `// Must match the stage names in packages/infra/src/deployment.ts.` System-wide boundaries and invariants belong in [Architecture](../../ARCHITECTURE.md) instead.

## What not to write

- Comments at the same level of detail as the code, such as `// increment the counter` or `// return the user`.
- Change history, such as "now uses X" or "previously did Y". That belongs in the commit message. The reason a subtle fix is needed still belongs in the code.
- Commented-out code. Git keeps it.
- `TODO` or `FIXME` without a linked GitHub Issue.
- Restatements of external specifications or library documentation. Link the source instead, for example the RFC or the vendor page.
- Implementation details inside an interface comment.

## Placement

Keep each comment next to the code it describes, so a change to that code shows the comment in the same diff.

The farther a comment is from the code, the more abstract it should be. A line comment can be precise; a module header states the purpose and main concepts; repository documentation describes boundaries and never line-level details. Abstract comments also stay true longer.

Put the reason for a change in the code when a future reader needs it to change the code safely. Put the story of the change in the commit message.

## Writing comments first

Use interface comments as a design tool. For a new module or a new exported function:

1. Write the signature and its interface comment with an empty body.
2. Revise both until the comment is short and complete. A comment that cannot be short and complete reveals a complex interface; redesign before you implement.
3. Write the declarations and comments for the important fields.
4. Implement the bodies, adding implementation comments where needed. Write the interface comment for any function you discover before writing its body.

Coding agents that introduce a new module or a new package entry point show the signatures and interface comments to the user for review before they implement the bodies.

## Maintenance

- Update every affected comment in the same commit as the code change.
- Before committing, read the diff and check each comment near a changed line: is it still true, and does it still say something the code does not?
- When a reviewer says code is not obvious, it is not obvious. Clarify the code or add the missing comment; do not argue that it is clear.
- Keep one source for each piece of information and point to it from other places. When you move or delete the source, update the pointers.

## Format

- Use TSDoc block comments (`/** ... */`) for interface and data-structure comments, so editors show them on hover.
- Use line comments (`//`) for implementation comments.
- Write full sentences in English, matching the code identifiers.
- In TSDoc, start with prose. Add `@param`, `@returns`, or `@throws` only when the tag adds a constraint, meaning, or failure the type does not show.

## Review checklist

- Can a caller use each new export from its signature and interface comment alone?
- Are side effects, failures, preconditions, and indirect invocation documented where they exist?
- Does each non-obvious field state its meaning, units, bounds, and invariants?
- Does each implementation comment explain what or why at a higher level than the code?
- Is each cross-module decision documented once, with pointers from the other places?
- Does any comment repeat the code, narrate history, or describe implementation in an interface? Remove it.

## Source

This strategy adapts chapters 12–16 and 18 of John Ousterhout, _A Philosophy of Software Design_, 2nd edition, as summarized in the [reference notes](https://obsidian-vault-khaki.vercel.app/).
