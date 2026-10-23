# Como continuar uma conversa já criada no T3

Este guia mostra como entrar no T3 e retomar uma conversa que o Tiago já criou para si. Não precisa de configurar o ambiente de programação. Para criar uma conversa nova, consulte [Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md#2-comece-uma-thread).

## Antes de começar

- O Tiago adicionou o seu email à lista de acesso e indicou-lhe o nome da conversa e a Issue do trabalho.
- Consegue receber mensagens nesse email.
- Sabe o seu login do GitHub.

O T3 corre na máquina do Tiago e os agentes usam as contas dele. Não peça deploys, eliminação de dados nem alterações fora da tarefa sem a aprovação do Tiago.

## Passos

1. Abra [t3.prumod.eu/join](https://t3.prumod.eu/join) no browser.
2. Introduza o email autorizado e peça o código de acesso (**One-time PIN**).
3. Copie o código da sua caixa de correio e introduza-o na página. O T3 abre com a lista de projetos à esquerda.
4. Na barra lateral, abra o projeto `cairn-web` e clique na conversa que o Tiago indicou.
5. Na caixa de mensagem, escreva o seu login e peça para continuar, por exemplo: `Sou o <o-seu-login>. Continua o trabalho.` Com o login, os commits aparecem no GitHub em seu nome e o agente não lhe pergunta quem é.
6. Responda às perguntas do agente e leia o diff antes de aprovar cada passo.
7. Termine conforme o [passo 5 de Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md#5-termine-com-uma-pull-request): `bun run check`, `/code-review`, `/rpi-describe-pr` e revisão da Pull Request.

Nas visitas seguintes, abra [t3.prumod.eu](https://t3.prumod.eu). A sessão dura cerca de 30 dias. Se o código não chegar ou o acesso falhar, consulte o [passo 1 de Trabalhar com agentes no T3](trabalhar-com-agentes-no-t3.md#1-entre-no-t3).

O resultado é uma conversa em curso, com commits em seu nome e, no fim, uma Pull Request ligada à Issue.
