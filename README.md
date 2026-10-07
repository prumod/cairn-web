# Cairn Web

This repository contains the Cairn frontend in `web/`, a Bun workspace using Vite, React, and the experimental Oxc-based React Compiler. Oxlint and Oxfmt run from the repository root across the whole project. The backend is separate and is not scaffolded here.

New developers: read this file first. If setup instructions change, update this README in the same pull request.

## Prerequisites

- Git
- [Bun](https://bun.sh/docs/installation) 1.3.14, the JavaScript runtime and package manager used by this project
- Node.js 22.12 or newer if running Vite with Node.js (including Vercel builds)
- Access to the private GitHub repository

Check that Git and Bun are installed:

```sh
git --version
bun --version
```

## Get the code

```sh
git clone https://github.com/prumoh/cairn-web.git
cd cairn-web
```

If the organization or repository name changes, use the clone URL shown on the GitHub repository page.

## Set up and run

From the repository root, install the workspace dependencies:

```sh
bun run setup
```

`bun run update` also installs dependencies in an existing checkout. Commit `bun.lock` when dependencies change; use `bun install --frozen-lockfile` for reproducible installs.

Start the frontend:

```sh
bun run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The generated counter is a scaffold, not the private application: authentication and backend integration are not implemented.

## Scaffold choices

The foundation was generated with `create-better-agent-stack@2.0.0`, selecting features instead of a preset:

```sh
bunx create-better-agent-stack@2.0.0 --name cairn-web-features \
  --features oxlint,oxfmt,vite-react,react-compiler-oxc \
  --package-manager bun --no-interactive
```

This is a reference command for an empty temporary directory, not a setup command for this repository. The generated frontend was moved into `web/`, and formatting/linting dependencies and commands were kept at the root. `.agent-stack/manifest.json` records the generator selection. No preset, ESLint, Ultracite, Anti-slop, test framework, or CI workflow was selected. The Oxc compiler is enabled with `react({ compiler: true })` in `web/vite.config.ts`; it is experimental.

## Deployment target

The frontend is intended for Vercel, with `main` as the production branch and automatic Git deployments. Use the repository root as the Vercel Root Directory, `bun install --frozen-lockfile` as the Install Command, `bun run build` as the Build Command, and `web/dist` as the Output Directory. Use the Vite framework preset. Vercel project linking and deployments have not been configured yet.

The separate backend is intended for Railway. Private data must require backend authentication; the frontend scaffold does not provide access control.

## Project commands

| Command                | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `bun run setup`        | Prepare a fresh checkout by installing dependencies.             |
| `bun run update`       | Install dependencies after updating an existing checkout.        |
| `bun run dev`          | Start the frontend development server.                           |
| `bun run build`        | Build the frontend into `web/dist`.                              |
| `bun run preview`      | Serve the built frontend locally.                                |
| `bun run format`       | Format supported files across the repository with Oxfmt.         |
| `bun run format:check` | Check repository formatting without writing files.               |
| `bun run lint`         | Lint source and configuration across the repository with Oxlint. |
| `bun run typecheck`    | Typecheck the frontend and its Vite configuration.               |
| `bun run check`        | Run formatting, linting, typechecking, and the frontend build.   |

There are no tests or automated CI gates yet. Do not treat a missing test suite as a passing test suite.

## Work through GitHub

GitHub Issues are the source of truth for project work. The [Cairn Web project board](https://github.com/orgs/prumoh/projects/1) tracks work through Backlog, Ready, In Progress, In Review, and Done. The customer can describe a problem or ask a question in an Issue; they do not need to create branches, use a terminal, or understand implementation details. The senior and mid-level developers follow up and turn the problem into development work.

For a change:

1. Find or create the GitHub Issue describing the work. Ask the senior or mid-level developer if you are unsure whether an issue already exists.
2. Update your local `main` branch:

   ```sh
   git switch main
   git pull --ff-only origin main
   ```

3. Create a short-lived branch. Use the Issue number when there is one:

   ```sh
   git switch -c feat/123-short-description
   # or: fix/123-short-description
   # or: chore/short-description
   ```

4. Make a focused change and commit it. Push your branch:

   ```sh
   git add <files-you-changed>
   git commit -m "Describe the change"
   git push -u origin HEAD
   ```

5. Open a Pull Request on GitHub, link the Issue (for example, `Closes #123`), and explain what changed and how you checked it. Keep PRs small.
6. Review is optional. Changes to `main` still go through a PR, but an approval from another contributor is not required. Authors may merge their own PR after checking the diff and running the relevant checks.
7. Address any review feedback, then squash-merge and delete the merged remote branch. Agents perform the merge and branch deletion only when explicitly requested by the user.

## Before opening a PR

Run `bun run check`, review your changes, and run relevant manual checks. In particular:

```sh
git diff --check
git status --short
git diff
```

State in the PR what you verified. If a check cannot be run, say so rather than claiming it passed.

## Questions and help

Ask in the related GitHub Issue or PR. If you cannot access the repository or something in these instructions does not work, contact the senior or mid-level developer.
