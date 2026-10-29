# Questões de investigação

Lista das perguntas por responder cuja resposta decide uma funcionalidade. É a fonte de verdade das conclusões atuais; as pesquisas em `pesquisa_*.md` são fotografias de 07-10-2026 e não são mantidas.

## Regras

- Uma pergunta só entra na tabela se bloquear uma decisão. A coluna «Desbloqueia» nomeia a funcionalidade; sem ela, não há linha.
- Investigar só quando a funcionalidade estiver perto de ser construída. Até lá, o estado fica «por investigar».
- Cada investigação é uma issue com tempo limitado. As notas datadas vão nos comentários da issue.
- Ao fechar a issue, preencher a linha: conclusão, data e evidência. Só a linha pode ser citada nos documentos de produto.
- Se a resposta mudar, acrescentar uma linha nova que aponta para a anterior. Não reescrever a conclusão antiga.
- Estados: `por investigar`, `parcial`, `confirmado`. «Não localizei» nunca se converte em «não existe».

## Perguntas

| Pergunta                                                                                     | Desbloqueia                                                     | Estado         | Conclusão | Data | Evidência                                              |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------- | --------- | ---- | ------------------------------------------------------ |
| INCM: existe API, licença ou sandbox para os anúncios do Diário da República, e a que custo? | [N02](https://github.com/prumod/cairn-web/issues/104) (recolha) | por investigar | —         | —    | [arquitetura §5, §10.3](pesquisa_arquitetura_cairn.md) |
| BASE: o projeto obtém token? Que cobertura tem de anúncios de obras, e qual o limite de uso? | N02 (fonte alternativa ou complementar)                         | por investigar | —         | —    | [arquitetura §5, §10.2](pesquisa_arquitetura_cairn.md) |
| dados.gov.pt: que datasets cobrem anúncios de obras, com que licença e atualização?          | N02 (fonte alternativa)                                         | por investigar | —         | —    | [arquitetura §5, §10.4](pesquisa_arquitetura_cairn.md) |
| O anúncio do Diário da República inclui o prazo de submissão, ou só a plataforma o indica?   | [N04](https://github.com/prumod/cairn-web/issues/104) (prazos)  | por investigar | —         | —    | T3 [00:28:51]–[00:32:04]; nota no «Limite» de N04      |
| IMPIC: há pesquisa ou serviço para validar o alvará de uma empresa?                          | N01 e N04 (alvará); L12                                         | por investigar | —         | —    | [arquitetura §5, §10.5](pesquisa_arquitetura_cairn.md) |

## Fora da tabela

Estas perguntas das pesquisas não bloqueiam nenhuma decisão atual. Voltam à tabela quando uma funcionalidade passar a depender delas.

- acinGov, VORTAL e eSPap com API para fornecedores: dependem da submissão real, que é L16 e fica no fim (T3 [00:32:26]).
- RGPD, controlador e subcontratante, retenção e DPIA: dependem de dados reais, que o protótipo não usa.
- Orçamento, equipa, região, RPO/RTO e autenticação: decisões de operação, ainda sem produção.
- Confirmação de N01–N10 e N12 com o entrevistado: pergunta de entrevista, não de investigação. Pertence à próxima transcrição.
