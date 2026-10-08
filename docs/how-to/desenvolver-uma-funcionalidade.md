# Como desenvolver uma funcionalidade

Use este guia como referência durante uma Issue pronta para implementar. O percurso começa pela Issue e termina quando a Pull Request entra em `main` e a Issue fica concluída. Não inclui publicação.

Faça o trabalho no editor, no terminal e no GitHub. Pode usar o ChatGPT para esclarecer dúvidas, mas confirme as respostas no código e na documentação do projeto. Não envie credenciais, ficheiros `.env` nem dados privados.

## 1. Confirme que o projeto está configurado

Se ainda não configurou o projeto, execute o assistente na pasta do repositório.

Em Ubuntu ou Ubuntu em WSL:

```sh
bash scripts/setup-project.sh
```

Em Windows, abra o PowerShell na pasta do repositório e execute:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-project.ps1
```

No Windows, use Git Bash para os restantes comandos deste guia. Se a configuração falhar, siga as instruções do assistente ou peça ajuda ao sénior ou ao programador intermédio. Consulte o [README](../../README.md) para mais detalhes sobre os pré-requisitos.

## 2. Leia a Issue

Leia a descrição, os critérios de aceitação e os comentários da Issue. Antes de alterar código, confirme que consegue responder a estas perguntas:

- Que comportamento deve mudar?
- O que deve acontecer quando a funcionalidade estiver concluída?
- Que partes estão dentro e fora do pedido?
- Como se pode verificar cada critério de aceitação?

Se faltar uma resposta ou houver interpretações possíveis, pergunte na Issue ao sénior ou ao programador intermédio. Espere pela clarificação antes de implementar. Se o pedido depender do backend, confirme o âmbito com essa pessoa. O backend é um projeto separado.

## 3. Atualize `main` e crie uma branch

Abra um terminal na pasta do repositório e confirme que não tem alterações locais inesperadas:

```sh
git status --short
```

Se aparecerem ficheiros que não pertencem a esta tarefa, não os apague nem os inclua na branch. Peça ajuda se não souber como os separar.

Atualize a cópia local de `main`:

```sh
git switch main
git pull --ff-only origin main
```

Crie uma branch curta. Use o número da Issue no nome quando existir:

```sh
git switch -c feat/123-short-description
```

Use `fix/` para uma correção ou `chore/` para uma tarefa técnica. Substitua `123-short-description` pelos dados da Issue. Confirme a branch atual com `git status --short --branch`.

## 4. Encontre o código relacionado

A aplicação frontend fica em `web/`. Use a pesquisa do editor para encontrar o texto, componente ou rota mencionado na Issue. Leia o código relacionado e os componentes que o chamam antes de decidir onde fazer a alteração.

Mantenha a alteração limitada ao pedido. Não reformate nem reorganize ficheiros sem relação com a funcionalidade. Se a estrutura existente não for clara, peça orientação antes de introduzir um padrão novo.

## 5. Implemente e defina como testar o comportamento

Implemente os critérios da Issue, um de cada vez. Para cada critério, identifique o resultado observável e defina como o vai testar.

A branch `main` ainda não tem framework nem testes automatizados. Antes de implementar uma alteração de comportamento, combine com o sénior ou o programador intermédio como será testada automaticamente. Não adicione um framework de testes nem afirme que o comportamento foi testado sem acordo e evidência. Se a Issue incluir a configuração de testes, siga os critérios e instruções dessa Issue.

## 6. Verifique a funcionalidade no browser

Inicie o frontend na raiz do repositório:

```sh
bun run dev
```

Abra o endereço local indicado pelo Vite, normalmente `http://localhost:5173`. Percorra o fluxo afetado e confirme os critérios da Issue. Verifique também os estados relevantes, como listas vazias, dados inválidos e carregamento, quando se aplicarem.

O frontend é um protótipo com dados fictícios e ações simuladas. Não trate uma ação simulada como uma integração real com o backend.

## 7. Execute as verificações e reveja as alterações

Execute a validação completa antes de abrir a Pull Request:

```sh
bun run check
```

Na branch `main` atual, este comando verifica formatação, lint, tipos e build. Ainda não executa testes automatizados. Se falhar, corrija a causa e execute-o novamente. Não descreva estas verificações como prova de que o comportamento funciona.

Reveja as alterações locais:

```sh
git diff --check
git status --short
git diff
```

Confirme que o diff só contém alterações da Issue, que os critérios estão cobertos e que não incluiu segredos ou ficheiros `.env`. Se não conseguir executar uma verificação, indique isso na Pull Request. Não diga que passou.

## 8. Faça commit e envie a branch

Adicione apenas os ficheiros desta funcionalidade. Não use `git add .` se houver outras alterações locais.

```sh
git add <ficheiros-alterados>
git commit -m "Describe the change"
git push -u origin HEAD
```

Se precisar de alterar a funcionalidade após o commit, faça as alterações na mesma branch, volte a executar as verificações relevantes, crie outro commit e envie-o com `git push`.

## 9. Abra a Pull Request e peça revisão

No GitHub, abra uma Pull Request da sua branch para `main`. Inclua:

- Uma descrição curta do que mudou.
- Uma ligação à Issue, por exemplo `Closes #123`.
- Os testes e verificações executados, incluindo a verificação manual no browser.
- Qualquer verificação que não conseguiu executar.

A branch `main` atual não tem verificações automáticas de Pull Request. Execute `bun run check` localmente e indique o resultado. Se o GitHub mostrar verificações para esta Pull Request, espere que passem. Peça revisão ao sénior ou ao programador intermédio e espere pela aprovação antes do merge. O README indica que o GitHub não exige atualmente uma aprovação para integrar alterações. Neste fluxo, a revisão continua a ser necessária.

Se receber comentários, responda-lhes e faça as alterações na mesma branch. Execute novamente as verificações relevantes e envie as alterações. A Pull Request existente recebe os novos commits.

## 10. Integre a Pull Request e conclua a Issue

Depois da aprovação e de todas as verificações passarem, use **Squash and merge** no GitHub. Elimine a branch remota depois do merge. Não use force push.

Confirme que a Issue foi fechada pela ligação `Closes #123`. Se continuar aberta, confirme com o sénior ou o programador intermédio antes de a fechar. Se a equipa atualizar o quadro do projeto manualmente, mova a Issue para **Done**.

Atualize a cópia local de `main` e elimine a branch local já integrada:

```sh
git switch main
git pull --ff-only origin main
git branch -d feat/123-short-description
```

Substitua o último argumento pelo nome da sua branch. Se o Git não permitir apagá-la, não force a operação; peça ajuda.

## Se ficar bloqueado

Registe a pergunta na Issue ou na Pull Request para manter a decisão junto do trabalho. Contacte o sénior ou o programador intermédio se o comportamento esperado não estiver claro, se precisar de alterar uma área fora do pedido, se uma verificação falhar sem causa evidente ou se não souber como testar a alteração.
