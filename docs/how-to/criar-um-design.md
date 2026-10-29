# Como criar um design

Este guia mostra como criar ou renovar o design de um ecrã, desde a direção visual até ao código. Para o contexto do produto e os estados do protótipo, leia [Contexto do produto](../product/README.md).

## Com agentes no T3

1. Abra uma thread no `cairn-web` conforme [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md) e indique a Issue.
2. Escolha um processo em [Processos e skills](../reference/processos-e-skills.md):
   - **Produto ponta a ponta**, para ecrãs novos: wireframe, PRD, design system e teste ponta a ponta.
   - **Design visual**, para a linguagem visual: `/design-01-random-seed` a `/design-09-restrained-minimalism`, saltando os passos que não precisa.
3. Para explorar uma ideia sem compromisso, use `/prototype`. Para melhorar um ecrã existente, use `/impeccable`.
4. Peça ao agente capturas de ecrã de cada versão e decida a partir delas.
5. Termine com o passo 5 de [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md#5-termine-com-uma-pull-request). Para mostrar o antes e o depois na PR, use `/before-and-after`.

## Manualmente

1. Siga os passos 1 a 4 de [Como desenvolver uma funcionalidade](desenvolver-uma-funcionalidade.md).
2. Construa os ecrãs principais e o percurso do utilizador numa pasta com o nome do estado em `apps/web/references/`, sem detalhe visual. As funcionalidades de Later e Maybe ficam no wireframe `apps/web/references/interactive-wireframe.tsx`.
3. Valide o protótipo com o sénior ou o programador intermédio, na Issue. Depois evolua-o para `ui-prototype/` e `final-visual/`, apagando cada versão anterior (consulte o [método de evolução](../product/system/prototype.md#método-de-evolução)).
4. Replique o `final-visual/` exatamente nas páginas em `apps/web/src/pages/` e nos estilos em `apps/web/src/style.css`.
5. Siga os passos 6 a 10 do mesmo guia. Inclua capturas de ecrã na Pull Request.

O resultado é uma Pull Request com o novo design implementado e capturas de ecrã para revisão.
