# Cairn — contrato do protótipo interativo

## Objetivo e estatuto

Representar a experiência completa do utilizador antes de implementar o backend. O protótipo interativo permite rever o que cada pessoa vê, introduz, altera e faz, e usar essa experiência para compreender abstrações, responsabilidades e estruturas de dados futuras. Ecrãs e tipos de frontend não se convertem automaticamente em tabelas de base de dados.

Este documento regista o âmbito acordado e as regras das duas implementações abaixo. React no Vite existente é a abordagem recomendada, não uma arquitetura de backend aprovada.

## Duas implementações

- **Wireframe interativo** ([`apps/web/references/interactive-wireframe.tsx`](../../../apps/web/references/interactive-wireframe.tsx)): mostra o futuro, isto é, as funcionalidades que ainda não têm protótipo principal. Serve para ver como essas funcionalidades se ligam e que informação as interações precisam.
- **Protótipo principal** ([`apps/web/references/prototype-discovery/`](../../../apps/web/references/prototype-discovery/)): mostra a experiência das funcionalidades em decisão agora. Hoje cobre as funcionalidades Now. Fica fora da aplicação, sem sessão nem backend; corre com `bun run --cwd apps/web prototype`.

Cada funcionalidade está numa só implementação. Quando uma funcionalidade ganha protótipo principal, a sua parte é apagada do wireframe; não se mantêm as duas versões. As prioridades e os identificadores não mudam por isso. O [mapa de cobertura](prototype-coverage.md) indica onde está cada funcionalidade.

## Cobertura e prioridades

- Cobrir todas as funcionalidades documentadas em [Now](../now/funcionalidades.md), [Later](../later/funcionalidades.md) e [Maybe](../maybe/funcionalidades.md). A lista atual, com o estado de cada funcionalidade, está em [prototype-coverage.md](prototype-coverage.md).
- Não criar ecrãs para as exclusões de [Never](../never/funcionalidades.md) nem inventar outras.
- Representar a experiência completa: ecrãs, navegação, campos, controlos, interações, validações, alterações de estado, resultados vazios, informação em falta, erros e correção/regresso quando aplicáveis.
- Later e Maybe não se limitam a um painel estático de âmbito. Devem demonstrar as respetivas experiências; isso não altera a prioridade nem confirma viabilidade técnica, valor ou regras de negócio.
- Não mostrar etiquetas, separadores ou navegação Now/Later/Maybe/Never no frontend. A navegação deve seguir os conceitos e tarefas do utilizador.
- Manter a classificação rastreável em documentação, código ou comentários. Não é necessário dividir o código em quatro árvores de pastas; a rastreabilidade não deve ditar abstrações prematuras.

## Terminologia

- **Protótipo interativo:** demonstração navegável com comportamento simulado. É o nome do trabalho completo, desde a estrutura sem estilos até à aproximação visual à produção.
- **Wireframe:** representação da estrutura, conteúdo, navegação, campos e estados. Neste projeto, corresponde à fase inicial sem estilos do protótipo.
- **Mockup:** representação da aparência proposta — layout, tipografia, cores, espaçamento e componentes — normalmente estática. Pode apoiar decisões visuais, mas não substitui a demonstração interativa dos percursos.
- **UX (User Experience / experiência do utilizador):** compreensão e realização das tarefas, incluindo navegação, feedback, acessibilidade e recuperação de erros.
- **UI (User Interface / interface do utilizador):** controlos, layout e apresentação visual com que a pessoa interage. As decisões de UI também afetam a UX; não são fases independentes nem sinónimos de mockup e wireframe.

## Evolução do protótipo

Cada funcionalidade passa do wireframe para o protótipo principal; dentro de cada implementação, evolui-se o mesmo código, sem versões paralelas de wireframe e mockup. O histórico fica no Git. As fases abaixo orientam esse trabalho. O protótipo principal pode começar já com estilos quando a interação a explorar depende deles (por exemplo, a seleção no mapa). A passagem à fase visual deve partir da revisão dos percursos, informação, interações e estados; não significa que a UX fique fechada.

### Fase de wireframe — estrutura e comportamento

Usar elementos HTML semânticos e a apresentação nativa do browser, sem CSS de apresentação, estilos inline, biblioteca visual ou trabalho de identidade gráfica. Esta restrição aplica-se apenas à fase inicial. O objetivo é rever como as tarefas funcionam, não aprovar a aparência. Rótulos, associação entre campos, foco por teclado e estrutura legível continuam necessários.

«Sem estilos» não significa ausência de representação visual. Mapas, cronogramas e gráficos podem usar a geometria e os atributos gráficos mínimos necessários para representar informação e permitir interação, sem decoração nem trabalho de identidade gráfica. A tecnologia usada não fica definida por esta regra.

Mapas, Gantt e outras visualizações devem representar a interação e a informação necessárias, sem polimento visual nem serviços externos. Não substituir automaticamente uma experiência visual relevante por uma tabela sem revisão.

### Fase de design visual — aproximação à produção

Refinar o protótipo interativo para se aproximar da aparência pretendida em produção: layout, hierarquia, tipografia, cores, espaçamento, componentes, estados visuais e comportamento responsivo. CSS e estilos de apresentação passam a ser permitidos; a escolha de ferramentas não está decidida por este documento.

Rever também a UX quando o design visual revelar problemas: reorganizar conteúdo, controlos ou percursos quando necessário, sem perder a cobertura acordada. Mockups podem ajudar a explorar alternativas, mas o resultado deve estar integrado no mesmo protótipo interativo.

Manter semântica, operação por teclado, foco visível, contraste adequado e estados compreensíveis; não depender apenas de cor para transmitir informação. Aparência próxima de produção não comprova prontidão para produção nem autoriza dados reais, backend ou integrações.

## Sem dados reais nem efeitos externos

Estes limites aplicam-se a ambas as implementações e a ambas as fases, mesmo quando a interface se aproximar da produção.

- Usar exemplos fictícios coerentes, pré-visualizações incluídas na demonstração e estado local descartável. Sem backend, base de dados, autenticação externa ou persistência de produção.
- Simular localmente os resultados de pesquisa, sugestões de IA, importações, documentos, e-mails, integrações e restantes ações externas. Não consultar DR, BASE, IMPIC, fornecedores, mapas, ERP ou plataformas reais.
- Não recolher dados pessoais, ler caixas de correio, carregar documentos reais, enviar mensagens, comprar selos, assinar documentos, efetuar pagamentos ou submeter propostas.
- Distinguir claramente a demonstração de uma operação real, sem expor a classificação de prioridades. Uma confirmação de submissão deve indicar que nada foi enviado.
- Disponibilizar reinício da demonstração. Exemplos de datas e estados devem ser determinísticos, sem depender de prazos ou avisos de produção.
- Cálculos e validações demonstrativos não são regras jurídicas ou contabilísticas aprovadas. Incertezas devem ficar documentadas, não escondidas em automatismos.

## Percursos a representar

### Descoberta e proposta

Now: perfil da empresa → anúncios de obras do dia → mapa com o raio e filtros → localidade → lista de obras → vista do concurso, com o assistente ao lado do mapa. Incluir um dia sem anúncios, filtros sem resultados e um pedido ao assistente sobre um ou vários concursos selecionados.

A seleção de obras limita-se às obras presentes na lista atual. Fechar a lista, abrir outra localidade ou alterar filtros remove da seleção as obras que deixem de ser mostradas. A seleção de localidades e os comentários já preparados no assistente mantêm-se.

Later continua o percurso: convites, prazos, revisão de requisitos e decisão de participar → dossier e checklist → preços unitários e total → revisão → submissão simulada, mais a navegação pelo assistente e a vista por fases. Incluir informação de habilitação em falta/incompatível, recusa, preparação incompleta, regresso à preparação, proposta pronta e prazo ultrapassado. A submissão simulada pode alimentar os exemplos de acompanhamento posterior.

### Opções do agente

O cabeçalho tem um painel «⚙ Opções» (fecha com Escape ou clique fora) com duas escolhas, que se mantêm ao reiniciar a demonstração:

- **Resultados do agente — «No chat»:** desligado por omissão, os resultados aparecem só no mapa. Ligado, aparecem no mapa e também no chat.
- **Ações do agente:** «Imediatas» (por omissão) alteram o mapa logo; «Com proposta» alteram o mapa só depois de «Aplicar no mapa», e uma proposta pendente fica rejeitada quando a pessoa envia outro pedido.

A conversa fica sempre ao lado do mapa. Não há seletor de variações.

### Seleção por retângulo na lista de obras

Na tabela de obras, arrastar a partir de qualquer espaço vazio do painel de obras (incluindo as margens laterais) ou das margens interiores de uma linha inicia um retângulo de seleção. Arrastar sobre texto citável continua a selecionar texto para citação; controlos, cabeçalhos, o título, a barra de seleção e o texto de ajuda do painel não iniciam o retângulo e o seu texto seleciona-se normalmente. Sem obras na lista, a mensagem é texto simples: não inicia retângulo, não limpa a seleção ao clique e não abre o menu de contexto de seleção.

As linhas intercetadas pelo retângulo apresentam uma pré-visualização da seleção. Sem modificador, o arrasto substitui a seleção de obras; Shift acrescenta obras; Ctrl/Meta alterna as obras intercetadas relativamente à seleção existente no início do arrasto.

Ao largar, a seleção fica aplicada e é oferecido um comentário para as unidades recém-selecionadas, sem abrir obras nem enviar mensagens. Escape ou cancelamento do gesto pelo dispositivo preserva a seleção original. A interação mantém a analogia de obras como ficheiros e localidades como pastas para selecionar e abrir, sem mover ficheiros, e preserva clique, duplo clique, menu de contexto e atalhos de teclado.

No mapa, a seleção por retângulo segue o mesmo gesto e o mesmo aspeto da lista: o cursor é o normal ao passar sobre o mapa e passa a cruz apenas durante o arrasto; o retângulo tracejado, a pré-visualização, Shift, Ctrl/Meta e Escape comportam-se como na lista.

Ao guardar um comentário sobre localidades ou obras, o que foi comentado deixa de estar selecionado. Na lista de comentários preparados no assistente, cada comentário tem dois botões: ✕ apaga-o e ↩ («Descomentar») retira-o e volta a selecionar as localidades e as obras a que se referia, abrindo de novo as localidades dessas obras para que continuem na lista. O texto do comentário perde-se.

Ações que descartam unidades pedem confirmação num diálogo modal («Tem a certeza?»), com «Cancelar» em foco e a ação destrutiva a vermelho. O limiar depende do esforço investido: só selecionadas, a partir de 10 unidades; num comentário guardado sem texto, a partir de 3; num comentário com texto escrito, sempre (valores de protótipo, pois há poucas obras nos dados; localidades e obras contam-se somadas). Aplica-se a: limpar a seleção (botão «Desselecionar tudo» na barra de seleção, que limpa localidades e obras; clique no vazio, Escape, menu «Limpar seleção», desmarcar a lista inteira, arrastar um retângulo que apenas desseleciona), fechar a lista com obras selecionadas, apagar um comentário e descomentar. «Limpar tudo» nos itens para enviar pede sempre confirmação. Abaixo do limiar, a ação executa-se logo. Substituir a seleção por outra não pede confirmação.

### Seleção por teclado no mapa e na lista

Os atalhos atuam na região com foco e não interferem com a escrita em campos de texto. Ctrl/⌘+A funciona também quando o foco está na página, depois de clicar no vazio: atua na última zona usada (mapa ou lista de obras) e nunca seleciona o texto da página nessas zonas. Estão disponíveis:

- **Mapa:** Tab percorre os marcadores; Espaço alterna a seleção do marcador com foco; Enter abre as localidades selecionadas ou, sem seleção, a localidade do marcador com foco. Escape fecha primeiro os elementos sobrepostos e depois limpa apenas a seleção do mapa. Ctrl+A seleciona todas as localidades; Shift+F10 abre o menu de contexto.
- **Lista de obras:** Cima/Baixo move o foco e substitui a seleção; Espaço alterna a seleção da obra com foco; Shift+Cima/Baixo seleciona um intervalo; Ctrl+A seleciona todas as obras visíveis; Home/End selecionam a primeira e a última obra (com Shift, estendem a seleção); Ctrl+Cima/Baixo/Home/End movem apenas o foco. Enter abre a obra selecionada ou compara as obras selecionadas; Escape limpa apenas a seleção de obras; Shift+F10 abre o menu de contexto.

### Preparação adicional da proposta — Later

O cronograma financeiro, quando exigido, pertence a Later L09. Demonstrar períodos, percentagens, valores e indicação de preparação quando se trabalhar essa prioridade. Não o usar como condição de prontidão ou submissão simulada (L16). Esta alteração de prioridade não redefine os requisitos de entrega de um concurso real.

### Gestão e acompanhamento

Demonstrar fornecedores/cotações, registos de obras/clientes, acompanhamento pós-submissão, funcionários/mão de obra/equipamento, materiais/stock, finanças por obra, progresso e pós-obra. Preservar as distinções entre faturado e recebido, preparação e habilitação pós-adjudicação, execução e garantia, e receção provisória e definitiva.

### Capacidades a validar

Demonstrar as experiências propostas em Maybe: planeamento tipo Project/Gantt, análise de concorrentes, mapa 3D, caixa de entrada de anúncios, conversas por fase, perguntas sobre finanças, pesquisa de fornecedores por IA, extração de cotações, histórico/validade de preços, referências/margens, previsão de materiais, waterfall, edição/importação/exportação avançada e padrões de contratos públicos. Resultados são fictícios; não demonstram fraude, cobertura de fontes, previsões reais ou respostas de IA verificadas.

## Revisão e aprendizagem para o backend

Durante a revisão, identificar informação necessária, relações entre conceitos, ações do utilizador, condições de transição, falhas e regras por confirmar. Registar decisões de domínio à medida que a experiência é validada. Não fixar desde já interfaces, tabelas ou módulos de produção apenas para reproduzir os ecrãs.

A verificação futura deve:

- Em ambas as fases, percorrer todas as funcionalidades, confirmar a coerência dos exemplos e estados, a ausência de etiquetas de prioridade, o reinício e a inexistência de chamadas ou efeitos externos.
- Na fase de wireframe, confirmar a apresentação nativa sem estilos e rever estrutura, tarefas, navegação, validações e recuperação.
- Na fase de design visual, rever a aproximação à aparência pretendida para produção, consistência da UI, adaptação a tamanhos de ecrã, acessibilidade e eventuais alterações de UX. Repetir a revisão funcional após essas alterações.

Uma build bem-sucedida, por si só, não prova uma experiência completa nem valida a UX/UI.
