# Como refatorar código

Este guia mostra como melhorar a estrutura do código sem mudar o comportamento. Os testes existentes devem passar antes, durante e depois da alteração.

## Antes de começar

- Tenha uma Issue com o objetivo do refactor, por exemplo "separar a persistência do perfil da empresa".
- Leia [Estrutura do projeto](../reference/project-structure.md) e as [normas de código](../../CODING_STANDARDS.md). As fronteiras entre módulos são verificadas por `bun run lint:boundaries`.
- Execute `bun run check` na `main` e confirme que passa.

## Com agentes no T3

1. Abra uma thread no `cairn-web` conforme [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md) e indique a Issue.
2. Escolha como encontrar a melhoria:
   - `/improve-codebase-architecture`: analisa o código e apresenta oportunidades num relatório. Escolha uma.
   - `/codebase-design`: discute a interface e as responsabilidades de um módulo que já escolheu.
3. Peça ao agente para fazer a alteração em passos pequenos e para executar os testes depois de cada passo.
4. Se o refactor tocar o servidor, faça a **Revisão de arquitetura do backend** de [Processos e skills](../reference/processos-e-skills.md#revisão-de-arquitetura-do-backend).
5. Termine com o passo 5 de [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md#5-termine-com-uma-pull-request).

## Manualmente

1. Siga os passos 1 a 4 de [Como desenvolver uma funcionalidade](desenvolver-uma-funcionalidade.md). Use uma branch `chore/descricao-curta`.
2. Se a parte a alterar não tiver testes, acrescente-os antes de mudar o código.
3. Faça a alteração em passos pequenos. Depois de cada passo, execute `bun run test:fast`.
4. Não altere cenários em `features/`. Se um cenário tiver de mudar, a alteração muda o comportamento e não é um refactor.
5. Siga os passos 7 a 10 do mesmo guia.

O resultado é uma Pull Request sem alterações de comportamento, com todas as verificações a passar.
