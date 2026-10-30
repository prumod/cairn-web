# Como configurar o projeto

Use este guia para configurar o Cairn Web numa máquina nova. O [README](../../README.md) tem os comandos mínimos. Este guia tem os detalhes, os requisitos e a resolução de problemas.

## Assistente de configuração

O assistente do seu sistema operativo faz toda a configuração:

1. Instala os pré-requisitos em falta, incluindo o Docker, as dependências, o Gitleaks e o Chromium.
2. Inicia a base de dados local em Docker (`compose.dev.yaml`) e aplica as migrações.
3. Cria `packages/infra/.env.local` (ignorado pelo Git) com a ligação à base de dados, um segredo de autenticação gerado e o seu email do Git como administrador.
4. Executa as verificações do projeto.

O assistente não faz perguntas `[y/N]`, mas o sistema pode pedir a palavra-passe de administrador. Pode interrompê-lo e executá-lo outra vez.

### Ubuntu ou Ubuntu em WSL

Na raiz do repositório:

```sh
bash scripts/setup-project.sh
```

- Instala o Docker com `apt` (`docker.io` e `docker-compose-v2`) e acrescenta o utilizador ao grupo `docker`, que equivale a acesso de administrador no computador. Para o grupo valer em todos os terminais, termine a sessão e volte a entrar.
- Instala Bun em `~/.bun` e, se necessário, Node.js em `~/.local/share/cairn`, com uma ligação em `~/.local/bin/node`. Não substitui um ficheiro existente.
- Acrescenta estes caminhos ao `PATH` em `~/.bashrc` e `~/.zshrc`. Abra um terminal novo para os carregar.

### Windows x64, sem WSL

No PowerShell, na raiz do repositório:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-project.ps1
```

> [!NOTE]
> A opção `Bypass` aplica-se apenas a este processo. Se uma política da organização impedir a execução, peça ajuda ao administrador.

- Instala Git for Windows e Docker Desktop com `winget`. Sem `winget`, o assistente indica como instalar o Instalador de Aplicações da Microsoft.
- O Docker Desktop pode pedir autorização, que aceite os termos de serviço da Docker e que reinicie o computador. Depois de reiniciar, execute o assistente outra vez.
- Guarda Bun e Node.js em `%USERPROFILE%\.cairn`, acrescenta-os ao `PATH` do utilizador e define `GITLEAKS_BIN`.
- Execute os scripts de validação, commit e push através do Git Bash.

## Depois do assistente

> [!IMPORTANT]
> O Google não permite criar o cliente OAuth por script. Preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` em `packages/infra/.env.local` com um cliente Web para `http://localhost:3001`, e confirme `BOOTSTRAP_ADMIN_EMAIL`, o email da conta Google administradora. Sem estes valores, `bun run dev` indica quais faltam. Os passos estão em [Executar o perfil da empresa](run-company-profile.md). Não coloque credenciais reais em ficheiros versionados.

Num terminal novo, execute `bun run dev` e abra `http://localhost:3001`.

Depois de atualizar o repositório, execute `bun run update` para instalar as dependências e `bun run dev:db` para iniciar a base de dados local e aplicar as migrações novas. Altere `bun.lock` apenas quando mudar intencionalmente as dependências.

## Configurar à mão

Precisa de:

- Git, para clonar o repositório. Confirme com `git --version`.
- [Bun](https://bun.sh/docs/installation) 1.3.14. Confirme com `bun --version`. Se executar o Vite com Node.js, precisa de Node.js 24.11 ou superior.
- Docker com Compose v2, para a base de dados local e para os testes.
- Chromium, para os testes de browser.
- Para enviar alterações: uma conta GitHub com o convite para o repositório aceite.

Instale as dependências, o Gitleaks e o Chromium com `bun run setup`. Depois siga [Executar o perfil da empresa](run-company-profile.md) para configurar a base de dados e as variáveis.

## Se o assistente falhar

Corrija o erro apresentado e execute o assistente outra vez. Se não conseguir aceder ao repositório ou se uma instrução não funcionar, peça ajuda a um programador sénior ou intermédio.
