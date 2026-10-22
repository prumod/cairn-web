# Cairn — funcionalidades Now

## Fontes e estatuto

As prioridades foram acordadas com o utilizador; não constituem aprovação do entrevistado nem validação técnica ou jurídica. T1, T2 e T3 referem-se às [transcrições](../transcriptions/): [T1](../transcriptions/transcricao1_gestao_obras.md), [T2](../transcriptions/transcricao2_gestao_obras.txt) e [T3](../transcriptions/transcricao_3_gestao_obras.txt). T1 e T2 citam secções numeradas; T3 cita instantes da gravação (`[hh:mm:ss]`). Contexto adicional: [ideia inicial](../system/ideia_inicial.txt) e [notas visuais](<../transcriptions/transcricao1_Notas Iniciais Projeto.jpeg>).

Consultar as [definições de prioridade](../README.md) e o [contrato do protótipo interativo](../system/prototype.md). A prioridade de produção não limita a cobertura do protótipo: Now, Later e Maybe são demonstrados primeiro como wireframe sem estilos e depois com UI próxima da produção, sempre com dados fictícios e ações simuladas. Os limites abaixo descrevem cada prioridade; não impedem demonstrar capacidades de outros níveis no mesmo protótipo.

## Âmbito decidido na T3

No fim da T3, o quadro branco lista «1. Mapa», «2. Chatbot», «3. Concurso View», «4. Filtros», «5. Dossier (Later)» e «6. Navegação (Later)» (T3 [01:26:42]–[01:28:55]). O foco passa a ser a descoberta de obras no Diário da República; a interação com AcinGov/Vortal fica para o fim (T3 [00:32:04]–[00:32:26]). Por isso, Now termina na consulta do concurso. A decisão de participar, o dossier, a checklist, os preços e a passagem à plataforma passaram para [Later](../later/funcionalidades.md) (L10–L16). A correspondência de identificadores está no [README](../README.md#correspondência-de-identificadores).

## Ordem por simplicidade de implementação e compreensão

Estimativa para versões demonstrativas com dados fictícios e ações locais, sem integrações reais. Não representa a ordem cronológica do trabalho nem altera os identificadores das funcionalidades.

1. **N04 — Consultar o concurso.**
2. **N01 — Definir a referência da empresa.** Guardar alvará/classe não equivale a verificar habilitações.
3. **N02 — Encontrar anúncios de obras por data e raio.**
4. **N14 — Filtrar e priorizar oportunidades.** A classificação por tipo de obra exige um classificador; na demonstração, os tipos são fixos.
5. **N03 — Explorar oportunidades no mapa.**
6. **N13 — Conversar com o assistente sobre as oportunidades.** As respostas são simuladas.

## Funcionalidades

O comportamento de interface abaixo é uma proposta derivada das necessidades descritas, não uma interface especificada nas entrevistas.

### N01 — Definir a referência da empresa

- **Objetivo:** pesquisar a partir da localização da empresa e ter presentes as suas habilitações.
- **Protótipo:** um perfil demonstrativo, só de leitura, mostra o nome, a localização, o raio de pesquisa, a classe e as categorias prioritárias de obra. Estes dados alimentam a pesquisa, o mapa e os filtros, sem consulta real ao IMPIC. O protótipo não permite editar o perfil nem mostra o alvará da empresa.
- **Base:** T2 §§4, 7, 9; T3 [00:01:51]–[00:02:16], [00:07:52], [00:30:16]–[00:30:45], [01:07:50]–[01:08:32].
- **Limite:** o raio é configurado uma vez por empresa (por exemplo, 30 ou 50 km) e raramente muda; o centro é a empresa. Não fixar limites monetários por classe nem garantir elegibilidade jurídica; os valores das conversas são aproximados.

### N02 — Encontrar anúncios de obras por data e raio

- **Objetivo:** reduzir a leitura individual das páginas de anúncios diários do Diário da República.
- **Protótipo:** escolher data de publicação; mostrar apenas anúncios de obras dentro do raio da empresa num pequeno conjunto fictício e abrir um resultado. Incluir um dia sem anúncios.
- **Base:** T1 §5.1; T2 §§2, 4, 7; T3 [00:08:43]–[00:09:13], [00:24:06]–[00:25:43], [01:05:39]–[01:06:04].
- **Limite:** sem recolha real, API, scraping ou cálculo geográfico de produção. Por predefinição, só entram anúncios classificados como obras; outros contratos (por exemplo, refeições escolares ou transportes) ficam fora. A existência e as condições de uma API gratuita do Diário da República estão por verificar.

### N03 — Explorar oportunidades no mapa

- **Objetivo:** perceber onde estão as obras abertas e escolher uma localidade.
- **Protótipo:** a tabela de todas as obras dentro do raio é a vista principal. O filtro de localidade abre um popover com o mapa, que assinala a localização da empresa e o raio, ou, conforme as Opções, uma lista de caixas. Aplicar as localidades escolhidas filtra a tabela; abrir uma obra abre N04.
- **Base:** T2 §§1, 4, 7, 22; T3 [00:23:07]–[00:24:29], [01:15:33]–[01:16:27], [01:17:45]–[01:18:00], [01:20:29]–[01:21:38].
- **Limite:** dados e posições demonstrativos; não depende de um serviço de mapas em produção. Sem trajetos nem distritos ([Never X01–X02](../never/funcionalidades.md)). O que o tamanho dos marcadores representa (valor, número de concursos ou urgência) está por decidir. Uma vista agrupada por fases fica em Later L18.

### N04 — Consultar o concurso

- **Objetivo:** decidir se vale a pena analisar a participação.
- **Protótipo:** a vista do concurso mostra entidade adjudicante, descrição do trabalho, valor da obra (valor anunciado), localização, prazo de execução, data/hora limite de entrega quando conhecida, alvará exigido (categoria/subcategoria e classe) e plataforma indicada. Permitir consultar o anúncio de origem, representado por uma pré-visualização demonstrativa.
- **Base:** T1 §§5.3, 6, 8; T2 §§5, 6, 14; T3 [00:28:51]–[00:32:04], [01:21:00].
- **Limite:** distinguir valor da obra de custo da empresa e de valor proposto, e prazo de execução de prazo de submissão. A T3 indica que o prazo de submissão está na plataforma e não no Diário da República; confirmar antes de exigir este campo. Mostrar o alvará exigido não é verificação de elegibilidade (Later L12).

### N13 — Conversar com o assistente sobre as oportunidades

- **Objetivo:** pesquisar e consultar oportunidades por linguagem natural sem configurar muitos controlos.
- **Protótipo:** chat ao lado da tabela, com pedidos sugeridos como «Mostra obras até 30 km» e «Quais os 2 prazos mais urgentes?». Os comentários sobre obras e localidades e as citações definem o contexto da conversa; as obras apenas selecionadas não. O assistente aplica filtros N14 e mostra, abre e compara concursos. Cada resposta é texto com as ferramentas usadas; conforme as Opções, os resultados aparecem também no chat, como lista com ligações para os concursos, mapa pequeno ou ambos.
- **Base:** T2 §§1, 4, 7, 19; T3 [00:04:26], [00:07:19]–[00:07:52], [00:09:42]–[00:10:03], [00:15:49]–[00:16:19], [00:41:03]–[00:41:28], [01:10:02]–[01:10:13], [01:28:08]. Antes Maybe M02.
- **Limite:** respostas simuladas e verificáveis contra os dados mostrados; usar um modelo existente por API, sem treino próprio (T3 [00:11:06]). A T3 pede avaliações da qualidade das respostas antes de confiar no assistente (T3 [00:17:30]–[00:18:15]). Navegar pela aplicação em nome do utilizador fica em Later L17.

### N14 — Filtrar e priorizar oportunidades

- **Objetivo:** reduzir as oportunidades às que interessam à empresa.
- **Protótipo:** filtrar por localidade, distância, data de publicação, valor, entidade adjudicante e tipo de obra. Não há filtro de prazo; o assistente ordena por prazo de entrega. As obras das categorias prioritárias do perfil N01 têm a marca «★ prioridade»; a tabela agrupa as obras por localidade, e o contador e o assistente põem as prioritárias primeiro. Os mesmos filtros aplicam-se ao mapa e à tabela.
- **Base:** T3 [00:10:17]–[00:10:38], [00:43:19]–[00:44:01], [01:03:23]–[01:04:44], [01:06:57]–[01:08:32], [01:30:40].
- **Limite:** o Diário da República não fornece categorias de obra; o tipo exige classificação automática. Na demonstração, os tipos são fixos. Prioridade ordena ou destaca; não exclui. Não ocultar automaticamente oportunidades pelo valor ou pela classe ([Never X03](../never/funcionalidades.md)).
