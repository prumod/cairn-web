# Processos e skills de desenvolvimento

Esta página lista os processos e as skills que pode usar com os agentes no T3. Escolha o processo que se adapta à tarefa; nenhum é obrigatório. Para aceder ao T3 e invocar uma skill, consulte [Trabalhar com agentes no T3](../how-to/trabalhar-com-agentes-no-t3.md).

As skills estão instaladas na máquina que executa o T3. Só estão disponíveis nas threads do T3, não num agente instalado no seu computador.

## Processos

### RPI: do problema à solução publicada

Use para uma funcionalidade ou alteração com problema ainda por esclarecer. Cada fase grava um documento em `.rpi/problems/<slug>/` e indica a fase seguinte.

| Ordem | Fase                      | Skill                           | Resultado                                                         |
| ----- | ------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| 1     | Pedido                    | `rpi-request`                   | `request.md` com o pedido ou a Issue.                             |
| 2     | Perguntas de investigação | `rpi-create-research-questions` | Plano do que investigar.                                          |
| 3     | Investigação              | `rpi-create-research`           | Factos sobre o estado atual do código e do produto.               |
| 4     | Problema                  | `rpi-define-problem`            | `problem.md` confirmado por si: intenção e requisitos.            |
| 5     | Solução de produto (PRD)  | `rpi-create-prd`                | Comportamento e experiência escolhidos.                           |
| 6     | Solução técnica (TDD)     | `rpi-create-tdd`                | Desenho técnico. Aqui, TDD significa _technical design document_. |
| 7     | Plano de implementação    | `rpi-create-structure-outline`  | Fatias verificáveis e ordem de execução.                          |
| 8     | Implementação             | `rpi-implement-outline`         | Código e resultados das verificações.                             |
| 9     | Pull Request              | `rpi-describe-pr`               | Uma PR da branch atual com a descrição revista.                   |

- `rpi-create-design-discussion` é opcional, depois da fase 4, para uma decisão de desenho que atravessa várias partes.
- `rpi-setup-worktree` cria uma worktree. No T3 não é necessário: cada thread com **New worktree** já trabalha numa worktree própria.
- `rpi-to-spec` e `rpi-to-tickets` publicam o trabalho já decidido como Issues no GitHub.

### Produto ponta a ponta

Use para uma funcionalidade com ecrãs novos, do planeamento à verificação num ambiente semelhante a produção.

1. **Planeamento.** Clarifique o pedido. Skills úteis: `grill-with-docs`, `triage`.
2. **Protótipo de UX.** Construa os ecrãs principais de Now em `apps/web/references/`, numa pasta com o nome do estado, o conceito e o percurso do utilizador, sem design visual detalhado. Skill: `prototype`. As funcionalidades de Later e Maybe ficam no wireframe `apps/web/references/interactive-wireframe.tsx`. O [método de evolução](../product/system/prototype.md#método-de-evolução) descreve os estados `ux-prototype`, `ui-prototype` e `final-visual`.
3. **PRD.** Descreva o que quer implementar e publique-o como GitHub Issue. Skills: `rpi-create-prd` ou `to-spec`. Quando uma funcionalidade de Later ou Maybe ganha PRD, apague a sua entrada de `docs/product/{later,maybe}/funcionalidades.md`.
4. **Design system.** Peça ao agente, por exemplo: "Identifica os ecrãs principais e contesta qualquer experiência prescrita. Usa o teu julgamento para escolher a melhor experiência." Descreva a sensação da experiência para cada utilizador do sistema (por exemplo, no Claude Design). Skill: `impeccable`. Evolua o protótipo para `ui-prototype/` e depois para `final-visual/`, apagando cada versão anterior. A produção replica o `final-visual/` exatamente.
5. **Fechar o ciclo ponta a ponta.** Peça ao agente que teste a funcionalidade num ambiente semelhante a produção: `bun run test:browser` localmente ou o ambiente testing, `https://cairn-testing.prumod.eu`. Não execute deploy sem aprovação.

### Design visual

Use para criar ou renovar a linguagem visual de uma página. Siga a ordem e salte os passos que não precisa.

| Ordem | Skill                             | Resultado                                                       |
| ----- | --------------------------------- | --------------------------------------------------------------- |
| 0     | `design-00-run-process`           | Quatro percursos isolados na fase 1 e uma só conversa depois.   |
| 1     | `design-01-random-seed`           | Uma direção criativa derivada de uma semente aleatória.         |
| 2     | `design-02-broad-directions`      | Muitas ideias curtas para uma linguagem de design própria.      |
| 3     | `design-03-sharpen-direction`     | A direção escolhida, refinada com as suas reações.              |
| 4     | `design-04-poc-prompt`            | Um prompt curto para construir a primeira prova de conceito.    |
| 5     | `design-05-critic-loop`           | Melhorias sucessivas a partir de críticas de capturas de ecrã.  |
| 6     | `design-06-image-generation`      | Imagens geradas, shaders ou efeitos 3D.                         |
| 7     | `design-07-looping-video`         | Um vídeo em loop no lugar de uma imagem estática.               |
| 8     | `design-08-scroll-transitions`    | Transições controladas pelo scroll, a partir de vídeos gerados. |
| 9     | `design-09-restrained-minimalism` | Uma versão contida e minimalista, centrada na imagem.           |

### Revisão de arquitetura do backend

Use antes de abrir a PR quando a alteração toca o servidor. Reveja:

| Ponto                   | Onde procurar                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Endpoints expostos      | `apps/web/src/routes/`, incluindo `api/`                                                                       |
| Autenticação            | `packages/auth/` e `packages/db/src/schema/auth.ts`                                                            |
| Autorização             | `apps/web/src/server/modules/access/`                                                                          |
| Schema da base de dados | `packages/db/src/schema/`, tabelas em `apps/web/src/server/modules/*/persistence/` e `packages/db/migrations/` |
| Modelo de dados         | `apps/web/src/server/modules/` e [GLOSSARY](../../GLOSSARY.md)                                                 |

Skills úteis: `code-review`, `codebase-design`.

## Skills de apoio

Pode usar estas skills em qualquer processo. Escolha as que o ajudam.

| Objetivo                      | Skills                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| Clarificar um pedido ou plano | `grill-with-docs`, `grill-me`, `grilling`, `next-decision`, `triage`                   |
| Vocabulário e decisões        | `domain-modeling` (GLOSSARY e ADRs)                                                    |
| Planear trabalho grande       | `wayfinder`, `to-spec`, `to-tickets`, `walking-skeleton`                               |
| Investigar                    | `research`                                                                             |
| Cenários de comportamento     | `bdd`, `to-features`, `atdd`                                                           |
| Implementar com testes        | `hvtdd`, `tdd`, `high-value-testing`                                                   |
| Bugs                          | `reproducing-bugs`, `diagnosing-bugs`                                                  |
| Estrutura do código           | `improve-codebase-architecture`, `codebase-design`                                     |
| Interface                     | `prototype`, `impeccable`, `design-00-run-process` a `design-09-restrained-minimalism` |
| Rever                         | `code-review`, `decisions`                                                             |
| Pull Request                  | `rpi-describe-pr`, `before-and-after`                                                  |
| Documentação                  | `documentation` (deste repositório)                                                    |
| Aprender                      | `teach`                                                                                |
