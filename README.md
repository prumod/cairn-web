# Cairn Web

## Começar pela configuração

Depois de obter o código, execute o assistente na pasta do repositório. O assistente instala os pré-requisitos em falta, as dependências, Gitleaks e Chromium, e verifica o projeto. Os comandos são automáticos, sem perguntas `[y/N]`. O sistema pode pedir a palavra-passe de administrador ou autorização para instalar software.

Em Ubuntu ou Ubuntu em WSL:

```sh
bash scripts/setup-project.sh
```

Em Windows x64, num terminal PowerShell, sem WSL:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-project.ps1
```

A opção `Bypass` aplica-se apenas a este processo. Se uma política da organização impedir a execução, peça ajuda ao administrador. Se ainda não tiver o código, descarregue e extraia o [ZIP do repositório](https://github.com/prumod/cairn-web/archive/refs/heads/main.zip) ou siga [Get the code](#get-the-code). No terminal, entre na pasta extraída antes de executar o comando.

No Windows, o assistente instala Git for Windows se necessário. Se faltar o `winget`, indica como instalar o Instalador de Aplicações da Microsoft. Guarda Bun e, se necessário, Node.js em `%USERPROFILE%\.cairn`, acrescenta-os ao `PATH` do utilizador e define `GITLEAKS_BIN` para esta cópia do projeto. O Git for Windows inclui Git Bash, disponível para comandos Bash.

Em Ubuntu/WSL, o assistente instala Bun em `~/.bun` e, se necessário, Node.js em `~/.local/share/cairn`, com uma ligação em `~/.local/bin/node`. Não substitui um ficheiro que já exista nessa localização. Apresenta o comando para ativar estes caminhos no terminal.

Não precisa de criar um `.env` nem configurar Discord, WhatsApp ou serviços de publicação para executar o frontend. Pode repetir o assistente após corrigir um erro. O projeto ainda não tem testes automáticos. As verificações não comprovam o comportamento da aplicação.

This repository contains the Cairn frontend in `web/`, a Bun workspace using Vite, React, and the experimental Oxc-based React Compiler. Oxlint and Oxfmt run from the repository root across the whole project. The backend is separate and is not scaffolded here.

New developers: read this file first. If setup instructions change, update this README in the same pull request.

## Prerequisites

- Git
- [Bun](https://bun.sh/docs/installation) 1.3.14, the JavaScript runtime and package manager used by this project
- Node.js 22.12 or newer if running Vite with Node.js (including Vercel builds)
- A GitHub account; contributors who need to push changes must accept their repository invitation

Check that Git and Bun are installed:

```sh
git --version
bun --version
```

## Get the code

```sh
git clone https://github.com/prumod/cairn-web.git
cd cairn-web
```

If the organization or repository name changes, use the clone URL shown on the GitHub repository page.

## Set up and run

For a fresh checkout, use the [setup assistant](#começar-pela-configuração) first. It also runs the project checks. After it finishes, open a new terminal in the repository root and start the frontend with `bun run dev`. On Ubuntu/WSL, first run `export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"` in that terminal.

If the prerequisites are already installed, install the workspace dependencies manually:

```sh
bun run setup
```

`bun run update` also installs dependencies in an existing checkout. Commit `bun.lock` when dependencies change; use `bun install --frozen-lockfile` for reproducible installs.

Start the frontend:

```sh
bun run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Cairn is an unstyled prototype with fictional data and simulated actions. The backend, authentication and external integrations are not implemented.

## Project-local WhatsApp access (Pi)

On the configured Ubuntu workstation, Pi loads WhatsApp only from this repository's `.pi/mcp.json`. That file is machine-specific and locally Git-ignored; it is not required to run the frontend. There is no user-level WhatsApp MCP entry.

The local `whatsapp-bridge.service` must be running. From this repository root, run `pi mcp list` to check the connection, or use `/mcp` inside Pi. After changing configuration, use `/reload` in existing Pi sessions. Pi requires trust before loading project-local MCP configuration.

Only read/search tools and received-media download are exposed; send/mutation tools are hidden. The standing WhatsApp safety instruction is in this repository's `AGENTS.md`.

## Optional Discord MCP setup (Pi)

On a workstation with Pi and a Discord MCP server already configured to use `DISCORD_TOKEN`, run the interactive setup wizard from the repository root:

```sh
bash scripts/setup-discord-mcp.sh
```

The wizard guides you through bot access, asks before bot installation or token reset, and saves the token in the Git-ignored `.env` file with mode `0600`. It rejects a symlink or non-regular `.env` target, restricts existing-file permissions before writing, and uses a mode-`0600` temporary file plus atomic replacement so failed updates preserve existing contents. It does not install or configure an MCP server. After token entry, it runs `pi mcp list` and opens Pi for a manual server/channel check. Follow the wizard's instructions to use only server and channel listing tools, not message or mutation tools. Do not commit `.env` or share its contents.

The wizard requires Bash, Pi, and a Discord account permitted to manage the bot. For later Pi sessions, load the trusted local `.env` from the repository root:

```sh
set -a
source .env
set +a
pi
```

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

GitHub Issues are the source of truth for project work. The [Cairn Web project board](https://github.com/orgs/prumod/projects/1) tracks work through Backlog, Ready, In Progress, In Review, and Done. The customer can describe a problem or ask a question in an Issue; they do not need to create branches, use a terminal, or understand implementation details. The senior and mid-level developers follow up and turn the problem into development work. For the step-by-step development workflow, see [How to develop a feature](docs/how-to/desenvolver-uma-funcionalidade.md).

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
6. Changes to `main` require a PR, but no approving review is required. Force pushes and deletion of `main` are blocked; these protections also apply to administrators.
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
