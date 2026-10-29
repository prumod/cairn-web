# Cairn Web

> Descoberta de concursos públicos de obras para empresas de construção.

Monorepo Bun com React e TanStack Start, executado como Cloudflare Worker através de Alchemy. Usa Better Auth com Google para o acesso e Drizzle com Neon HTTP para a base de dados. Não existe backend Express.

A aplicação implementa o início de sessão com Google, a aprovação de contas por um administrador e o perfil da empresa. A descoberta de obras no Diário da República existe como protótipo; consulte o [contexto do produto](docs/product/README.md).

## Começar

1. Obtenha o código. Sem Git, descarregue o [ZIP do repositório](https://github.com/prumod/cairn-web/archive/refs/heads/main.zip).

   ```sh
   git clone https://github.com/prumod/cairn-web.git
   cd cairn-web
   ```

2. Execute o assistente de configuração na raiz do repositório.

   ```sh
   bash scripts/setup-project.sh   # Ubuntu ou Ubuntu em WSL
   ```

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-project.ps1   # Windows x64, sem WSL
   ```

   O assistente instala o que faltar (incluindo o Docker), prepara a base de dados local e o `packages/infra/.env.local`, e executa as verificações. Os detalhes estão em [Como configurar o projeto](docs/how-to/configurar-o-projeto.md).

3. Preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` em `packages/infra/.env.local`. O Google não permite criar o cliente OAuth por script; os passos estão em [Executar o perfil da empresa](docs/how-to/run-company-profile.md).

4. Num terminal novo, execute `bun run dev` e abra `http://localhost:3001`.

## Comandos

Todos os comandos estão no `package.json` da raiz. Os mais usados:

- `bun run dev` serve a aplicação num Worker Cloudflare local.
- `bun run update` e `bun run dev:db` instalam as dependências e aplicam as migrações novas, respetivamente, depois de atualizar o repositório.
- `bun run test` executa os testes rápidos e de browser.
- `bun run check` executa as verificações completas: formato, lint, tipos, auditoria e testes.

Consulte [Testes](TESTING.md) e [Verificações dos agentes](docs/agents/checks.md).

## Como contribuir

Os comandos normais `git commit` e `git push` executam verificações escolhidas pelo diff. O setup/update instala os hooks; num clone existente execute `bun run hooks:install`. Consulte [Verificações](docs/agents/checks.md).

O trabalho começa numa GitHub Issue. O [quadro do projeto Cairn Web](https://github.com/orgs/prumod/projects/1) acompanha as fases Backlog, Ready, In Progress, In Review e Done. Quem não programa pode descrever um problema ou fazer uma pergunta numa Issue.

- Use uma branch de curta duração a partir de `main`: `feat/123-descricao-curta`, `fix/123-descricao-curta` ou `chore/descricao-curta`.
- Abra um pull request e associe a Issue, por exemplo com `Closes #123`. Indique o que verificou e, se não conseguiu executar uma verificação, diga-o.
- As alterações à `main` exigem um pull request, mas não exigem uma aprovação. As proteções bloqueiam force pushes e a eliminação da `main`, também para administradores.- Depois da revisão, faça squash e elimine a branch remota. Os agentes só fazem o merge e eliminam branches quando o utilizador o pede explicitamente.

Os passos completos estão em [Trabalhar com agentes no T3](docs/how-to/trabalhar-com-agentes-no-t3.md) e [Desenvolver uma funcionalidade](docs/how-to/desenvolver-uma-funcionalidade.md). Se não souber por onde começar, pergunte a um programador sénior ou intermédio.

## Deployment

O Alchemy provisiona os estágios cloud `testing` (`cairn-testing.prumod.eu`) e `production` (`cairn.prumod.eu`), cada um com o seu projeto Neon e domínio personalizado. O estágio `dev` corre localmente.

> [!WARNING]
> `deploy:*` e `destroy:*` (em `packages/infra`) alteram recursos remotos, e os `destroy` eliminam a base de dados do estágio. Não os execute sem aprovação explícita para essa operação e estágio.

Os inputs, os comandos, o estado local do Alchemy, a recuperação de falhas e o estado verificado dos ambientes estão em [Executar o perfil da empresa](docs/how-to/run-company-profile.md#cloud-stages).

## Estrutura e documentação

`apps/web` contém a aplicação TanStack Start. `packages/infra`, `packages/db` e `packages/auth` contêm o Alchemy, o Drizzle com as migrações e o Better Auth. `features` contém os cenários de aceitação. Consulte [Arquitetura](ARCHITECTURE.md) e [Estrutura do projeto](docs/reference/project-structure.md).

O [índice da documentação](docs/README.md) lista os guias, a referência e as orientações para agentes, incluindo as [integrações opcionais com Pi](docs/how-to/configurar-integracoes-pi.md).
