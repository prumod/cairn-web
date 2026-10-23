# Como trabalhar com agentes no T3

Este guia mostra como abrir o T3 da equipa, começar uma tarefa num projeto e pedir ajuda aos agentes com skills. Os guias de cada tarefa remetem para aqui. Se o Tiago já criou a conversa, siga [Como continuar uma conversa já criada no T3](continuar-uma-conversa-no-t3.md).

O T3 corre na máquina do Tiago. Os agentes executam comandos nessa máquina com as contas dele, incluindo GitHub e Cloudflare. Não peça deploys, eliminação de dados nem alterações fora da tarefa sem aprovação do Tiago.

## Antes de começar

- Peça ao Tiago para adicionar o seu email à lista de acesso. Precisa de conseguir receber mensagens nesse email.
- Tenha uma Issue no GitHub que descreva o trabalho. Consulte [Como contribuir](../../README.md#como-contribuir).

## 1. Entre no T3

1. Abra [t3.prumod.eu/join](https://t3.prumod.eu/join) no browser.
2. Na página **Cloudflare Access**, introduza o email autorizado e peça o código de acesso (**One-time PIN**).
3. Consulte a sua caixa de correio e introduza o código recebido. O acesso cria automaticamente uma ligação temporária ao T3 e abre a aplicação, com a lista de projetos à esquerda. Não precisa de pedir um link ao Tiago.
4. Depois do primeiro acesso, use [t3.prumod.eu](https://t3.prumod.eu). A sessão do T3 dura cerca de 30 dias. Se precisar de voltar a ligar o browser, abra novamente `/join`.

Se o código não chegar, consulte a pasta de spam e confirme que usou o email autorizado. Se o acesso continuar a falhar, peça ao Tiago para confirmar a entrada na lista.

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

## Administrar a lista de acesso (Tiago)

1. No **Cloudflare Zero Trust**, abra **Access controls > Policies > T3 Code - allowed users**, ou use a [ligação direta à política](https://dash.cloudflare.com/07e5c1652b02918c719474468f8e5664/one/access-controls/policies/61e7d59c-e22e-4201-939f-80d8722906e0/edit).
2. Em **Include > Emails**, acrescente o email de cada pessoa autorizada, mantendo os restantes emails.
3. Guarde a política. A pessoa pode então abrir `https://t3.prumod.eu/join` e entrar com o código recebido por email, sem intervenção adicional sua.

Para retirar alguém da lista, remova o email e guarde a política. Esta alteração não garante o encerramento imediato das sessões já abertas.

O percurso completo com receção de um código real por email e entrada no T3 ainda aguarda validação por uma pessoa autorizada.
