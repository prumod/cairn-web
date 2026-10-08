# Cairn — contrato do protótipo interativo

## Objetivo e estatuto

Representar a experiência completa do utilizador antes de implementar o backend. O protótipo interativo permite rever o que cada pessoa vê, introduz, altera e faz, e usar essa experiência para compreender abstrações, responsabilidades e estruturas de dados futuras. Ecrãs e tipos de frontend não se convertem automaticamente em tabelas de base de dados.

Este documento regista o âmbito acordado; não afirma que o protótipo já existe. A implementação é trabalho separado. React no Vite existente é a abordagem recomendada, não uma arquitetura de backend aprovada.

## Cobertura e prioridades

- Cobrir todas as funcionalidades documentadas em [Now](../now/funcionalidades.md), [Later](../later/funcionalidades.md) e [Maybe](../maybe/funcionalidades.md): N01–N10 e N12, L01–L09 e M01–M12.
- [Never](../never/funcionalidades.md) permanece vazio; não inventar exclusões nem ecrãs para preencher este nível.
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

Evoluir a mesma implementação, sem manter versões paralelas obrigatórias de wireframe e mockup. O histórico fica no Git. A passagem à fase visual deve partir da revisão dos percursos, informação, interações e estados; não significa que a UX fique fechada.

### Fase de wireframe — estrutura e comportamento

Usar elementos HTML semânticos e a apresentação nativa do browser, sem CSS de apresentação, estilos inline, biblioteca visual ou trabalho de identidade gráfica. Esta restrição aplica-se apenas à fase inicial. O objetivo é rever como as tarefas funcionam, não aprovar a aparência. Rótulos, associação entre campos, foco por teclado e estrutura legível continuam necessários.

«Sem estilos» não significa ausência de representação visual. Mapas, cronogramas e gráficos podem usar a geometria e os atributos gráficos mínimos necessários para representar informação e permitir interação, sem decoração nem trabalho de identidade gráfica. A tecnologia usada não fica definida por esta regra.

Mapas, Gantt e outras visualizações devem representar a interação e a informação necessárias, sem polimento visual nem serviços externos. Não substituir automaticamente uma experiência visual relevante por uma tabela sem revisão.

### Fase de design visual — aproximação à produção

Refinar o protótipo interativo para se aproximar da aparência pretendida em produção: layout, hierarquia, tipografia, cores, espaçamento, componentes, estados visuais e comportamento responsivo. CSS e estilos de apresentação passam a ser permitidos; a escolha de ferramentas não está decidida por este documento.

Rever também a UX quando o design visual revelar problemas: reorganizar conteúdo, controlos ou percursos quando necessário, sem perder a cobertura acordada. Mockups podem ajudar a explorar alternativas, mas o resultado deve estar integrado no mesmo protótipo interativo.

Manter semântica, operação por teclado, foco visível, contraste adequado e estados compreensíveis; não depender apenas de cor para transmitir informação. Aparência próxima de produção não comprova prontidão para produção nem autoriza dados reais, backend ou integrações.

## Sem dados reais nem efeitos externos

Estes limites aplicam-se a ambas as fases, mesmo quando a interface se aproximar da produção.

- Usar exemplos fictícios coerentes, pré-visualizações incluídas na demonstração e estado local descartável. Sem backend, base de dados, autenticação externa ou persistência de produção.
- Simular localmente os resultados de pesquisa, sugestões de IA, importações, documentos, e-mails, integrações e restantes ações externas. Não consultar DR, BASE, IMPIC, fornecedores, mapas, ERP ou plataformas reais.
- Não recolher dados pessoais, ler caixas de correio, carregar documentos reais, enviar mensagens, comprar selos, assinar documentos, efetuar pagamentos ou submeter propostas.
- Distinguir claramente a demonstração de uma operação real, sem expor a classificação de prioridades. Uma confirmação de submissão deve indicar que nada foi enviado.
- Disponibilizar reinício da demonstração. Exemplos de datas e estados devem ser determinísticos, sem depender de prazos ou avisos de produção.
- Cálculos e validações demonstrativos não são regras jurídicas ou contabilísticas aprovadas. Incertezas devem ficar documentadas, não escondidas em automatismos.

## Percursos a representar

### Descoberta e proposta

Perfil da empresa → anúncios ou convites → mapa/lista/prazos → detalhe e revisão de requisitos → decisão de participar ou não → peças e checklist → preços unitários e total → revisão → submissão simulada. Incluir pesquisa vazia, informação de habilitação em falta/incompatível, recusa, preparação incompleta, regresso à preparação, proposta pronta e prazo ultrapassado.

Este é o percurso Now, não o limite do protótipo completo. A submissão simulada pode alimentar os exemplos de acompanhamento posterior.

### Preparação adicional da proposta — Later

O cronograma financeiro, quando exigido, pertence a Later L09. Demonstrar períodos, percentagens, valores e indicação de preparação quando se trabalhar essa prioridade. Não o implementar na fase Now nem usá-lo como condição de prontidão ou submissão simulada nesse percurso. Esta alteração de prioridade não redefine os requisitos de entrega de um concurso real.

### Gestão e acompanhamento

Demonstrar fornecedores/cotações, registos de obras/clientes, acompanhamento pós-submissão, funcionários/mão de obra/equipamento, materiais/stock, finanças por obra, progresso e pós-obra. Preservar as distinções entre faturado e recebido, preparação e habilitação pós-adjudicação, execução e garantia, e receção provisória e definitiva.

### Capacidades a validar

Demonstrar as experiências propostas em Maybe: planeamento tipo Project/Gantt, pesquisa assistida, análise de concorrentes, perguntas sobre finanças, pesquisa de fornecedores por IA, extração de cotações, histórico/validade de preços, referências/margens, previsão de materiais, waterfall, edição/importação/exportação avançada e padrões de contratos públicos. Resultados são fictícios; não demonstram fraude, cobertura de fontes, previsões reais ou respostas de IA verificadas.

## Revisão e aprendizagem para o backend

Durante a revisão, identificar informação necessária, relações entre conceitos, ações do utilizador, condições de transição, falhas e regras por confirmar. Registar decisões de domínio à medida que a experiência é validada. Não fixar desde já interfaces, tabelas ou módulos de produção apenas para reproduzir os ecrãs.

A verificação futura deve:

- Em ambas as fases, percorrer todas as funcionalidades, confirmar a coerência dos exemplos e estados, a ausência de etiquetas de prioridade, o reinício e a inexistência de chamadas ou efeitos externos.
- Na fase de wireframe, confirmar a apresentação nativa sem estilos e rever estrutura, tarefas, navegação, validações e recuperação.
- Na fase de design visual, rever a aproximação à aparência pretendida para produção, consistência da UI, adaptação a tamanhos de ecrã, acessibilidade e eventuais alterações de UX. Repetir a revisão funcional após essas alterações.

Uma build bem-sucedida, por si só, não prova uma experiência completa nem valida a UX/UI.
