# Como corrigir um bug

Este guia mostra como corrigir um comportamento errado. Primeiro, um teste reproduz o bug. Depois, a correção faz esse teste passar, e o teste fica como proteção contra regressões.

## Antes de começar

Confirme que a Issue indica:

- os passos para reproduzir o bug;
- o resultado esperado;
- o resultado observado.

Se faltar alguma destas informações, peça-a na Issue.

## Com agentes no T3

1. Abra uma thread no `cairn-web` conforme [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md) e indique a Issue.
2. `/reproducing-bugs`: peça ao agente um teste que falhe por causa do bug. Confirme que o teste falha pela razão certa.
3. `/diagnosing-bugs`: peça ao agente a causa. Se o bug for simples, pode saltar este passo.
4. `/tdd`: peça a correção até o teste passar, sem alterar outros comportamentos.
5. Termine com o passo 5 de [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md#5-termine-com-uma-pull-request).

## Manualmente

1. Siga os passos 1 a 4 de [Como desenvolver uma funcionalidade](desenvolver-uma-funcionalidade.md). Use uma branch `fix/123-descricao-curta`.
2. Reproduza o bug com `bun run dev`.
3. Escreva um teste que falhe:
   - lógica isolada: teste unitário junto ao código;
   - comportamento do servidor ou da base de dados descrito num `.feature`: ligação `*.feature.test.ts` (`vitest-cucumber-context-mapper`) em `apps/web/tests/acceptance/integration/`;
   - verificação técnica do servidor ou da base de dados: teste em `apps/web/tests/typical/integration/`;
   - fluxo no browser: cenário em `features/`.
4. Corrija o código até o teste passar.
5. Siga os passos 6 a 10 do mesmo guia.

O resultado é uma Pull Request com o teste que reproduz o bug e a correção.
