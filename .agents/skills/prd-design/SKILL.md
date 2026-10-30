---
name: prd-design
description: Turn a PRD issue and its research into an approved technical design, published as a sub-issue of the PRD.
disable-model-invocation: true
---

# Technical design for a PRD

Second step of the PRD workflow: `prd-research` → `prd-design` → `prd-slices` → `prd-implement`.

The design says how the system delivers the PRD's stories and replicates `apps/web/references/final-visual/`. It never changes product behavior. When the design reveals a product gap or contradiction, list it under **PRD changes** in your report, with the story number, so the user applies it to the PRD and `final-visual/`. Continue with the parts it does not block.

## 1. Load context

Read in full: `.rpi/<slug>/research.md` (when it is missing, run `prd-research` first), the PRD issue with comments, the scoped part of `final-visual/`, [`CODING_STANDARDS.md`](../../../CODING_STANDARDS.md), [project structure](../../../docs/reference/project-structure.md), and the ADRs that touch the area. Investigate factual gaps in the code yourself and update `research.md`.

Write the skeleton of `.rpi/<slug>/design.md`, in English: links to the PRD and the stories in scope, then empty **System design**, **Program design**, **Safeguards**, and **Decisions** sections.

## 2. Decide

Work through consequential decisions in order, starting with the one that unblocks most of the rest: **System design** first (modules, data model and migrations, server functions and endpoints, external sources, jobs), then **Program design** inside those pieces (domain types, use cases, seams, test boundaries). Express each as a delta from the research. Get the user's approval of System design before Program design.

For each consequential decision:

1. Lay out the facts and constraints from the research and the PRD.
2. Ask the user how they would approach it, one question per message. When they already gave an approach, pressure-test it instead.
3. Surface tradeoffs and failure modes. Offer an alternative or a recommendation when it shows an important tradeoff or the user asks.
4. Record the user's choice, its rationale, and the alternatives considered under the owning section. A recommendation alone resolves nothing.

Leave routine coding details to implementation. When a decision is a real tradeoff with meaningful alternatives, note it for an ADR in `docs/adr/`, written during implementation.

Under **Safeguards**, name each failure the change could cause that harms data or users, and the check or test that covers it. Mark irreversible actions, such as a destructive migration or a write to an external system; they need a fresh-context review before they run.

**Done:** the user has reviewed the whole design top to bottom and approved it, and no consequential question in scope is open.

## 3. Publish

Create a GitHub issue titled `Technical design: <scope>` from `design.md`, and add it as a sub-issue of the PRD ([issue tracker](../../../docs/agents/issue-tracker.md)). From here on the issue is the source of truth; edit the issue, not the file.

## 4. Report

Give the issue link, any **PRD changes**, and the next step: `prd-slices` with the design issue number.
