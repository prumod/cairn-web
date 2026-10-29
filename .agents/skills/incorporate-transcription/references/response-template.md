# Response Template

Write the final response in European Portuguese, as GitHub-flavored Markdown. It becomes the PR body. Lead with the source and the summary; keep each line short.

```markdown
Incorpora a transcrição N (`docs/product/transcriptions/<file>`) nos documentos derivados.

- Now: <decisões sobre Now, listadas abaixo; não aplicadas>
- Later: <movimentos, por exemplo N05 → L10, e novas>
- Maybe: <movimentos e novas>
- Never: <novas exclusões>
- Termos: <termos novos ou com nova evidência>
- Wireframe: <o que passou a demonstrar, por ID; lacunas que ficaram>

## Reclassificações

| Anterior | Atual | Base          | Motivo         |
| -------- | ----- | ------------- | -------------- |
| N05      | L10   | TN [hh:mm:ss] | <motivo curto> |

## Mudanças em Now

Decisões sobre as capacidades Now (N01–N04, N13, N14) ou propostas de passagem a Now. Não foram aplicadas: o PRD é a issue #104 e o protótipo está em `apps/web/references/final-visual/`.

- <decisão> (TN [hh:mm:ss])

Escrever "Nenhuma." quando não houver.

## Por decidir

Decisões que a transcrição não deixa claras e que não foram aplicadas:

- <pergunta> (TN [hh:mm:ss])

Escrever "Nenhuma." quando não houver.

## Verificação

- [x] `node scripts/transcriptions-pending.mjs`: nada pendente para este ficheiro
- [x] `bun run format:check`
- [x] `bun run lint`
- [x] `bun run typecheck`
- [x] `git diff --check`

A reclassificação ainda não foi validada com o entrevistado.
```
