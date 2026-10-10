# Cairn Web

Este repositório contém a aplicação web Cairn: frontend React, backend Express, autenticação Google e perfil de empresa partilhado com controlo de acesso. A configuração de OAuth e a publicação ainda não estão concluídas.

Leia este ficheiro antes de começar. Se as instruções de configuração mudarem, atualize este README no mesmo pull request.

## Antes de começar

Precisa de Git para clonar o repositório. Confirme a instalação com `git --version`. Se ainda não tiver Git, pode descarregar o ZIP na secção seguinte. Os programadores que precisem de enviar alterações também precisam de uma conta GitHub e de aceitar o convite para o repositório.

O projeto usa [Bun](https://bun.sh/docs/installation) 1.3.14. O assistente instala esta versão. Se executar o Vite com Node.js, precisa de Node.js 22.12 ou superior. Para configurar tudo manualmente, consulte [Configurar o projeto](#configurar-o-projeto).

## Obter o código

Com Git instalado, abra um terminal e execute:

```sh
git clone https://github.com/prumod/cairn-web.git
cd cairn-web
```

Se não tiver Git, descarregue o [ZIP do repositório](https://github.com/prumod/cairn-web/archive/refs/heads/main.zip), extraia-o e abra um terminal na pasta extraída.

Se o nome da organização ou do repositório mudar, use o endereço de clonagem apresentado na página do repositório no GitHub.

## Configurar o projeto

Use o assistente do seu sistema operativo. O assistente instala os pré-requisitos em falta, as dependências, o Gitleaks e o Chromium, e executa as verificações do projeto. Os comandos são automáticos e não apresentam perguntas `[y/N]`. O sistema pode pedir a palavra-passe de administrador ou autorização para instalar software.

Em Ubuntu ou Ubuntu em WSL, execute na pasta do repositório:

```sh
bash scripts/setup-project.sh
```

Em Windows x64, sem WSL, abra o PowerShell na pasta do repositório e execute:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-project.ps1
```

A opção `Bypass` aplica-se apenas a este processo. Se uma política da organização impedir a execução, peça ajuda ao administrador.

No Windows, o assistente instala Git for Windows se necessário. Se o `winget` não estiver disponível, indica como instalar o Instalador de Aplicações da Microsoft. Guarda Bun e, se necessário, Node.js em `%USERPROFILE%\.cairn`, acrescenta-os ao `PATH` do utilizador e define `GITLEAKS_BIN` para a cópia do projeto. Execute os scripts de validação e os scripts de commit e push através do Git Bash.

Em Ubuntu ou WSL, o assistente instala Bun em `~/.bun` e, se necessário, Node.js em `~/.local/share/cairn`, com uma ligação em `~/.local/bin/node`. Não substitui um ficheiro que já exista nessa localização. No fim, apresenta o comando para adicionar estes caminhos ao `PATH` do terminal.

Se o assistente falhar, corrija o erro apresentado e volte a executá-lo. Se já tiver as ferramentas do sistema instaladas, configure as dependências, o Gitleaks e o Chromium com:

```sh
bun run setup
```

`bun run setup` instala as dependências a partir do ficheiro de lock. Confirme que o terminal reconhece Bun 1.3.14 com `bun --version`. Depois de atualizar o repositório, `bun run update` instala as dependências desse ficheiro. Altere `bun.lock` apenas quando mudar intencionalmente as dependências.

Para executar apenas a interface em desenvolvimento não precisa de configurar autenticação. Para executar a aplicação completa com backend e PostgreSQL, consulte [Executar o perfil da empresa](docs/how-to/run-company-profile.md). Não configure credenciais reais em ficheiros versionados.

## Como executar o projeto

Depois de configurar o projeto, abra um novo terminal na raiz do repositório.

Em Ubuntu ou WSL, adicione Bun e Node.js ao `PATH` desse terminal:

```sh
export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"
```

No Windows, abra um novo terminal PowerShell na raiz do repositório para carregar o `PATH` atualizado pelo assistente.

Para trabalhar apenas na interface, inicie o Vite com `bun run dev` e abra `http://localhost:5173`. As chamadas `/api` são encaminhadas para `http://127.0.0.1:3000`; sem backend e configuração válida, a aplicação completa não funciona. Para executar a aplicação integrada, consulte [Executar o perfil da empresa](docs/how-to/run-company-profile.md).

## Como contribuir

As GitHub Issues são a referência para o trabalho do projeto. O [quadro do projeto Cairn Web](https://github.com/orgs/prumod/projects/1) acompanha o trabalho nas fases Backlog, Ready, In Progress, In Review e Done. O utilizador pode descrever um problema ou fazer uma pergunta numa Issue. Não precisa de criar branches, usar um terminal ou conhecer detalhes de implementação. Os programadores sénior e intermédios ajudam a esclarecer o pedido e a transformá-lo em trabalho de desenvolvimento.

Para ver o processo detalhado de desenvolvimento, consulte [Como desenvolver uma funcionalidade](docs/how-to/desenvolver-uma-funcionalidade.md).

Para cada alteração:

1. Encontre ou crie uma GitHub Issue que descreva o trabalho. Se não souber se já existe uma Issue, pergunte a um programador sénior ou intermédio.
2. Atualize a branch `main` local:

   ```sh
   git switch main
   git pull --ff-only origin main
   ```

3. Crie uma branch de curta duração. Use o número da Issue, quando existir:

   ```sh
   git switch -c feat/123-descricao-curta
   # ou: fix/123-descricao-curta
   # ou: chore/descricao-curta
   ```

4. Faça uma alteração focada e crie um commit. Envie a branch:

   ```sh
   git add <ficheiros-alterados>
   git commit -m "Descreva a alteração"
   git push -u origin HEAD
   ```

5. Abra um pull request no GitHub, associe a Issue, por exemplo com `Closes #123`, e explique o que mudou e como verificou a alteração. Mantenha os pull requests pequenos.
6. As alterações à `main` exigem um pull request, mas não exigem uma aprovação. As proteções também bloqueiam force pushes e a eliminação da branch `main` para administradores.
7. Responda aos comentários de revisão. Depois, faça squash e elimine a branch remota. Os agentes só fazem o merge e eliminam branches quando o utilizador o pede explicitamente.

### Verificações antes de abrir um pull request

Execute `bun run check`, reveja as alterações e faça as verificações manuais relevantes. Em particular:

```sh
git diff --check
git status --short
git diff
```

Indique no pull request o que verificou. Se não conseguir executar uma verificação, diga-o em vez de afirmar que passou.

Se não conseguir aceder ao repositório ou se alguma instrução não funcionar, peça ajuda a um programador sénior ou intermédio. Coloque questões sobre o trabalho numa GitHub Issue ou no pull request relacionado.

## Comandos do projeto

Os scripts executáveis estão em `scripts/`. Cada script encontra a raiz do repositório a partir da sua localização. `scripts/setup.sh` prepara ferramentas e dependências. `scripts/update.sh` instala dependências depois de atualizar o repositório. `scripts/run.sh` inicia a aplicação. `scripts/test.sh` executa os conjuntos de testes contra uma compilação nova. `scripts/check.sh` faz a validação completa, incluindo a auditoria de dependências. Os assistentes `setup-project` também instalam ferramentas do sistema operativo.

| Comando                   | Utilização                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `bun run setup`           | Instala as dependências bloqueadas, o Gitleaks e o Chromium.                                                             |
| `bun run update`          | Instala as dependências depois de atualizar uma cópia existente.                                                         |
| `bun run dev`             | Inicia o Vite; encaminha `/api` para o backend local na porta 3000.                                                      |
| `bun run dev:backend`     | Inicia o backend Express em modo de desenvolvimento (requer ambiente e PostgreSQL).                                      |
| `bun run build`           | Compila o frontend para `web/dist` e o backend para `backend/dist`.                                                      |
| `bun run start`           | Inicia o backend compilado, servindo API e frontend na mesma origem.                                                     |
| `bun run db:migrate`      | Aplica as migrações SQL committed ao banco configurado.                                                                  |
| `bun run preview`         | Serve apenas os assets Vite; não substitui o backend integrado.                                                          |
| `bun run format`          | Formata os ficheiros suportados em todo o repositório com Oxfmt.                                                         |
| `bun run format:check`    | Verifica a formatação sem alterar ficheiros.                                                                             |
| `bun run lint`            | Analisa o código-fonte e a configuração do repositório com Oxlint.                                                       |
| `bun run lint:boundaries` | Verifica as fronteiras de módulos e dependências.                                                                        |
| `bun run test:boundaries` | Prova que as regras de fronteira aceitam e rejeitam exemplos esperados.                                                  |
| `bun run typecheck`       | Verifica os tipos do frontend, das configurações de teste e das ligações dos testes.                                     |
| `bun run audit`           | Audita as dependências bloqueadas, incluindo as ferramentas de desenvolvimento.                                          |
| `bun run test`            | Executa os testes rápidos, compila a aplicação e executa os cenários no navegador.                                       |
| `bun run check`           | Executa a formatação, a análise estática, a verificação de tipos, a auditoria de dependências, os testes e a compilação. |

Consulte [Estrutura do projeto](docs/reference/project-structure.md) para as regras de módulos e testes. O conjunto atual inclui testes de configuração, integração HTTP/PostgreSQL e cenários Playwright-BDD. `bun run test:fast` requer PostgreSQL local instalado ou `TEST_DATABASE_URL` para um servidor de teste dedicado com permissão `CREATEDB`. A CI de pull requests usa PostgreSQL 18.6 efémero. `Agent checks` é obrigatório na proteção de `main`; a proteção exige também zero aprovações de revisão.

Para saber como funcionam as verificações de commit e push, a instalação do Gitleaks e do navegador, e a recuperação de falhas, consulte [Verificações dos agentes](docs/agents/checks.md).

## Publicação

A aplicação é executável localmente, mas o Render e Neon ainda não estão configurados nem verificados. O objetivo aprovado continua a ser Render Free (React e Express sob uma origem) e Neon Free (PostgreSQL), sem despesa. Não há `render.yaml` nem pipeline de publicação. Consulte [Arquitetura](ARCHITECTURE.md) e [Executar o perfil da empresa](docs/how-to/run-company-profile.md) para limites entre estado implementado e deployment.

## Integrações opcionais com Pi

Estas integrações são opcionais. Não são necessárias para instalar ou executar o frontend.

### Acesso local ao WhatsApp

Na estação Ubuntu configurada, Pi carrega o WhatsApp apenas a partir de `.pi/mcp.json` deste repositório. O ficheiro é local, específico da máquina e ignorado pelo Git. Não é necessário para executar o frontend. Não existe uma entrada WhatsApp ao nível do utilizador.

O serviço local `whatsapp-bridge.service` tem de estar em execução. A partir da raiz do repositório, execute `pi mcp list` para verificar a ligação ou use `/mcp` no Pi. Depois de alterar a configuração, use `/reload` nas sessões Pi abertas. Pi exige que confie na configuração MCP local do projeto antes de a carregar.

A configuração expõe apenas ferramentas de leitura, pesquisa e transferência de ficheiros multimédia recebidos. Esconde ferramentas de envio e alteração. A instrução de segurança para WhatsApp está em `AGENTS.md`.

### Configurar o Discord MCP

Numa estação de trabalho com Pi e um servidor Discord MCP já configurado para usar `DISCORD_TOKEN`, execute o assistente interativo na raiz do repositório:

```sh
bash scripts/setup-discord-mcp.sh
```

O assistente explica como configurar o acesso do bot, pede autorização antes de instalar o bot ou repor o token e guarda o token no ficheiro `.env`, ignorado pelo Git, com permissões `0600`. Rejeita ficheiros `.env` que sejam ligações simbólicas ou ficheiros especiais. Antes de escrever, restringe as permissões de um ficheiro existente. Usa um ficheiro temporário com permissões `0600` e substituição atómica. Se uma atualização falhar, preserva o conteúdo anterior. Não instala nem configura um servidor MCP.

Depois de introduzir o token, o assistente executa `pi mcp list` e abre o Pi para verificar manualmente o servidor e o canal. Siga as instruções do assistente e use apenas ferramentas para listar servidores e canais. Não use ferramentas para ler mensagens ou fazer alterações. Não submeta o ficheiro `.env` nem partilhe o seu conteúdo.

O assistente requer Bash, Pi e uma conta Discord com autorização para gerir o bot. Para carregar o ficheiro `.env` local em sessões Pi posteriores, execute a partir da raiz do repositório:

```sh
set -a
source .env
set +a
pi
```

## Origem e arquitetura

O frontend React/Vite está em `web/`; o backend Node/Express está em `backend/` e serve o frontend compilado e a API na mesma origem. A autenticação Better Auth/Google, PostgreSQL via Drizzle e migrações SQL estão implementados. Oxlint e Oxfmt são executados a partir da raiz. Consulte [Arquitetura](ARCHITECTURE.md) para comportamento atual e limites.

A base foi gerada com `create-better-agent-stack@2.0.0`, através da seleção de funcionalidades em vez de um preset:

```sh
bunx create-better-agent-stack@2.0.0 --name cairn-web-features \
  --features oxlint,oxfmt,vite-react,react-compiler-oxc \
  --package-manager bun --no-interactive
```

Este comando serve de referência para uma pasta temporária vazia. Não o use para configurar este repositório. O frontend gerado foi movido para `web/`. As dependências e os comandos de formatação e análise estática foram mantidos na raiz. `.agent-stack/manifest.json` regista as funcionalidades selecionadas. Não foram selecionados um preset, ESLint, Ultracite, Anti-slop, um framework de testes ou um workflow de CI. O compilador Oxc está ativado com `react({ compiler: true })` em `web/vite.config.ts`. É experimental.
