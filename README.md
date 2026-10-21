# Cairn Web

Este repositório contém um monorepo Bun para a aplicação Cairn: React e TanStack Start, executados como Cloudflare Worker através de Alchemy, Better Auth/Google e Drizzle com Neon HTTP. Não existe um backend Express separado. A configuração Render e as provas de deployment/OAuth anteriores pertencem ao runtime antigo; não validam esta aplicação Workers. Não foi verificado nenhum deployment externo, fluxo OAuth Google, estado remoto ou ambiente de produção.

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

Para executar a aplicação localmente (estágio `dev`), configure uma base compatível com Neon HTTP e as variáveis de autenticação conforme [Executar o perfil da empresa](docs/how-to/run-company-profile.md). Os testes precisam de Docker Compose; não configure credenciais reais em ficheiros versionados.

## Como executar o projeto

Depois de configurar o projeto, abra um novo terminal na raiz do repositório.

Em Ubuntu ou WSL, adicione Bun e Node.js ao `PATH` desse terminal:

```sh
export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"
```

No Windows, abra um novo terminal PowerShell na raiz do repositório para carregar o `PATH` atualizado pelo assistente.

Inicie o runtime local Cloudflare Workers com `bun run dev` e abra `http://localhost:3001`. O comando usa a stack de desenvolvimento Alchemy e serve a aplicação full-stack no mesmo Worker; não inicia um servidor Node/Nitro nem um backend Express. Para configurar a base e a autenticação, consulte [Executar o perfil da empresa](docs/how-to/run-company-profile.md).

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

Os comandos principais estão definidos no `package.json` da raiz. `bun run setup` instala dependências bloqueadas, Gitleaks e Chromium. `bun run typecheck` regenera os tipos de ambiente antes de verificar os pacotes do workspace. Consulte [Estrutura do projeto](docs/reference/project-structure.md) para os limites entre módulos.

| Comando                                               | Utilização                                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `bun run setup`                                       | Instala as dependências bloqueadas, o Gitleaks e o Chromium.                                              |
| `bun run update`                                      | Instala as dependências bloqueadas depois de atualizar o repositório.                                     |
| `bun run dev`                                         | Inicia a stack Alchemy local para o Worker Cloudflare de desenvolvimento.                                 |
| `bun run build`                                       | Compila a aplicação TanStack Start para `apps/web/dist`.                                                  |
| `bun run db:migrate`                                  | Aplica as migrações Drizzle à base indicada por `DATABASE_URL`.                                           |
| `bun run db:generate`                                 | Gera migrações a partir do schema Drizzle.                                                                |
| `bun run env:generate`                                | Gera os tipos TypeScript a partir dos schemas de ambiente versionados.                                    |
| `bun run format` / `bun run format:check`             | Formata ou verifica os ficheiros com Oxfmt.                                                               |
| `bun run lint`                                        | Analisa o código com Oxlint.                                                                              |
| `bun run lint:boundaries` / `bun run test:boundaries` | Verifica e prova os limites de dependências.                                                              |
| `bun run check:blueprints`                            | Verifica localmente a política dos ficheiros Render antigos; não contacta o provider nem valida o Worker. |
| `bun run typecheck`                                   | Verifica os tipos da aplicação, do wireframe de referência, dos pacotes do workspace e dos testes.        |
| `bun run audit`                                       | Audita as dependências bloqueadas, incluindo ferramentas de desenvolvimento.                              |
| `bun run test:fast`                                   | Compila e executa Vitest com PostgreSQL e proxy Neon HTTP descartáveis via Docker Compose.                |
| `bun run test:browser`                                | Compila e executa os cenários Chromium contra o Worker compilado e uma identidade de teste isolada.       |
| `bun run test`                                        | Executa os testes rápidos e de browser.                                                                   |
| `bun run check`                                       | Executa as verificações completas, incluindo tipos, auditoria e testes.                                   |

Os testes precisam de Docker Compose e Chromium. O wrapper cria um projeto Compose isolado com imagens fixadas de PostgreSQL 18.6 e do proxy Neon HTTP; não é necessário configurar manualmente um servidor PostgreSQL. O workflow CI usa o mesmo wrapper, sem um serviço PostgreSQL separado. Para os detalhes e limites da verificação atual, consulte [Testes](TESTING.md). Para as verificações Git locais, consulte [Verificações dos agentes](docs/agents/checks.md).

## Estado de deployment

A configuração atual define a stack Alchemy para Cloudflare Workers em `packages/infra/alchemy.run.ts` e `packages/infra/src/deployment.ts`. O estágio local suportado é `dev`: usa o runtime local, não configura domínio personalizado, deixa `workersDev` por definir, define `APP_ENV=development`, usa `GIT_SHA=local` e lê `DATABASE_URL` e `BETTER_AUTH_SECRET` do ambiente (varlock). Os únicos estágios de deployment aceites são `testing` (`cairn-testing.prumod.eu`) e `production` (`cairn.prumod.eu`); ambos usam `APP_ENV=production`, exigem `GIT_SHA` com 40 caracteres hexadecimais minúsculos e definem `workersDev: false`. Assim, a configuração de ambos usa apenas o domínio personalizado correspondente e desativa os URLs estáveis `workers.dev` e os URLs de pré-visualização por versão.

Os estágios cloud são totalmente provisionados pelo Alchemy. Cada estágio cria um `Neon.Project` chamado `database` na região `aws-eu-central-1` (Frankfurt) e aplica as migrações de `packages/db/migrations` em cada deploy; no primeiro deploy, o Alchemy assume o histórico do drizzle-kit. O Worker recebe o URI de ligação com pooling do projeto como segredo `DATABASE_URL`, e um `BETTER_AUTH_SECRET` gerado e guardado no estado do Alchemy. Ninguém cria a base de dados nem copia o `DATABASE_URL` à mão.

Um deployment cloud precisa destes inputs humanos: `NEON_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BOOTSTRAP_ADMIN_EMAIL`, `GIT_SHA` e autorização Cloudflare para o Alchemy. Guarde os segredos em `packages/infra/.env.local` (ignorado pelo Git; o varlock carrega-o sobre `.env.schema`) ou no ambiente do processo. Nunca os submeta. Os passos que não podem ser IaC continuam manuais:

- Criar o cliente OAuth Web do Google por ambiente na Google Cloud Console, com o URI de redirecionamento `https://<domínio>/api/auth/callback/google`. Não se conhece nenhuma API para criar um cliente Web padrão; não confirmado.
- Alterar os nameservers e o registo DS do DNSSEC no registrar (Spaceship).

Os comandos explicitamente nomeados são `deploy:testing`, `deploy:production`, `destroy:testing` e `destroy:production` no package `packages/infra`; os comandos implícitos `deploy`/`destroy` não existem. Não execute deployment ou destroy sem aprovação separada, inputs isolados e validação operacional. `render.yaml`, `deploy/render.production.template.yaml` e os workflows/gates de Render continuam artefactos do runtime anterior e não validam nem fazem deployment do Worker atual.

O estado do Alchemy é local (`Alchemy.localState()`, pasta `.alchemy`). O estado remoto não está ativado: só a máquina que tem `.alchemy` consegue atualizar ou destruir a stack, e perder esse estado impede a recuperação pelo Alchemy.

Verificado: a verificação de tipos e os testes unitários passam. Não verificado: nada foi implementado nem planeado contra o Neon ou o Cloudflare. O provisionamento Neon, a adoção das migrações, o DNS, o certificado, o OAuth Google e o deployment live não têm prova.

## Integrações opcionais com Pi

Estas integrações são opcionais. Não são necessárias para instalar ou executar a aplicação.

### Acesso local ao WhatsApp

Na estação Ubuntu configurada, Pi carrega o WhatsApp apenas a partir de `.pi/mcp.json` deste repositório. O ficheiro é local, específico da máquina e ignorado pelo Git. Não é necessário para executar a aplicação. Não existe uma entrada WhatsApp ao nível do utilizador.

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

O workspace foi gerado com Better T Stack e depois adaptado para Cairn. `apps/web` contém a aplicação TanStack Start e o código de interface; `packages/infra` define a stack Alchemy/Cloudflare; `packages/db` contém Drizzle, o cliente Neon HTTP e migrações; `packages/auth` configura Better Auth com Google. Não existe um package `packages/ui` separado, backend Express ou runtime Node de produção. Consulte [Arquitetura](ARCHITECTURE.md) e [Estrutura do projeto](docs/reference/project-structure.md) para os limites atuais.
