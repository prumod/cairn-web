# Cairn — funcionalidades Later

## Fontes e estatuto

As prioridades foram acordadas com o utilizador; não constituem aprovação do entrevistado nem validação técnica ou jurídica. T1 a T4 referem-se às [transcrições](../transcriptions/): [T1](../transcriptions/transcricao1_gestao_obras.md), [T2](../transcriptions/transcricao2_gestao_obras.txt), [T3](../transcriptions/transcricao_3_gestao_obras.txt) e [T4](../transcriptions/transcricao4_teste_loop_gestao_obras.txt). T3 e T4 citam instantes da gravação (`[hh:mm:ss]`). A T4 identifica-se como transcrição sintética de teste, não como entrevista real. Contexto adicional: [ideia inicial](../system/ideia_inicial.txt) e [notas visuais](<../transcriptions/transcricao1_Notas Iniciais Projeto.jpeg>).

Consultar as [definições de prioridade](../README.md) e o [contrato do protótipo interativo](../system/prototype.md). A prioridade de produção não limita a cobertura do protótipo: Now, Later e Maybe são demonstrados primeiro como wireframe sem estilos e depois com UI próxima da produção, sempre com dados fictícios e ações simuladas. Os limites abaixo descrevem cada prioridade; não impedem demonstrar capacidades de outros níveis no mesmo protótipo.

## Funcionalidades

As classificações seguintes foram aceites na conversa. As fontes justificam a necessidade; nem todas a classificam explicitamente como futura. Mostrar uma etapa do procedimento não compromete a aplicação a executá-la ou automatizá-la.

- **L01 — Fornecedores e cotações:** cadastro, contactos, pesquisa por material e mapa de fornecedores; registar pedidos/respostas e comparar preços, mantendo a escolha humana de um fornecedor preferido. Preços continuam a ser introduzidos manualmente no Now. Base: T1 §§9–12; T2 §§8, 10, 20; ideia inicial; notas iniciais, «Antes da obra».
- **L02 — Acompanhamento depois da submissão:** propostas concorrentes e valores, relatórios, reclamações, resultado, documentos de habilitação, minuta, contrato e auto de consignação. Base: T2 §§14–15, 21.
- **L03 — Registos de obras e clientes:** organizar a informação de cada obra e do cliente. Base: ideia inicial; T1 §§1, 4.
- **L04 — Funcionários, mão de obra e equipamento:** registos, afetação de funcionários a obras e custos de mão de obra; sem planeamento automático de recursos. Base: ideia inicial; T1 §§3–4, 18; T2 §§1, 17.
- **L05 — Materiais e stock por obra:** consultar disponibilidade antes de comprar e acompanhar materiais. Base: ideia inicial; T1 §9; notas iniciais, «Durante a obra».
- **L06 — Finanças por obra:** despesas, faturação/entradas e recebimentos, com saldo demonstrativo «vermelho/verde»; distinguir valores faturados de valores recebidos. Não é faturação global nem substituição do ERP. Base: ideia inicial; T1 §§1, 4; T2 §1.
- **L07 — Progresso da execução:** registar percentagem concluída por item do mapa de medições. Não inclui Gantt, dependências ou previsões de conclusão. Base: ideia inicial, pergunta sobre conclusão item a item.
- **L08 — Pós-obra pública:** receção provisória e definitiva, garantia, vistorias, reparações, retenções e respetiva libertação; alertas de prazos e ordenação por urgência. Base: T1 §14; T2 §§11–13, 18.

- **L09 — Cronograma financeiro da proposta:** incluir e acompanhar esta componente quando exigida. Adiado de Now para Later por decisão do utilizador; continua a pertencer à preparação da proposta, não à execução da obra.
  - **Objetivo:** não deixar faltar uma componente da proposta descrita nas duas entrevistas.
  - **Protótipo:** mostrar períodos, percentagens e valores de um cronograma financeiro fictício; permitir assinalar «preparado» ou «não exigido neste concurso». Uma edição avançada fica por validar.
  - **Base:** T1 §6; T2 §6.
  - **Limite:** não implementar na fase Now nem condicionar a revisão ou submissão simulada Now à sua preparação. A T2 admite que parte deste detalhe pode ultrapassar a apresentação inicial. Não confundir com o Gantt de execução nem com recebimentos reais. A edição/importação/exportação avançada permanece em Maybe M11.
  - **Termo por definir:** distribui produção prevista, valores da proposta, pagamentos previstos ou uma combinação destes? Não representa recebimentos reais nem o Gantt de execução. Esta questão foi retirada da lista de termos Now e permanece por confirmar.

## Adiado de Now pela T3

Na T3, o âmbito Now ficou reduzido a mapa, assistente, vista do concurso e filtros; o dossier e a checklist ficam «para depois» e AcinGov fica para o fim (T3 [00:32:04]–[00:32:26], [01:26:42]–[01:28:55]). As funcionalidades seguintes saíram de Now com os mesmos objetivos e limites; os identificadores antigos estão entre parênteses. Continuam a pertencer à preparação da proposta, não à execução da obra.

- **L10 — Linha temporal dos prazos de propostas (antes N05):** datas-limite numa linha temporal/lista ordenada, com «próximo do prazo» e «prazo ultrapassado». Em Now, «Quais os prazos mais urgentes?» é respondido pelo assistente N13 e pelos filtros N14. A T3 sugere uma visualização temporal sobre o mapa (T3 [00:07:52]–[00:08:21], [00:46:10]). Não é o cronograma de execução. Base: T1 §8; T2 §§8, 14.
- **L11 — Oportunidades recebidas por convite (antes N06):** convite fictício com aviso por e-mail e acesso demonstrativo ao procedimento; decisão registada localmente. O e-mail é apenas aviso; a aceitação ou recusa formal acontece na plataforma externa. Base: T1 §7; notas iniciais da transcrição 1.
- **L12 — Rever requisitos e decidir participar (antes N07):** comparar requisitos, incluindo o alvará exigido, com o perfil N01; mostrar informação em falta ou incompatibilidade aparente; registar interesse, «Participar» ou «Não concorrer». A recusa não deve impedir consórcios com outra empresa (T3 [01:10:29]). Apoio à revisão humana, não parecer jurídico. Base: T1 §7; T2 §§5, 9; T3 [00:30:45], [01:18:26]–[01:19:36].
- **L13 — Dossier: peças do concurso (antes N08):** listar desenhos, memorial descritivo, mapas e requisitos; pré-visualizações fictícias; assinalar peças obtidas na plataforma indicada. Sem autenticação externa nem descarregamento real. Base: T1 §6; T2 §5; T3 [01:26:42].
- **L14 — Checklist de documentos com pré-verificação (antes N09):** listar os documentos exigidos pelo concurso; o assistente compara-os com os documentos da empresa, classifica cada documento, assinala os que não conseguiu classificar e indica «quase pronto» ou o que falta. A pessoa confirma cada item; o assistente não marca a proposta como completa sem confirmação humana. A recolha automática a partir de uma pasta configurada é uma opção a validar. Não pressupor uma checklist universal nem verificar autenticidade ou validade legal. Base: T1 §§6, 15; T2 §§6, 16; T3 [00:11:30]–[00:12:49], [00:35:16]–[00:38:41], [01:26:59].
- **L15 — Lista de preços unitários e total (antes N10):** editar preços de itens, unidades e quantidades fictícias; subtotais e total; itens sem preço. Não aplicar automaticamente 25 % de margem. Base: T1 §§6, 9, 11–13; T2 §6.
- **L16 — Rever a proposta e simular a passagem à plataforma (antes N12):** resumir documentos, peças, preços e valor; mostrar omissões e prazo ultrapassado; «Simular submissão» com «Submissão simulada — nenhum documento foi enviado». AcinGov/Vortal continua a ser o local da submissão real e a T3 coloca esta integração no fim (T3 [00:32:26]). L09 não é condição de prontidão. Base: T1 §§6, 8, 15; T2 §§6, 14, 21.

## Novas funcionalidades da T3

- **L17 — Navegação pelo assistente:** o assistente abre o ecrã, a vista e os filtros pedidos (por exemplo, «quero ver a Torreira em lista»). Escrito «Navegação (Later)» no quadro final. Base: T3 [00:45:19]–[00:45:49], [01:27:07]–[01:27:58].
- **L18 — Vista agrupada por fases:** segunda vista, além do mapa, com as oportunidades agrupadas por estado — vista, interessante, inscrita — numa única tabela com filtro de fase, em vez de vários quadros. Inclui consultar em tabela os concursos em que a empresa demonstrou interesse, sem os acumular no mapa. Base: T3 [00:09:13]–[00:09:42], [01:18:08]–[01:19:44], [01:30:00]–[01:31:46].

## Adiado de Now pela T4

- **L19 — Filtro por entidade adjudicante:** filtrar as oportunidades pela entidade adjudicante, com os restantes filtros N14. «Não é preciso agora. Pode ficar para mais tarde.» Base: T3 [01:06:57]; T4 [00:01:10].

As integrações reais e a persistência são trabalho técnico posterior ao protótipo com dados fictícios, não uma funcionalidade adicional nem uma integração já aprovada. As fontes públicas, APIs, mapas e cobertura de dados precisam de validação separada (T2 §§2, 19, 22–24).
