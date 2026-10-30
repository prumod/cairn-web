---
name: prd-slices
description: Break an approved technical design into tracer-bullet slice issues with blocking edges.
disable-model-invocation: true
---

# Slice a technical design

Third step of the PRD workflow: `prd-research` → `prd-design` → `prd-slices` → `prd-implement`.

## 1. Load context

Read the design issue and its parent PRD issue, with comments. Read `.rpi/<slug>/research.md` when it exists, and the feature files in `features/` for the area.

## 2. Draft tracer-bullet slices

Each slice is a narrow, complete path through every layer a behavior needs: domain, persistence, server, the UI that replicates its part of `final-visual/`, and its acceptance scenarios. A finished slice is demoable or verifiable on its own and fits in one fresh context window. Order a prefactoring slice first when the design calls for one. A wide mechanical change that cannot land green in parts is one slice.

For each slice, determine:

- **Stories**: the PRD story numbers it delivers.
- **Scenarios**: the `.feature` files and scenarios it adds or changes, by name.
- **Design**: the sections of the design issue it implements, as links.
- **What it delivers**: the end-to-end behavior, by module and responsibility, without file paths.
- **Blocked by**: the slices that genuinely gate it.

Every story in the design's scope belongs to exactly one slice.

## 3. Review

Present the slices as a numbered list: title, stories, blocked by, what it delivers. Ask whether the granularity, the blocking edges, and any merges or splits are right. Iterate until the user approves.

## 4. Publish

Create the issues in dependency order, blockers first, as sub-issues of the design issue, with native blocking edges and the `ready-for-agent` label ([issue tracker](../../../docs/agents/issue-tracker.md)). Leave the design and PRD issues unchanged. Body:

```markdown
## Context

Design: #<design>. PRD: #<prd>, stories <numbers>.

## What to build

<end-to-end behavior>

## Acceptance criteria

- [ ] Scenario `<feature file>: <scenario>` passes
- [ ] The UI matches `final-visual/` for <screens or states>

## Blocked by

- #<n>, or "None (can start immediately)"
```

## 5. Report

List the issues in order with links, and the next step: `prd-implement` with the first unblocked issue.
