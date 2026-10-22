# Como modificar uma funcionalidade existente

Este guia mostra como alterar o comportamento de uma funcionalidade que já existe. Parte de uma Issue clara e termina numa Pull Request. Se ainda não sabe que comportamento quer, comece pelo processo **RPI** em [Processos e skills](../reference/processos-e-skills.md).

O comportamento atual está descrito nos cenários Gherkin em `features/`, por exemplo `features/company/maintain-company-profile.feature`. Uma modificação altera primeiro o cenário e depois o código.

## Com agentes no T3

1. Abra uma thread no `cairn-web` conforme [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md) e indique a Issue.
2. `/atdd`: peça ao agente para alterar o cenário existente. Aprove o novo texto antes de continuar.
3. `/hvtdd`: peça ao agente para implementar a alteração com testes primeiro.
4. Abra a aplicação conforme o passo 6 de [Como desenvolver uma funcionalidade](desenvolver-uma-funcionalidade.md) e confirme o novo comportamento.
5. Termine com o passo 5 de [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md#5-termine-com-uma-pull-request).

Skills úteis: `/grill-with-docs` se a Issue tiver dúvidas, `/domain-modeling` se a alteração mudar termos do [GLOSSARY](../../GLOSSARY.md).

## Manualmente

1. Siga os passos 1 a 4 de [Como desenvolver uma funcionalidade](desenvolver-uma-funcionalidade.md).
2. Encontre o cenário afetado em `features/` e os bindings em `apps/web/tests/acceptance/e2e/`.
3. Altere o cenário para o novo comportamento. Execute `bun run test:browser` e confirme que o cenário falha.
4. Altere o código até o cenário passar. Atualize os testes unitários e de integração afetados.
5. Siga os passos 6 a 10 do mesmo guia.

O resultado é uma Pull Request com o cenário atualizado, o código alterado e os testes a passar.
