# Cairn — funcionalidades Now

## Fontes e estatuto

As prioridades foram acordadas com o utilizador; não constituem aprovação do entrevistado nem validação técnica ou jurídica. T1 e T2 referem-se às secções das [transcrições](../transcriptions/): [T1](../transcriptions/transcricao1_gestao_obras.md) e [T2](../transcriptions/transcricao2_gestao_obras.txt). Contexto adicional: [ideia inicial](../system/ideia_inicial.txt) e [notas visuais](<../transcriptions/transcricao1_Notas Iniciais Projeto.jpeg>).

Consultar as [definições de prioridade](../README.md) e o [contrato do protótipo interativo](../system/prototype.md). A prioridade de produção não limita a cobertura do protótipo: Now, Later e Maybe são demonstrados primeiro como wireframe sem estilos e depois com UI próxima da produção, sempre com dados fictícios e ações simuladas. Os limites abaixo descrevem cada prioridade; não impedem demonstrar capacidades de outros níveis no mesmo protótipo.

## Funcionalidades

As referências T1 e T2 indicam as secções numeradas das transcrições 1 e 2. O comportamento de interface abaixo é uma proposta derivada das necessidades descritas, não uma interface especificada nas entrevistas. O percurso Now termina na submissão simulada; o protótipo completo continua nas funcionalidades Later e Maybe.

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
