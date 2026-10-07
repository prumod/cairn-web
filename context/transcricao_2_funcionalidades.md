# Cairn — funcionalidades e âmbito cumulativo até à transcrição 2

## Base e estatuto

Esta lista consolida as **prioridades acordadas com o utilizador nesta conversa**, com referências às fontes. Não constitui aprovação do utilizador entrevistado, validação técnica ou jurídica. A cobertura do primeiro mockup abaixo é uma proposta de representação destas prioridades; este documento não implementa o protótipo.

A base cumulativa inclui os materiais de trabalho T1/T2, uma ideia inicial, um mapeamento de plataformas e notas visuais. Os materiais de entrevista originais ficam fora deste PR; as referências a T1/T2 e secções permitem rastrear a origem no material de trabalho. As transcrições são textos revistos, com limitações e trechos incertos; não são validação jurídica nem documentação de APIs.

**Decisão de âmbito atual:** o percurso começa em **Início** e termina em **Submeter proposta na plataforma**. Coincide com a escolha explícita da transcrição 2, §21. Descoberta, decisão e preparação entram; avaliação, adjudicação, contratação, execução e pós-obra não entram no primeiro protótipo.

### Convenção de nomes

- `transcricao_2*` significa «síntese baseada nas transcrições 1 e 2 e no contexto associado», não «apenas transcrição 2».
- Uma futura versão `transcricao_3*` deve incorporar cumulativamente as transcrições 1, 2 e 3, incluindo correções ou mudanças de âmbito.
- Cada conjunto de diagramas é um snapshot histórico e deve ser preservado sem alterações. Os quatro diagramas originais `transcricao1_*` permanecem; os novos `transcricao_2_*` são a síntese cumulativa seguinte. Uma futura versão `transcricao_3_*` acrescenta um novo conjunto, sem substituir os anteriores. Os nomes dos documentos-fonte não mudam.
- Os diagramas de visão geral mantêm etapas posteriores como contexto fora de **Now**. As áreas de produto associadas são propostas em **Later**, mas isso não compromete o Cairn a automatizar cada etapa do procedimento real. O diagrama do percurso mais importante mostra apenas **Now**.
- Nesta versão, as correções da transcrição 2 refinam a anterior: o mapa torna-se central; há verificação de classe e licenças; a preparação inclui preços por item; documentos de habilitação pós-adjudicação são uma etapa distinta; receção provisória e definitiva são explícitas.

## Quatro níveis

- **Now:** funcionalidades acordadas para o primeiro protótipo.
- **Later:** funcionalidades pretendidas, mas fora do primeiro protótipo.
- **Maybe:** ideias que precisam de validação antes de compromisso.
- **Never:** exclusões deliberadas do produto, não apenas deste protótipo.

Estar antes da submissão não torna automaticamente uma função **Now**. Por exemplo, o utilizador entrevistado pode pedir cotações para preparar preços, mas um módulo integrado de fornecedores pode ficar para **Later**. Do mesmo modo, simular uma capacidade no protótipo não confirma a viabilidade da integração real.

## Now — percurso acordado para o primeiro protótipo

As referências T1 e T2 indicam as secções numeradas das transcrições 1 e 2. O comportamento de interface abaixo é uma proposta derivada das necessidades descritas, não uma interface especificada nas entrevistas.

### N01 — Definir a referência da empresa

- **Objetivo:** pesquisar a partir da localização da empresa e ter presentes as suas habilitações.
- **Protótipo:** editar localização, raio de pesquisa, classe e licenças num perfil demonstrativo. Estes campos alimentam a pesquisa e a revisão de requisitos, sem consulta real ao IMPIC.
- **Base:** T2 §§4, 7, 9.
- **Limite:** não fixar limites monetários por classe nem garantir elegibilidade jurídica. Os valores da conversa eram aproximados.

### N02 — Encontrar anúncios de obras por data e raio

- **Objetivo:** reduzir a leitura individual das páginas de anúncios diários do Diário da República.
- **Protótipo:** escolher data de publicação e raio; aplicar filtros a um pequeno conjunto fictício e abrir um resultado. Incluir um exemplo sem resultados.
- **Base:** T1 §5.1; T2 §§2, 4, 7.
- **Limite:** sem recolha real, API, scraping ou cálculo geográfico de produção.

### N03 — Explorar oportunidades no mapa e na lista

- **Objetivo:** perceber onde estão as obras e consultar os mesmos resultados numa alternativa legível.
- **Protótipo:** alternar mapa ilustrativo e lista; selecionar um marcador ou uma linha e mostrar os mesmos detalhes do concurso. Assinalar a localização de referência e o raio ilustrativo.
- **Base:** T2 §§1, 4, 7, 22.
- **Limite:** dados e posições demonstrativos; não depende de um serviço de mapas em produção.

### N04 — Consultar o concurso e os prazos

- **Objetivo:** decidir se vale a pena analisar a participação.
- **Protótipo:** mostrar entidade adjudicante, descrição do trabalho, valor anunciado, localização, prazo da obra, data/hora limite de entrega e plataforma indicada. Permitir consultar o anúncio de origem, representado por uma pré-visualização demonstrativa.
- **Base:** T1 §§5.3, 6, 8; T2 §§5, 6, 14.
- **Limite:** distinguir valor anunciado de valor proposto, e prazo da obra de prazo de submissão.

### N05 — Consultar a linha temporal dos prazos de propostas

- **Objetivo:** ver a urgência dos concursos em análise ou preparação.
- **Protótipo:** apresentar datas-limite numa linha temporal/lista ordenada e sinalizar «próximo do prazo» e «prazo ultrapassado» com uma data de referência de demonstração.
- **Base:** T1 §8; T2 §§8, 14.
- **Limite:** não é o cronograma de execução da obra; sem notificações reais por e-mail.

### N06 — Incluir oportunidades recebidas por convite

- **Objetivo:** cobrir a entrada alternativa ao anúncio público.
- **Protótipo:** apresentar um convite fictício com indicação de aviso por e-mail e acesso demonstrativo ao procedimento. A decisão de participar ou não fica registada localmente para continuar o percurso.
- **Base:** T1 §7; notas iniciais da transcrição 1.
- **Limite:** o e-mail é apenas aviso. Aceitação, recusa formal e interação com o procedimento acontecem na plataforma externa; não há leitura de caixa de correio.

### N07 — Rever requisitos e decidir participar

- **Objetivo:** avaliar interesse e capacidade antes de preparar a proposta.
- **Protótipo:** comparar requisitos ilustrativos com classe/licenças do perfil; mostrar informação em falta ou incompatibilidade aparente; permitir «Participar» ou «Não concorrer». A participação inicia a preparação; a recusa termina este percurso.
- **Base:** T1 §7; T2 §§5, 9.
- **Limite:** apoio à revisão humana, não aprovação automática nem parecer jurídico. Não confundir esta revisão com documentos de habilitação pedidos após adjudicação.

### N08 — Organizar as peças do concurso

- **Objetivo:** reunir a base necessária para preparar a proposta.
- **Protótipo:** listar desenhos, memorial descritivo, mapas e requisitos; abrir pré-visualizações fictícias e assinalar peças obtidas. Mostrar que a obtenção real acontece na plataforma indicada.
- **Base:** T1 §6; T2 §5.
- **Limite:** sem autenticação externa, acesso pago, descarregamento real ou análise automática de ficheiros.

### N09 — Preparar a documentação com uma checklist

- **Objetivo:** reduzir omissões que podem levar à desclassificação.
- **Protótipo:** listar os documentos exigidos para o concurso fictício, distinguir obrigatórios/opcionais, simular anexação ou marcar como preparado e evidenciar documentos em falta.
- **Base:** T1 §§6, 15; T2 §§6, 16.
- **Limite:** não pressupor uma checklist universal. No processo atual, a documentação é preparada em Word/Excel. A simulação não verifica autenticidade ou validade legal.

### N10 — Preencher a lista de preços unitários e obter o total

- **Objetivo:** atribuir preços aos itens e definir o valor final da proposta.
- **Protótipo:** editar preços numa tabela de itens, unidades e quantidades fictícias; calcular subtotais e total demonstrativos; evidenciar itens sem preço. Preços obtidos externamente podem ser introduzidos manualmente.
- **Base:** T1 §§6, 9, 11–13; T2 §6.
- **Limite:** não incluir já um módulo de compras, stock ou pedidos de cotação. A regra de margem está incerta na T1; não aplicar automaticamente 25 % nem tratar esse exemplo como regra de negócio.

### N11 — Incluir o cronograma financeiro quando exigido

- **Objetivo:** não deixar faltar uma componente da proposta descrita nas duas entrevistas.
- **Protótipo:** mostrar períodos, percentagens e valores de um cronograma financeiro fictício; permitir assinalar «preparado» ou «não exigido neste concurso». Uma edição avançada fica por validar.
- **Base:** T1 §6; T2 §6.
- **Limite:** a T2 admite que parte deste detalhe pode ultrapassar a apresentação inicial. Não confundir com o Gantt de execução nem com recebimentos reais.

### N12 — Rever a proposta e simular a passagem à plataforma

- **Objetivo:** reunir o conjunto completo e verificar o prazo antes da entrega.
- **Protótipo:** resumir documentos, peças, preços, valor e cronograma exigido; mostrar omissões e prazo ultrapassado; num exemplo completo e dentro do prazo, abrir um painel que representa a plataforma externa e concluir com «Simular submissão». Mostrar «Submissão simulada — nenhum documento foi enviado».
- **Base:** T1 §§6, 8, 15; T2 §§6, 14, 21.
- **Limite:** AcinGov/Vortal continua a ser o local da submissão real. Não comprar selos, assinar documentos ou enviar propostas. «Em análise», «Em preparação», «Pronta» e «Submetida» são estados da participação/proposta da empresa, não fases do concurso público.

## Later — pretendido, fora do primeiro protótipo

As classificações seguintes foram aceites na conversa. As fontes justificam a necessidade; nem todas a classificam explicitamente como futura. Mostrar uma etapa do procedimento não compromete a aplicação a executá-la ou automatizá-la.

- **L01 — Fornecedores e cotações:** cadastro, contactos, pesquisa por material e mapa de fornecedores; registar pedidos/respostas e comparar preços, mantendo a escolha humana de um fornecedor preferido. Preços continuam a ser introduzidos manualmente no Now. Base: T1 §§9–12; T2 §§8, 10, 20; ideia inicial; notas iniciais, «Antes da obra».
- **L02 — Acompanhamento depois da submissão:** propostas concorrentes e valores, relatórios, reclamações, resultado, documentos de habilitação, minuta, contrato e auto de consignação. Base: T2 §§14–15, 21.
- **L03 — Registos de obras e clientes:** organizar a informação de cada obra e do cliente. Base: ideia inicial; T1 §§1, 4.
- **L04 — Funcionários, mão de obra e equipamento:** registos, afetação de funcionários a obras e custos de mão de obra; sem planeamento automático de recursos. Base: ideia inicial; T1 §§3–4, 18; T2 §§1, 17.
- **L05 — Materiais e stock por obra:** consultar disponibilidade antes de comprar e acompanhar materiais. Base: ideia inicial; T1 §9; notas iniciais, «Durante a obra».
- **L06 — Finanças por obra:** despesas, faturação/entradas e recebimentos, com saldo demonstrativo «vermelho/verde»; distinguir valores faturados de valores recebidos. Não é faturação global nem substituição do ERP. Base: ideia inicial; T1 §§1, 4; T2 §1.
- **L07 — Progresso da execução:** registar percentagem concluída por item do mapa de medições. Não inclui Gantt, dependências ou previsões de conclusão. Base: ideia inicial, pergunta sobre conclusão item a item.
- **L08 — Pós-obra pública:** receção provisória e definitiva, garantia, vistorias, reparações, retenções e respetiva libertação; alertas de prazos e ordenação por urgência. Base: T1 §14; T2 §§11–13, 18.

As integrações reais e a persistência são trabalho técnico posterior ao mockup, não uma funcionalidade adicional nem uma integração já aprovada. As fontes públicas, APIs, mapas e cobertura de dados precisam de validação separada (T2 §§2, 19, 22–24).

## Maybe — validar antes de compromisso

- **M01 — Planeamento tipo Microsoft Project:** Gantt, tarefas, dependências, tempos de espera, linhas temporais por recurso e previsão de conclusão. Decisão explícita do utilizador: Maybe, não Later. Validar utilidade no trabalho real; o utilizador entrevistado não usa atualmente Microsoft Project. Não inclui a linha temporal de propostas N05 nem o cronograma financeiro N11. Base: T1 §§17, 19–20; notas iniciais, «Programas» e «Visualizações».
- **M02 — Assistente para pesquisar concursos:** validar vantagem face aos filtros, respostas esperadas e referências verificáveis. A ideia «Plus» não estabelece um plano comercial. Base: T2 §§1, 4, 7, 19.
- **M03 — Análise de concorrentes:** participações, vitórias, valores e mapa. Validar cobertura dos dados e utilidade na decisão; o Portal BASE não confirma cobertura de todas as participações. Base: T1 §5.2; T2 §§1, 7.
- **M04 — Perguntas sobre finanças da obra:** consultar despesas, faturação e saldo em linguagem natural. Validar se acrescenta valor aos resumos de L06. Base: ideia inicial, perguntas sobre despesas e faturação.
- **M05 — Pesquisa de fornecedores por IA:** pedir fornecedores/contactos por material. Validar vantagem face à pesquisa do cadastro L01 e qualidade das respostas. Base: ideia inicial; T1 §10.
- **M06 — Extração de cotações de e-mails:** atualizar preços automaticamente, com acesso autorizado, validação humana e formatos confirmados. Base: T1 §13; notas iniciais, atualização após evento/e-mail.
- **M07 — Histórico de preços e validade das cotações:** gráficos de evolução e acompanhamento da duração de cada preço; validar utilidade e dados necessários. Base: T1 §13; notas iniciais, «Antes da obra».
- **M08 — Preços de referência e sugestões de margem:** validar fontes portuguesas, atualização e regras; não confundir médias com preços reais nem fixar a margem de 25 % usada como exemplo. Base: T1 §§11, 22–24.
- **M09 — Previsão de esgotamento de materiais:** validar registos de consumo e utilidade de intervalos estimados. Base: notas iniciais, «Visualizações».
- **M10 — Gráficos waterfall:** definir que valores mostram e que decisão ajudam a tomar; a nota menciona Power BI, mas não define integração nem caso de uso. Base: notas iniciais, «Visualizações».
- **M11 — Edição/importação/exportação avançada de mapas de medições e cronogramas financeiros:** confirmar exemplos, formatos e profundidade necessária antes de automatizar. Base: T1 §6; T2 §6.
- **M12 — Análise de padrões em contratos públicos:** ideia exploratória distinta da gestão pré-obra; validar dados, critérios e revisão humana. Vitórias repetidas não demonstram fraude. Base: T1 §§2, 25.

## Never

**Nenhuma exclusão definitiva do produto foi aprovada.** Não converter «fora do primeiro protótipo» em «Never». Este nível fica reservado a decisões explícitas futuras.

## Cobertura proposta do primeiro mockup

Prioridade de produto e representação no mockup são decisões distintas. A primeira versão demonstra todo o Now; Later e Maybe aparecem apenas num painel de âmbito, sem antecipar módulos funcionais.

- **Interativo — N01–N07:** perfil demonstrativo, filtros, mapa/lista, detalhe, prazos, convite e decisão de participar. Uma data de referência fixa mantém os exemplos de urgência coerentes.
- **Pré-visualização estática com controlo interativo — N08–N09:** peças/documentos fictícios; abrir exemplos e marcar obtenção/preparação ou simular anexação, sem ficheiros reais.
- **Interativo — N10:** preços unitários editáveis, subtotais e total; indicar preços em falta.
- **Pré-visualização estática com controlo interativo — N11:** cronograma financeiro ilustrativo; marcar preparado ou não exigido. Sem editor avançado.
- **Interativo — N12:** revisão do conjunto, omissões, regresso à preparação, estado pronto e submissão simulada. Incluir os estados «Não concorrer» e «Prazo ultrapassado sem submissão».
- **Estático — L01–L08 e M01–M12:** painel «Âmbito do produto» com nomes, prioridade e propósito; Maybe identifica a questão a validar. Sem ecrãs de gestão, gráficos inventados ou assistente que aparente funcionar.
- **Omitido:** execução funcional de Later/Maybe, integrações, persistência, dados pessoais/reais e ações externas. Never continua vazio; não criar exclusões definitivas para preencher o nível.

### Percurso e ecrãs

1. **Perfil da empresa** — N01.
2. **Oportunidades** — N02–N03, N05–N06; alternar mapa, lista e prazos.
3. **Detalhe do concurso/convite** — N04, N07–N08.
4. **Preparação da proposta** — N09–N11, com documentação, preços e cronograma financeiro.
5. **Revisão e submissão simulada** — N12; ponto final do percurso.
6. **Âmbito do produto** — resumo estático dos quatro níveis, separado do percurso principal.

O conjunto mínimo de exemplos cobre anúncio relevante, convite, pesquisa vazia, revisão de habilitação com informação em falta/incompatível, recusa, proposta incompleta, proposta pronta, prazo ultrapassado e submissão simulada. Deve ser possível regressar de «Pronta» a «Em preparação» e reiniciar a demonstração. Não implementar automaticamente regras jurídicas nem contagem de tempo real.

## Contrato do protótipo sem dados reais

- Usar apenas exemplos fictícios, pré-visualizações e estado local descartável. Nenhum backend, integração, conta externa ou dado real é necessário.
- Incluir só os exemplos suficientes para percorrer Now: anúncio relevante, convite, informação de habilitação em falta/incompatível, pesquisa vazia, proposta incompleta, prazo ultrapassado e proposta completa.
- Permitir demonstrar a sequência: definir empresa → encontrar oportunidade → analisar e decidir → reunir peças → preparar documentação/preços/cronograma exigido → rever → simular submissão.
- Manter mapa, lista e prazos consistentes com a oportunidade selecionada. Não apresentar resultados fictícios como dados atuais do governo.
- A submissão simulada é o ponto final. Não iniciar acompanhamento da adjudicação ou execução da obra.
- Os cálculos e avisos demonstrativos não constituem regras legais validadas. Confirmar campos, documentos, habilitações e regras de preço com o utilizador entrevistado antes da implementação real.

## Referências

- **Diagramas Now:** [entidades](transcricao_2_now_diagrama-de-entidades.mermaid), [fluxo de trabalho](transcricao_2_now_diagrama-do-fluxo-de-trabalho-do-derlan.mermaid), [estados](<transcricao_2_now_concurso-público-diagrama de estados.mermaid>) e [percurso principal](transcricao_2_now_percurso-mais-importante-diagrama-de-entidades.mermaid). Fixam o limite do Now.
- **T1/T2:** secções numeradas das transcrições de trabalho; os originais não estão incluídos neste PR.
- **Contexto adicional:** ideia inicial, mapeamento de plataformas e notas visuais de trabalho; os ficheiros de origem não estão incluídos neste PR.

As decisões desta conversa prevalecem sobre classificações anteriores deste documento. Os diagramas históricos permanecem intactos.

## Pontos de validação prioritários

1. Confirmar esta lista Now com o utilizador entrevistado e obter um exemplo anonimizado do conjunto de documentos, mapa e cronograma de uma proposta.
2. Confirmar se a pesquisa por filtros chega para o primeiro protótipo ou se a consulta em linguagem natural tem de passar de Maybe para Now.
3. Confirmar se o cronograma financeiro basta como componente assinalada/pré-visualizada ou precisa de edição no primeiro protótipo.
4. Verificar APIs, habilitações e fontes de dados numa tarefa separada; as entrevistas relatam possibilidades, não demonstram disponibilidade nem cobertura técnica.
