---
name: prd-describe-pr
description: Create or update the current branch's pull request with a reviewed description, including after a prd-implement slice is verified.
---

# Create or Update One Pull Request

Create or update exactly one pull request for the current branch. Keep the description in memory and send it directly to GitHub; do not create `.rpi` files, task artifacts, walkthroughs, or other local output files.

## Steps

1. **Read the template**

   Read [the PR description template](references/pr_description_template.md).

2. **Find or create the current-branch PR**

   - Check for an associated PR: `gh pr view --json url,number,title,state,baseRefName,headRefName,commits,files 2>/dev/null`.
   - If it exists, use it.
   - Otherwise inspect `git status --short --branch`. When the current branch clearly contains the requested work, commit its relevant uncommitted changes using the repository's normal safety protocol, push the branch if needed, then create its PR with `gh pr create --base <default-branch> --head <current-branch> --title <concise-title>`.
   - Ask the user to choose an existing PR only when the current branch has no relevant work.

   **Done:** one current-branch PR has been identified or created.

3. **Review the change**

   - Read `gh pr diff {number}` in full and inspect context required to explain each change.
   - Get repository metadata with `gh repo view --json owner,name`.
   - Derive a ticket link only when it is evident from the branch name, PR title, commits, or linked issue; otherwise omit it.
   - Identify user-facing behavior, implementation choices, breaking changes, verification evidence, and whether the PR changes the project's UI.
   - When the work comes from a slice issue, read the slice, its design issue, and the PRD stories it names. Compare actual changes against the PRD stories, the approved design, and `apps/web/references/final-visual/`; a PR description does not approve consequential deviations.

   **Done:** every changed file is accounted for in the PR description, and the PR is classified as UI-changing or non-UI-changing.

4. **Compose the description**

   Fill the template in memory:

   - Author line: `Autor: @<login>`, the GitHub login the commits were attributed to.
   - Header links: include the slice, design, and PRD issues when available; omit unavailable links. Add `Closes #<slice>` when the PR completes a slice.
   - User-facing changes and implementation: use GitHub PR file and line permalinks where useful.
   - Problem context: link the PRD stories instead of reproducing them; keep a concise explanation of the change's purpose for reviewers.
   - Deviations: compare against the PRD stories, the approved design, and the slice; otherwise state which context was not supplied. Flag unresolved consequential deviations for the owning human decision before presenting the work as complete.
   - Verification: use actual commands and results.
   - Changelog: one concise line.

   **Done:** the description accurately explains the reviewed diff and contains no placeholder text.

5. **Update GitHub directly**

   Update the single PR without writing a description file: `gh pr edit {number} --body "$DESCRIPTION"`. Confirm with `gh pr view {number} --json url,body`.

   **Done:** GitHub contains the completed description for that PR.

6. **Add UI evidence**

   When the PR changes the project's UI, invoke the `before-and-after` skill to capture representative screenshots and put them in the PR description.

   **Done:** every UI-changing PR shows its screenshots in the rendered PR description; non-UI-changing PRs skip this step.

7. **Report**

   Read [the final answer](references/describe_pr_final_answer.md) and respond with the PR URL, title, and concise verification summary. Do not report local artifacts or saved description paths.

## Requirements

- Read the template before composing the description.
- Create or update only the current branch's one PR.
- Keep the why as clear as the what.
- Put breaking changes and migration notes prominently in the PR body.
