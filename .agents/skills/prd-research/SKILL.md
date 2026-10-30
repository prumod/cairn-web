---
name: prd-research
description: Research the current code that a PRD issue's stories will touch, before technical design.
disable-model-invocation: true
---

# Research the code for a PRD

First step of the PRD workflow: `prd-research` → `prd-design` → `prd-slices` → `prd-implement`.

The product side is already settled. The PRD issue owns the problem and behavior; `apps/web/references/final-visual/` owns the appearance and interactions ([evolution method](../../../docs/product/system/prototype.md#método-de-evolução)). Research establishes only what is true in the code today, so design can state the delta. It is descriptive: record what exists, never what should exist.

## 1. Scope

Input: a PRD issue number, plus optionally the stories or feature IDs (for example N03, N14) to cover. Default to the whole PRD.

Read in full: `gh issue view <n> --comments`, the part of `final-visual/` that renders the scoped stories, and the documents [`docs/agents/domain.md`](../../../docs/agents/domain.md) lists. Choose a kebab-case slug and use `.rpi/<slug>/` (gitignored) as the draft directory.

Write the research questions as a short list at the top of `.rpi/<slug>/research.md`. Each question asks what the code does today where a scoped story will land: existing modules, data, seams, use cases, acceptance tests in `features/`, and the patterns a new slice should follow. Leave product questions out; the PRD answers them.

## 2. Investigate

Group related questions by code area and dispatch 2–6 read-only subagents in parallel, one per area. Each returns findings with `path:line` evidence. Read files yourself where a finding is central or the subagents disagree.

## 3. Write

Fill `research.md` below the questions, in English:

- **Current state**: per area, what exists and how it works, with `path:line` evidence.
- **Patterns to follow**: the existing examples a new slice should copy, including the test boundary.
- **Gaps**: per scoped story, what the PRD and `final-visual/` require that the code lacks, stated as fact, without a design.
- **Conflicts**: where the code, an ADR, or `GLOSSARY.md` contradicts the PRD.
- **Open questions**: what evidence could not settle.

Run one more targeted pass on the open questions, update the sections in place, and leave the remainder open.

**Done:** every question is answered with evidence or listed as open after that one extra pass.

## 4. Report

Give the path to `research.md`, the gaps and conflicts in a few lines, and the next step: `prd-design` with this slug.
