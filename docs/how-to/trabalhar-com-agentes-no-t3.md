# Como trabalhar com agentes no T3

Este guia mostra como abrir o T3 da equipa, começar uma tarefa num projeto e pedir ajuda aos agentes com skills. Os guias de cada tarefa remetem para aqui.

O T3 corre na máquina do Tiago. Os agentes executam comandos nessa máquina com as contas dele, incluindo GitHub e Cloudflare. Não peça deploys, eliminação de dados nem alterações fora da tarefa sem aprovação do Tiago.

## Antes de começar

- Peça ao Tiago para autorizar o seu email no Cloudflare Access e para lhe enviar um link de pairing. O link só funciona uma vez e expira, por omissão, ao fim de 24 horas.
- Tenha uma Issue no GitHub que descreva o trabalho. Consulte [Como contribuir](../../README.md#como-contribuir).

## 1. Entre no T3

1. Abra o link de pairing no browser. O endereço começa por `https://t3.prumod.eu/pair`.
2. Na página **Cloudflare Access**, inicie sessão com o email autorizado.
3. O T3 abre com a lista de projetos à esquerda. Depois do primeiro acesso, use `https://t3.prumod.eu`. A sessão do T3 dura cerca de 30 dias.

## 2. Comece uma thread

1. Na barra lateral, escolha o projeto `cairn-web` e crie uma thread nova.
2. Na caixa de mensagem, mantenha **New worktree** e **From main (remote)**. Assim, a thread trabalha numa cópia isolada, criada a partir da `main` atual, sem afetar outras threads.
3. Escolha o modelo no seletor da caixa de mensagem.
4. Na primeira mensagem, indique a Issue, por exemplo: "Trabalha na Issue #123."
5. Antes do primeiro commit, o agente pergunta quem é e mostra os colaboradores do repositório como opções. Escolha o seu login GitHub, por exemplo `micaeldevp`. O agente executa `scripts/use-github-identity.sh` e os commits desta thread aparecem no GitHub em seu nome. Para evitar a pergunta, inclua o login na primeira mensagem.

A Pull Request continua a ser aberta pela conta do Tiago, com `Autor: @<o-seu-login>` na descrição. Este não é o melhor resultado possível: o ideal seria o T3 identificar automaticamente quem criou cada thread e abrir a Pull Request com a conta dessa pessoa. O T3 identifica dispositivos, não pessoas, e não regista quem criou cada thread; mudar isso exige uma alteração no próprio T3, que a equipa não controla. A pergunta do agente é a melhor opção dentro desse limite.

## 3. Use skills

Uma skill é um conjunto de instruções que o agente segue para um tipo de trabalho. Escreva o nome no início da mensagem:

- Com modelos Claude: `/nome-da-skill`, por exemplo `/diagnosing-bugs`.
- Com modelos Codex: `$nome-da-skill`.

Consulte [Processos e skills](../reference/processos-e-skills.md) para escolher um processo e as skills de apoio. Pode invocar várias skills, uma de cada vez, na mesma thread.

## 4. Acompanhe e decida

- Responda às perguntas do agente. As decisões de produto e de desenho são suas.
- Antes de aprovar um passo, leia os ficheiros ou o diff que o agente mostra.
- Se o agente propuser algo fora da Issue, peça-lhe para parar e registe a questão na Issue.

## 5. Termine com uma Pull Request

1. Peça ao agente que execute `bun run check` e que mostre o resultado.
2. Peça uma revisão com `/code-review`.
3. Peça a Pull Request com `/rpi-describe-pr`. A descrição deve incluir `Closes #123` e as verificações feitas.
4. Peça revisão ao sénior ou ao programador intermédio. O merge segue o passo 10 de [Como desenvolver uma funcionalidade](desenvolver-uma-funcionalidade.md#10-integre-a-pull-request-e-conclua-a-issue).

O resultado é uma Pull Request no GitHub, ligada à Issue, com as verificações descritas.
