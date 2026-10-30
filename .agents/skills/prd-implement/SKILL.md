---
name: prd-implement
description: Implement one slice issue through ATDD and open its pull request.
disable-model-invocation: true
---

# Implement a slice

Last step of the PRD workflow: `prd-research` → `prd-design` → `prd-slices` → `prd-implement`.

Inside the approved design, routine implementation is yours to decide. Stop for the user only at a boundary change: evidence that contradicts the design or the PRD, or an irreversible action the design does not cover. Report the evidence, the impact, and the decision needed; continue with unaffected work.

## 1. Load context

Read the slice issue, its blockers (they must be closed), the design issue, the PRD stories it names, and the part of `final-visual/` it replicates. Run `git fetch origin` and confirm the branch contains `origin/main`; when it does not, ask the user before continuing from a stale base.

## 2. Implement

Call the Skill tool with "atdd" to drive the slice's scenarios from the issue to green.

- The UI replicates `final-visual/` exactly and uses production services instead of fictitious data and simulated actions ([evolution method](../../../docs/product/system/prototype.md#produção--réplica-exata-do-final-visual)).
- Write the ADRs the design noted, and update the documentation [`docs/agents/documentation.md`](../../../docs/agents/documentation.md) requires.
- Before an irreversible action marked in the design, get a fresh-context, read-only review of its safeguards and record the result in the PR.
- When this slice completes the replication of `final-visual/`, delete `apps/web/references/final-visual/` in the same change.

## 3. Verify

Run `bun run check`. Fix failures until it passes; for a failing hook, read [`docs/agents/checks.md`](../../../docs/agents/checks.md).

**Done:** the slice's scenarios pass, `bun run check` passes, and each acceptance criterion in the issue is met.

## 4. Pull request

Call the Skill tool with "prd-describe-pr".
