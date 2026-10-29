# Cairn — método de evolução e contrato do protótipo interativo

## Objetivo e estatuto

Representar a experiência completa do utilizador antes de implementar o backend e, depois, replicá-la exatamente num frontend de produção. O protótipo interativo permite rever o que cada pessoa vê, introduz, altera e faz, e usar essa experiência para compreender abstrações, responsabilidades e estruturas de dados futuras. Ecrãs e tipos de frontend não se convertem automaticamente em tabelas de base de dados.

Este documento regista o âmbito acordado, o método de evolução e as regras de cada estado. React no Vite existente é a abordagem recomendada, não uma arquitetura de backend aprovada.

## Método de evolução

O wireframe interativo mostra só as funcionalidades de [Later](../later/funcionalidades.md) e [Maybe](../maybe/funcionalidades.md). As funcionalidades de [Now](https://github.com/prumod/cairn-web/issues/104) evoluem por estados, do protótipo de UX à produção. O nome da pasta ou do ficheiro diz em que estado está a funcionalidade.

| Estado                        | Onde                                                                                                      | Funcionalidades | Passa ao estado seguinte quando                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| Wireframe interativo          | [`apps/web/references/interactive-wireframe.tsx`](../../../apps/web/references/interactive-wireframe.tsx) | Later e Maybe   | A funcionalidade passa a Now: a sua parte sai do wireframe e começa em `ux-prototype/`. |
| `ux-prototype` (apagado)      | Apagado. A última versão está no histórico do Git, em `apps/web/references/prototype-discovery/`.         | Now             | Passou diretamente a `final-visual`.                                                    |
| `ui-prototype` (saltado)      | Nunca criada.                                                                                             | —               | —                                                                                       |
| `final-visual` (estado atual) | [`apps/web/references/final-visual/`](../../../apps/web/references/final-visual/)                         | Now             | A aparência final está aprovada.                                                        |
| Produção (próximo passo)      | `apps/web/src/`                                                                                           | Now             | —                                                                                       |

Regras:

- **Evoluir é substituir.** Quando uma funcionalidade passa ao estado seguinte, a versão anterior é apagada na mesma alteração. Só existe a pasta do estado atual; o histórico fica no Git. Evolui-se a partir da versão anterior, não em paralelo.
- **Uma funcionalidade, um estado.** Cada funcionalidade está num só estado. O [mapa de cobertura](prototype-coverage.md) indica onde está cada uma.
- **Um estado pode ser saltado** quando a pessoa que revê o decide. A pasta do estado saltado nunca chega a existir.
- As prioridades e os identificadores não mudam por a funcionalidade mudar de estado.
- **A especificação final é uma issue; a não final é um ficheiro.** O PRD é uma GitHub Issue: o de Now é a [issue #104](https://github.com/prumod/cairn-web/issues/104), que substituiu `now/funcionalidades.md`, já apagado. As funcionalidades ainda não finais ficam em `docs/product/{later,maybe,never}/funcionalidades.md`. Quando uma funcionalidade de Later ou Maybe ganha PRD, a sua entrada é apagada do ficheiro.

### Wireframe interativo — Later e Maybe

Usar elementos HTML semânticos e a apresentação nativa do browser, sem CSS de apresentação, estilos inline, biblioteca visual ou trabalho de identidade gráfica. O objetivo é ver como as funcionalidades futuras se ligam e que informação as interações precisam, não aprovar a aparência. Rótulos, associação entre campos, foco por teclado e estrutura legível continuam necessários.

«Sem estilos» não significa ausência de representação visual. Mapas, cronogramas e gráficos podem usar a geometria e os atributos gráficos mínimos necessários para representar informação e permitir interação, sem decoração nem trabalho de identidade gráfica. A tecnologia usada não fica definida por esta regra.

Mapas, Gantt e outras visualizações devem representar a interação e a informação necessárias, sem polimento visual nem serviços externos. Não substituir automaticamente uma experiência visual relevante por uma tabela sem revisão.

### `ux-prototype` — estrutura e comportamento

Em Now este estado foi concluído e a pasta foi apagada; a última versão está no histórico do Git. As regras de estrutura e comportamento continuam a valer quando uma funcionalidade nova começa: rever ecrãs, navegação, campos, controlos, interações, validações, alterações de estado, resultados vazios, informação em falta e correção de erros. Não se aprova a aparência. Pode ter estilos quando a interação a explorar depende deles. Rótulos, associação entre campos, foco por teclado e estrutura legível continuam necessários.

### `ui-prototype` — interface

Em Now, este estado foi saltado: a funcionalidade passou de `ux-prototype` diretamente a `final-visual`. Refinar o estado anterior até uma interface completa: layout, hierarquia, controlos, componentes, estados visuais e comportamento responsivo. CSS e estilos de apresentação são permitidos; a escolha de ferramentas não está decidida por este documento. A passagem parte da revisão dos percursos, informação, interações e estados. Rever também a UX quando a interface revelar problemas, sem perder a cobertura acordada.

### `final-visual` — aparência final

Fixar a aparência final: tipografia, cores, espaçamento, componentes, estados visuais e comportamento responsivo, de modo que a produção a possa replicar sem decisões visuais novas. Mockups e outras ferramentas podem apoiar a exploração, mas o resultado fica na pasta `final-visual/`, não em ficheiros paralelos. Mantém dados fictícios e ações simuladas.

Em todos os estados com interface, manter semântica, operação por teclado, foco visível, contraste adequado e estados compreensíveis; não depender apenas de cor para transmitir informação. Aparência final não comprova prontidão para produção nem autoriza dados reais, backend ou integrações.

### Produção — réplica exata do `final-visual`

O `final-visual/` é a especificação visual da produção. O frontend de produção, em `apps/web/src/`, replica-o exatamente (layout, hierarquia, tipografia, cores, espaçamento, componentes, estados e comportamento responsivo) e usa os serviços de backend de produção em vez de dados fictícios e ações simuladas. Segue a arquitetura e as convenções do repositório. Quando a produção replica o `final-visual/`, esta pasta é apagada e a produção passa a ser a fonte de verdade.

Enquanto não houver implementação de produção, a pasta do estado atual de Now é a fonte de verdade do seu comportamento, e os documentos que divergem dela são atualizados. O `final-visual/` é um único ficheiro HTML, sem sessão nem backend.

## Cobertura e prioridades

- Cobrir todas as funcionalidades documentadas em [Now](https://github.com/prumod/cairn-web/issues/104), [Later](../later/funcionalidades.md) e [Maybe](../maybe/funcionalidades.md). A lista atual, com o estado de cada funcionalidade, está em [prototype-coverage.md](prototype-coverage.md).
- Não criar ecrãs para as exclusões de [Never](../never/funcionalidades.md) nem inventar outras.
- Representar a experiência completa: ecrãs, navegação, campos, controlos, interações, validações, alterações de estado, resultados vazios, informação em falta, erros e correção/regresso quando aplicáveis.
- Later e Maybe não se limitam a um painel estático de âmbito. Devem demonstrar as respetivas experiências; isso não altera a prioridade nem confirma viabilidade técnica, valor ou regras de negócio.
- Não mostrar etiquetas, separadores ou navegação Now/Later/Maybe/Never no frontend. A navegação deve seguir os conceitos e tarefas do utilizador.
- Manter a classificação rastreável em documentação, código ou comentários. Não é necessário dividir o código em quatro árvores de pastas; a rastreabilidade não deve ditar abstrações prematuras.

## Terminologia

- **Wireframe interativo:** representação sem estilos da estrutura, conteúdo, navegação, campos e estados das funcionalidades Later e Maybe.
- **Protótipo interativo:** demonstração navegável com comportamento simulado. Nome comum dos estados `ux-prototype`, `ui-prototype` e `final-visual`; em Now, só `final-visual` existe.
- **Mockup:** representação da aparência proposta — layout, tipografia, cores, espaçamento e componentes — normalmente estática. Pode apoiar decisões visuais, mas não substitui a demonstração interativa dos percursos.
- **UX (User Experience / experiência do utilizador):** compreensão e realização das tarefas, incluindo navegação, feedback, acessibilidade e recuperação de erros.
- **UI (User Interface / interface do utilizador):** controlos, layout e apresentação visual com que a pessoa interage. As decisões de UI também afetam a UX: o `ux-prototype` foca-se na UX e o `ui-prototype` na UI, mas nenhum fecha o outro. UI não é sinónimo de mockup nem de wireframe.

## Sem dados reais nem efeitos externos

Estes limites aplicam-se ao wireframe interativo e aos estados de protótipo, incluindo `final-visual`, mesmo quando a interface se aproximar da produção. A produção usa os serviços de produção.

- Usar exemplos fictícios coerentes, pré-visualizações incluídas na demonstração e estado local descartável. Sem backend, base de dados, autenticação externa ou persistência de produção.
- Simular localmente os resultados de pesquisa, sugestões de IA, importações, documentos, e-mails, integrações e restantes ações externas. Não consultar DR, BASE, IMPIC, fornecedores, mapas, ERP ou plataformas reais.
- Não recolher dados pessoais, ler caixas de correio, carregar documentos reais, enviar mensagens, comprar selos, assinar documentos, efetuar pagamentos ou submeter propostas.
- No wireframe e em qualquer estado anterior a `final-visual` que exista, distinguir claramente a demonstração de uma operação real, sem expor a classificação de prioridades, e disponibilizar reinício da demonstração. Uma confirmação de submissão deve indicar que nada foi enviado. O `final-visual` não tem aviso nem reinício de demonstração, porque a produção o replica exatamente.
- Exemplos de datas e estados devem ser determinísticos, sem depender de prazos ou avisos de produção.
- Cálculos e validações demonstrativos não são regras jurídicas ou contabilísticas aprovadas. Incertezas devem ficar documentadas, não escondidas em automatismos.

## Percursos a representar

### Descoberta e proposta

Now: perfil da empresa → anúncios de obras do dia → tabela de todas as obras dentro do raio → filtro de localidade (diálogo com o mapa e a lista de caixas lado a lado) → vista do concurso, com o assistente ao lado da tabela. Incluir um dia sem anúncios, filtros sem resultados e um pedido ao assistente sobre um ou vários concursos selecionados.

A seleção de obras limita-se às obras presentes na lista atual. Alterar filtros, aplicar outra localidade ou limpar filtros remove da seleção as obras que deixem de ser mostradas. As localidades escolhidas no diálogo só passam a filtro com «Confirmar», e «Cancelar», Escape ou um clique fora descartam-nas. Os comentários já preparados no assistente mantêm-se. «Limpar filtros» (botão ou pedido ao assistente) limpa todos os filtros, incluindo as localidades e os resultados mostrados pelo assistente.

Later continua o percurso: convites, prazos, revisão de requisitos e decisão de participar → dossier e checklist → preços unitários e total → revisão → submissão simulada, mais a navegação pelo assistente e a vista por fases. Incluir informação de habilitação em falta/incompatível, recusa, preparação incompleta, regresso à preparação, proposta pronta e prazo ultrapassado. A submissão simulada pode alimentar os exemplos de acompanhamento posterior.

### Assistente e opções

O assistente fica sempre ao lado da tabela. Aplica as suas ações logo e mostra os resultados só na tabela, com a indicação «Lista do assistente: N obras» e uma ação para a limpar. Cada resposta mostra os passos dados e o efeito de cada um, sem os poder revisitar nem desfazer (Maybe M23). Não há seletor de variações: o comportamento é fixo (Maybe M24).

O cabeçalho tem um painel «⚙ Opções» (fecha com Escape ou clique fora) com a referência da empresa, onde se podem alterar o raio de pesquisa e as categorias prioritárias.

### Seleção, comentários e citações

Obras e localidades são unidades selecionáveis, de seleções separadas. A interação segue os gestos e atalhos mais comuns do Explorador de Ficheiros do Windows 11 para selecionar e abrir unidades, sem as mover: clique, Ctrl/Meta+clique, Shift+clique (só nas obras, porque as localidades não têm ordem), duplo clique e os atalhos de teclado abaixo. Não há seleção por retângulo, menus de contexto nem atalhos avançados (Later L19–L21).

Na lista de obras, o clique no vazio e Escape limpam a seleção de obras. Uma barra visível oferece abrir, comparar, comentar e limpar a seleção, ativas quando há obras selecionadas. Sem obras na lista, a mensagem é texto simples e não limpa a seleção ao clique.

Ao guardar um comentário sobre localidades ou obras, o que foi comentado deixa de estar selecionado. Se a pessoa remove um comentário ainda sem texto, as obras a que se referia voltam a ficar selecionadas, apenas as que continuam listadas; as localidades não voltam a ser selecionadas. Na lista de comentários preparados no assistente, «Remover» apaga o comentário. Comentários sem texto não são enviados como contexto. Citar um excerto (dos dados de uma obra, na consulta do concurso, ou de uma resposta do assistente) acrescenta-o à mesma lista, com uma nota.

Só se pede confirmação ao apagar um comentário com texto, num diálogo modal («Tem a certeza?»), com «Cancelar» em foco e a ação destrutiva a vermelho. «Limpar tudo» nos itens para enviar também a pede quando algum comentário tem texto. Limpar uma seleção nunca pede confirmação.

### Seleção por teclado no mapa e na lista

Os atalhos atuam na região com foco e não interferem com a escrita em campos de texto. Estão disponíveis:

- **Mapa:** Tab percorre os marcadores; Espaço alterna a seleção do marcador com foco; Enter abre as localidades selecionadas ou, sem seleção, a localidade do marcador com foco. Escape fecha o diálogo de Localidade e descarta as localidades escolhidas, bem como um botão de comentário aberto. Ctrl+A seleciona todas as localidades.
- **Lista de obras:** Cima/Baixo move o foco e substitui a seleção; Espaço alterna a seleção da obra com foco; Shift+Cima/Baixo seleciona um intervalo; Ctrl+A seleciona todas as obras visíveis; Enter abre a obra selecionada ou compara as obras selecionadas; Escape limpa apenas a seleção de obras.

### Preparação adicional da proposta — Later

O cronograma financeiro, quando exigido, pertence a Later L09. Demonstrar períodos, percentagens, valores e indicação de preparação quando se trabalhar essa prioridade. Não o usar como condição de prontidão ou submissão simulada (L16). Esta alteração de prioridade não redefine os requisitos de entrega de um concurso real.

### Gestão e acompanhamento

Demonstrar fornecedores/cotações, registos de obras/clientes, acompanhamento pós-submissão, funcionários/mão de obra/equipamento, materiais/stock, finanças por obra, progresso e pós-obra. Preservar as distinções entre faturado e recebido, preparação e habilitação pós-adjudicação, execução e garantia, e receção provisória e definitiva.

### Capacidades a validar

Demonstrar as experiências propostas em Maybe: planeamento tipo Project/Gantt, análise de concorrentes, mapa 3D, caixa de entrada de anúncios, conversas por fase, perguntas sobre finanças, pesquisa de fornecedores por IA, extração de cotações, histórico/validade de preços, referências/margens, previsão de materiais, waterfall, edição/importação/exportação avançada e padrões de contratos públicos. Resultados são fictícios; não demonstram fraude, cobertura de fontes, previsões reais ou respostas de IA verificadas.

## Revisão e aprendizagem para o backend

Durante a revisão, identificar informação necessária, relações entre conceitos, ações do utilizador, condições de transição, falhas e regras por confirmar. Registar decisões de domínio à medida que a experiência é validada. Não fixar desde já interfaces, tabelas ou módulos de produção apenas para reproduzir os ecrãs.

A verificação futura deve:

- Em todos os estados, percorrer todas as funcionalidades, confirmar a coerência dos exemplos e estados, a ausência de etiquetas de prioridade, o reinício (exceto no `final-visual`) e a inexistência de chamadas ou efeitos externos.
- No wireframe interativo, confirmar a apresentação nativa sem estilos. No `ux-prototype`, quando uma funcionalidade começar nesse estado, rever estrutura, tarefas, navegação, validações e recuperação.
- No `ui-prototype`, quando existir, e no `final-visual`, rever a aparência pretendida para produção, consistência da UI, adaptação a tamanhos de ecrã, acessibilidade e eventuais alterações de UX. Repetir a revisão funcional após essas alterações.
- Na produção, confirmar que o frontend replica exatamente o `final-visual` e usa os serviços de produção.

Uma build bem-sucedida, por si só, não prova uma experiência completa nem valida a UX/UI.
