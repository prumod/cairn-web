# Cairn — especificação do protótipo Now

## Estatuto e fontes

Este documento especifica o comportamento do protótipo principal ([`apps/web/references/prototype-discovery/`](../../../apps/web/references/prototype-discovery/)) tal como está implementado no commit `035871d`. A especificação foi obtida pela leitura do código e pela execução do agente simulado com os pedidos da secção [Exemplos](#exemplos). Não houve revisão no browser.

O documento descreve uma demonstração com dados fictícios. Não é um requisito de produção nem um modelo de dados. As regras e os limites comuns a todos os protótipos estão no [contrato do protótipo interativo](../system/prototype.md); as funcionalidades e as respetivas fontes estão em [Now](funcionalidades.md); o vocabulário por confirmar está em [termos por definir](termos-por-definir.md). Enquanto não houver implementação de produção, o protótipo é a fonte de verdade do comportamento Now: quando outro documento diverge do protótipo, atualiza-se esse documento.

Para executar o protótipo, corra `bun run --cwd apps/web prototype` na raiz do repositório e abra `http://127.0.0.1:5173`.

## Âmbito

| Funcionalidade | Onde está no protótipo                                                                       |
| -------------- | -------------------------------------------------------------------------------------------- |
| N01            | [Perfil da empresa](#perfil-da-empresa-n01), só de leitura.                                  |
| N02            | Filtros de publicação e distância em [Filtros](#filtros-n02-n14); dia sem anúncios.          |
| N03            | [Tabela de obras](#tabela-de-obras-n03) e [filtro de localidade](#filtro-de-localidade-n03). |
| N04            | [Vista do concurso](#vista-do-concurso-n04).                                                 |
| N13            | [Agente](#agente-n13), ao lado da tabela.                                                    |
| N14            | [Filtros](#filtros-n02-n14), «Limpar filtros» e destaque da prioridade.                      |

Não estão implementados: a edição do perfil, um filtro de prazo, uma pesquisa por texto, a navegação pelo agente (Later L17) e a vista por fases (Later L18). As funcionalidades Later e Maybe estão no [wireframe interativo](../../../apps/web/references/interactive-wireframe.tsx).

## Dados de demonstração

Os dados estão em [`data.ts`](../../../apps/web/references/prototype-discovery/data.ts). Todos os nomes de empresas e entidades são fictícios.

### Data de referência

- «Hoje» é 15 de outubro de 2026, às 09:00. Nenhuma obra tem esta data de publicação; é o dia sem anúncios.
- Os dias até à entrega são a parte inteira da diferença, em dias, entre o prazo de entrega e a data de referência.

### Empresa

| Campo            | Valor                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Nome             | Construções Exemplo, Lda. (fictícia)                                                                  |
| Localização      | Leiria, no centro do mapa                                                                             |
| Raio de pesquisa | 50 km                                                                                                 |
| Classe           | 3                                                                                                     |
| Alvará           | Edifícios, Vias de comunicação. Não aparece no ecrã nem é comparado com o alvará exigido (Later L12). |
| Tipo prioritário | Edifícios                                                                                             |

### Obras

| Obra                                        | Entidade adjudicante        | Localidade     | Distância | Publicação | Entrega            | Valor anunciado | Execução | Plataforma | Tipo                | Alvará exigido                             |
| ------------------------------------------- | --------------------------- | -------------- | --------- | ---------- | ------------------ | --------------- | -------- | ---------- | ------------------- | ------------------------------------------ |
| Requalificação da Escola Básica de Marrazes | Município de Leiria         | Leiria         | 4 km      | 14/10      | 28/10 17:00 (13 d) | 412 000 €       | 180 dias | AcinGov    | Edifícios           | Edifícios, classe 3                        |
| Cobertura do pavilhão desportivo de Leiria  | Município de Leiria         | Leiria         | 4 km      | 14/10      | na plataforma      | 540 000 €       | 120 dias | AcinGov    | Edifícios           | Edifícios, classe 3                        |
| Pavimentação da Rua do Moinho               | Município da Batalha        | Batalha        | 18 km     | 14/10      | 17/10 12:00 (2 d)  | 96 000 €        | 60 dias  | Vortal     | Vias de comunicação | Vias de comunicação, classe 2              |
| Requalificação do Largo da Igreja           | Município da Marinha Grande | Marinha Grande | 15 km     | 13/10      | na plataforma      | 210 000 €       | 90 dias  | Vortal     | Espaços públicos    | Edifícios, classe 2                        |
| Muro de suporte na EN 356                   | Freguesia de Alcobaça       | Alcobaça       | 27 km     | 12/10      | 22/10 12:00 (7 d)  | 58 000 €        | 45 dias  | Vortal     | Vias de comunicação | Vias de comunicação, classe 1              |
| Reabilitação do Mercado Municipal de Pombal | Município de Pombal         | Pombal         | 31 km     | 13/10      | 10/11 17:00 (26 d) | 1 250 000 €     | 365 dias | AcinGov    | Edifícios           | Edifícios, Instalações elétricas, classe 5 |
| Ampliação do cemitério de Ourém             | Município de Ourém          | Ourém          | 35 km     | 12/10      | na plataforma      | 150 000 €       | 75 dias  | Vortal     | Espaços públicos    | Edifícios, classe 2                        |
| Ampliação do Centro de Saúde de Condeixa    | ULS de Coimbra              | Condeixa       | 72 km     | 13/10      | 03/11 17:00 (19 d) | 680 000 €       | 270 dias | AcinGov    | Edifícios           | Edifícios, classe 4                        |

- «Na plataforma» significa que o anúncio não indica o prazo de entrega.
- As 7 localidades têm esta ordem: Leiria, Batalha, Marinha Grande, Alcobaça, Pombal, Ourém, Condeixa.
- Com os filtros iniciais, 7 obras são visíveis. O Centro de Saúde de Condeixa fica fora do raio de 50 km.
- Cada obra tem uma pré-visualização fictícia do anúncio com quatro linhas: «ANÚNCIO DE PROCEDIMENTO (exemplo fictício) — {entidade}», «Objeto: {título}.», uma descrição dos trabalhos e «Critério de adjudicação: preço mais baixo. Consulta das peças do procedimento na plataforma eletrónica indicada.»

## Ecrã

### Disposição

- **Cabeçalho:** marca «Cairn», texto «Protótipo · descoberta de obras», botão «⚙ Opções» e botão «Reiniciar demonstração».
- **Aviso:** «Demonstração. Dados fictícios; o agente é simulado; nada é enviado.»
- **Coluna principal**, de cima para baixo: linha do perfil, linha de filtros (botão Localidade e barra de filtros), barra de seleção, tabela de obras, vista do concurso (quando aberta) e comparação (quando aberta).
- **Coluna da conversa**, à direita, com 380 px de largura. Fica fixa quando a página se desloca.
- Com 900 px de largura ou menos, o ecrã tem uma só coluna. A conversa fica depois da coluna principal, com 480 px de altura.

### Estado do ecrã

| Estado                      | Significado                                                                        | Valor inicial           |
| --------------------------- | ---------------------------------------------------------------------------------- | ----------------------- |
| Filtros                     | Distância, data de publicação, valor, entidade, tipos de obra e localidades.       | 50 km; restantes vazios |
| Obras listadas              | As obras que a tabela mostra (regra 1).                                            | 7 obras                 |
| Seleção de obras            | As obras que a pessoa selecionou.                                                  | Vazia                   |
| Localidades escolhidas      | As localidades marcadas no popover de Localidade, ainda não aplicadas como filtro. | Vazia                   |
| Obra aberta                 | A obra mostrada na vista do concurso.                                              | Nenhuma                 |
| Comparação                  | As obras mostradas lado a lado.                                                    | Nenhuma                 |
| Obras mostradas pelo agente | As obras que o agente pediu para mostrar.                                          | Vazia                   |
| Itens para enviar           | Comentários e citações preparados no compositor do chat.                           | Vazio                   |
| Histórico do agente         | As alterações aplicadas pelo agente que «↶ Voltar» pode desfazer.                  | Vazio                   |
| Opções                      | As escolhas do painel Opções.                                                      | Ver [Opções](#opções)   |

### Regras gerais

1. **Obras listadas.** Se o agente mostrou obras, a tabela lista exatamente essas, pela ordem do agente, com o título «Mostrados pelo agente». Caso contrário, lista as obras que cumprem todos os filtros, agrupadas por localidade pela ordem das localidades e, dentro de cada localidade, pela ordem dos dados.
2. A seleção de obras contém apenas obras listadas. Uma alteração que retire uma obra da lista retira-a também da seleção.
3. As obras e as localidades são seleções separadas. Selecionar ou desselecionar umas nunca altera as outras.
4. O agente altera apenas o estado do ecrã, nunca os dados das obras. As alterações do agente mantêm a seleção de obras da pessoa, sujeita à regra 2.
5. A obra aberta continua aberta mesmo que deixe de estar listada.

## Perfil da empresa (N01)

- A linha mostra «Construções Exemplo, Lda. (fictícia) · Leiria · raio 50 km · classe 3 · prioridade: Edifícios».
- O perfil é só de leitura.

## Filtros (N02, N14)

| Controlo     | Opções                                                                      | Uma obra passa quando                                          |
| ------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Distância    | até 20 km, até 30 km, até 50 km (inicial)                                   | a distância é menor ou igual ao valor.                         |
| Publicação   | Todas as datas (inicial), Hoje, 14/10, 13/10, 12/10                         | a data de publicação é igual.                                  |
| Valor        | Qualquer valor (inicial), Até 100 mil €, 100 a 500 mil €, Mais de 500 mil € | o valor anunciado está no intervalo, com os limites incluídos. |
| Entidade     | Todas (inicial) e uma opção por entidade adjudicante                        | a entidade é igual.                                            |
| Tipo de obra | Botões alternáveis Edifícios, Vias de comunicação, Espaços públicos         | o tipo está entre os ativos; nenhum ativo inclui todos.        |
| Localidade   | Ver [Filtro de localidade](#filtro-de-localidade-n03)                       | a localidade está no filtro; filtro vazio inclui todas.        |

- Uma obra é listada quando cumpre todos os filtros.
- Alterar um controlo da barra limpa as obras mostradas pelo agente e fecha a comparação. Não fecha a vista do concurso.
- O contador «N obras» mostra quantas obras cumprem os filtros. Com obras mostradas pelo agente, continua a contar as obras que cumprem os filtros, não as linhas da tabela.
- O agente pode definir qualquer distância até 50 km. Com um valor diferente de 20, 30 ou 50 km (por exemplo, 40 km), o controlo Distância não mostra nenhuma das suas opções.
- «Limpar filtros» aparece junto ao contador quando um filtro, incluindo a localidade, difere do inicial ou quando há obras mostradas pelo agente. Repõe todos os filtros, limpa as obras mostradas pelo agente e fecha a comparação.
- A caixa «Selecionar todos» seleciona todas as obras que cumprem os filtros e junta as respetivas localidades ao filtro de localidade. Com o filtro em «todas», o filtro passa a ser só essas localidades: as obras listadas não mudam, mas o botão mostra, por exemplo, «Localidade · 6 localidades». Fica no estado misto quando só parte dessas obras está selecionada. Com todas selecionadas, desmarcá-la desseleciona-as, com [confirmação](#confirmação) a partir do limiar. Fica desativada quando nenhuma obra cumpre os filtros.
- As obras do tipo prioritário mostram «★ prioridade» na tabela. A prioridade nunca exclui obras.
- O contador, a caixa «Selecionar todos» e o agente usam a mesma ordem: primeiro as obras prioritárias e, dentro de cada grupo, a entrega mais próxima; as entregas desconhecidas ficam no fim. A tabela não usa esta ordem (regra 1).

## Filtro de localidade (N03)

O botão mostra «Localidade · {todas | nome | N localidades} ▾». Um clique abre ou fecha um popover («Filtrar por localidade») por baixo do botão. Conforme as [Opções](#opções), o popover mostra o mapa ou a lista. Termina com os botões «Cancelar» e «Aplicar · {todas | nome | N localidades}».

### Rascunho

- Ao abrir o popover, as localidades escolhidas começam iguais ao filtro atual. No modo lista, sem filtro, começam com todas as localidades.
- «Aplicar» torna as localidades escolhidas o filtro, fecha a vista do concurso e fecha o popover. «Filtrar» na barra de seleção e «Filtrar obras por estas localidades» no menu fazem o mesmo. Escolher todas as localidades, ou nenhuma, equivale a não ter filtro.
- Aplicar uma localidade, por qualquer destes meios ou por duplo clique ou Enter no mapa, não limpa as obras mostradas pelo agente. Enquanto elas existirem, a tabela continua a mostrá-las (regra 1) e o novo filtro só tem efeito visível depois de as limpar.
- «Cancelar», Escape, um clique fora do popover ou uma mudança da opção Localidade descartam o rascunho e fecham o popover. Um clique num menu de contexto, num comentário ou num diálogo de confirmação não conta como clique fora.

### Mapa

O mapa ([`MapView.tsx`](../../../apps/web/references/prototype-discovery/MapView.tsx)) é esquemático: só a escala de 2,6 px por km é comum a todas as posições.

- **Fundo:** terra, mar com «Oceano Atlântico», estradas, Coimbra como referência, escala de 20 km e indicação do norte.
- **Empresa:** ícone de edifício no centro, com o título «A sua empresa (Leiria)».
- **Raio:** anel tracejado com o texto «raio de N km», em que N é o filtro de distância.
- **Marcadores:** um por localidade, nas 7 localidades, posicionado pela distância e pela direção. Mostra o nome e, com mais de uma obra visível, o número de obras.
- O mapa conta as obras com todos os filtros exceto o de localidade.

| Estado do marcador       | Apresentação                                |
| ------------------------ | ------------------------------------------- |
| Com obras nestes filtros | Marcador no tom «com obras».                |
| Sem obras nestes filtros | Marcador noutro tom.                        |
| Escolhida                | Marcador maior e nome destacado.            |
| Mostrada pelo agente     | Auréola à volta do marcador.                |
| Com obras selecionadas   | Anel parcial (algumas) ou completo (todas). |
| Apanhada pelo arrasto    | Anel exterior de pré-visualização.          |

A legenda tem «A sua empresa», «Localidade com obras», «Sem obras nestes filtros», «Mostrado pelo agente», «Com obras selecionadas» e «Raio de pesquisa». O texto de ajuda diz «Arraste no espaço vazio para selecionar localidades · Shift junta · Ctrl alterna · duplo clique abre · clique no vazio limpa». Durante um arrasto, diz «N localidades · substituir», «juntar» ou «alternar».

| Gesto no mapa               | Resultado                                                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clique num marcador         | Escolhe só essa localidade. Shift junta-a; Ctrl/⌘ alterna-a. Se juntou uma localidade, oferece «✎ Comentar» depois de 400 ms sem segundo clique.                                  |
| Duplo clique num marcador   | Substitui o filtro por essa localidade, fecha a vista do concurso e fecha o popover.                                                                                              |
| Arrasto com mais de 6 px    | Desenha um retângulo tracejado e escolhe as localidades cujo marcador fica dentro. Sem tecla substitui; Shift junta; Ctrl/⌘ alterna. Se juntou localidades, oferece «✎ Comentar». |
| Clique no vazio, sem tecla  | Limpa as localidades escolhidas.                                                                                                                                                  |
| Clique direito num marcador | Se não estava escolhido, escolhe só esse. Abre o menu de localidades.                                                                                                             |
| Clique direito no vazio     | Com localidades escolhidas, abre o menu de localidades; sem, o menu da área vazia.                                                                                                |
| Escape durante um arrasto   | Cancela o arrasto e mantém a escolha anterior.                                                                                                                                    |

| Tecla no mapa           | Resultado                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| Tab                     | Percorre os marcadores.                                                                           |
| Espaço                  | Alterna a localidade com foco.                                                                    |
| Enter                   | Filtra pelas localidades escolhidas ou, sem escolha, pela localidade com foco, e fecha o popover. |
| Ctrl/⌘+A                | Escolhe todas as localidades e oferece «✎ Comentar».                                              |
| Shift+F10 ou tecla Menu | Abre o menu da localidade com foco.                                                               |
| Escape                  | Fecha o popover e descarta o rascunho. Se houver um botão «✎ Comentar», fecha-o também.           |

### Lista

- A caixa «Selecionar todos» marca todas as localidades. Fica no estado misto quando nem todas estão marcadas.
- Segue-se uma caixa por localidade, pela ordem das localidades.
- Pelo menos uma localidade fica sempre marcada: a última caixa marcada fica desativada. «Selecionar todos» não desmarca todas.

## Tabela de obras (N03)

O painel «Obras» ([`Panels.tsx`](../../../apps/web/references/prototype-discovery/Panels.tsx)) tem estes elementos:

- **Título:** «Obras» sem filtro de localidade, «Obras em {nome | N localidades}» com filtro, ou «Mostrados pelo agente».
- **Barra do painel:** caixa «Selecionar a obra» ou «Selecionar as N obras», com estado misto, e o texto «Nada selecionado» ou «N selecionadas no total».
- **Colunas:**
  - caixa de seleção, com o nome acessível «Usar «{título}» na conversa»;
  - **Obra:** título, botão «Abrir», «★ prioridade» quando aplicável e «· {localidade}» quando a lista abrange mais de uma localidade;
  - **Tipo**;
  - **Valor:** valor anunciado em euros, sem casas decimais;
  - **Prazo:** dia e mês da entrega, ou «na plataforma».
- As linhas selecionadas e a linha da obra aberta ficam assinaladas.
- **Ajuda:** «Arraste no espaço vazio para selecionar obras · Shift junta · Ctrl alterna · arraste sobre texto para citar».
- **Sem obras:** o painel mostra só o título e «Sem obras com estes filtros.» como texto simples. Esse texto não inicia um retângulo, não limpa a seleção e não abre o menu de seleção.

## Seleção

### Obras com o rato

| Gesto                                    | Resultado                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Clique numa linha                        | Seleciona só essa obra. Oferece «✎ Comentar» depois de 400 ms sem segundo clique.                |
| Ctrl/⌘ + clique                          | Alterna a obra.                                                                                  |
| Shift + clique                           | Seleciona o intervalo desde a última obra escolhida. Ctrl/⌘ + Shift junta o intervalo à seleção. |
| Duplo clique                             | Abre a obra na vista do concurso e deixa-a selecionada.                                          |
| Caixa da linha                           | Alterna a obra. Ao marcar, oferece «✎ Comentar».                                                 |
| Botão «Abrir»                            | Abre a obra sem alterar a seleção.                                                               |
| Clique direito numa linha                | Se a obra não estava selecionada, seleciona só essa. Abre o menu de obras.                       |
| Clique no espaço vazio do painel         | Desseleciona todas as obras.                                                                     |
| Clique direito no espaço vazio do painel | Abre o menu da área vazia.                                                                       |
| Arrasto sobre texto citável              | Seleciona o texto para [citar](#citações).                                                       |

### Retângulo de seleção na tabela

- Começa num espaço vazio do painel ou na margem de uma linha, depois de um movimento de mais de 6 px. Não começa em controlos, cabeçalhos, título, barra do painel, texto de ajuda, texto citável nem com toque.
- As linhas intercetadas mostram uma pré-visualização. Sem tecla, o retângulo substitui a seleção; Shift junta; Ctrl/⌘ alterna em relação à seleção do início do arrasto.
- A página desloca-se quando o ponteiro fica a menos de 36 px do topo ou do fundo da janela.
- Ao largar, a seleção fica aplicada e o foco passa para a primeira obra apanhada. Se o arrasto juntou obras, oferece «✎ Comentar» junto ao ponteiro.
- Escape, a perda de foco da janela ou o cancelamento do ponteiro preservam a seleção original.
- Um arrasto que apenas desseleciona pede [confirmação](#confirmação) a partir do limiar.

### Obras com o teclado

| Tecla na tabela            | Resultado                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Cima/Baixo                 | Move o foco e seleciona só a obra com foco.                                                                             |
| Shift+Cima/Baixo           | Seleciona o intervalo desde a última obra escolhida. Com Ctrl/⌘, junta o intervalo.                                     |
| Home/End                   | Seleciona a primeira ou a última obra. Com Shift, seleciona o intervalo.                                                |
| Ctrl/⌘+Cima/Baixo/Home/End | Move só o foco.                                                                                                         |
| Espaço                     | Alterna a obra com foco.                                                                                                |
| Enter                      | Com 1 obra selecionada, abre-a. Com 2 a 4, compara-as. Com mais de 4, não faz nada. Sem seleção, abre a obra com foco.  |
| Ctrl/⌘+A                   | Seleciona todas as obras listadas.                                                                                      |
| Shift+F10 ou tecla Menu    | Abre o menu da obra com foco.                                                                                           |
| Escape                     | Fecha primeiro o botão ou o formulário de comentário. Depois desseleciona as obras, com confirmação a partir do limiar. |

- Uma seleção que junta obras oferece «✎ Comentar».
- Os atalhos não atuam em campos de texto.
- Ctrl/⌘+A também funciona com o foco na página, depois de um clique no vazio: atua na última zona usada (mapa ou tabela). Não atua com um menu ou um diálogo abertos.

### Menus de contexto

| Alvo               | Itens                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 1 obra selecionada | «Abrir» (Enter) · «Comentar» · «Limpar seleção»                                                                           |
| 2 a 4 obras        | «Comparar» (Enter) · «Comentar» · «Limpar seleção»                                                                        |
| Mais de 4 obras    | «Comparar (máx. 4)», desativado · «Comentar» · «Limpar seleção»                                                           |
| Localidades        | «Filtrar obras por estas localidades» (Enter) · «Comentar»                                                                |
| Área vazia         | «Selecionar todas as obras da lista», desativado sem obras · «Limpar filtros», desativado sem filtros nem obras do agente |

- O menu abre com o foco no primeiro item ativo. Cima/Baixo percorrem os itens em ciclo.
- Escape, um clique fora, a perda de foco da janela ou um redimensionamento fecham o menu. O foco volta ao elemento anterior.
- «Limpar seleção» desseleciona as obras, com confirmação a partir do limiar.

### Barra de seleção

- Mostra «Nada selecionado» ou «N localidades · M obras».
- «Filtrar» aparece só com localidades escolhidas e aplica-as como filtro.
- «✎ Comentar» abre logo o formulário de comentário sobre o que está selecionado.
- «Desselecionar tudo» limpa as localidades e as obras. Conta as duas para o limiar de confirmação.

### Confirmação

As ações que descartam unidades pedem confirmação num diálogo modal ([`Confirm.tsx`](../../../apps/web/references/prototype-discovery/Confirm.tsx)) a partir de um limiar:

| O que se perde                      | Limiar      |
| ----------------------------------- | ----------- |
| Só uma seleção                      | 10 unidades |
| Um comentário guardado sem texto    | 3 unidades  |
| Um comentário com texto escrito     | 1 (sempre)  |
| «Limpar tudo» nos itens para enviar | Sempre      |

- Abaixo do limiar, a ação executa-se logo.
- O diálogo tem o título «Tem a certeza?», uma mensagem (por exemplo, «Vai desselecionar 3 obras.»), o botão «Cancelar», com foco, e o botão da ação, a vermelho. Escape ou um clique fora equivalem a «Cancelar».
- Aplica-se a: «Desselecionar tudo», «Limpar seleção», clique no vazio da tabela, Escape na tabela, desmarcar uma caixa de grupo com todas as obras, um retângulo que só desseleciona, um clique no vazio do mapa que limpa a escolha, «Apagar» e «Descomentar» num comentário, e «Limpar tudo».
- Substituir a seleção por outra não pede confirmação.
- Com os dados de demonstração (8 obras e 7 localidades), as ações que contam só obras ou só localidades nunca chegam às 10 unidades. Só «Desselecionar tudo», que soma as duas, pode pedir confirmação de uma seleção.

## Vista do concurso (N04)

- **Abertura:** duplo clique, botão «Abrir», Enter, «Abrir» no menu, a ferramenta «abrir concurso» do agente, um cartão de resultado no chat ou uma obra numa mensagem enviada.
- **Posição:** por baixo da tabela.
- **Cabeçalho:** título da obra e botão «✕» («Fechar concurso»).

| Campo                | Conteúdo                                          |
| -------------------- | ------------------------------------------------- |
| Entidade adjudicante | Nome da entidade                                  |
| Localização          | «{localidade} · {N} km da empresa»                |
| Valor anunciado      | Valor em euros                                    |
| Prazo de execução    | «{N} dias»                                        |
| Entrega de propostas | «{dd/mm/aa, hh:mm} ({N} dias)» ou «na plataforma» |
| Alvará exigido       | «{categorias} · classe {N}»                       |
| Plataforma           | AcinGov ou Vortal                                 |
| Publicado a          | Dia e mês                                         |

- A secção «Anúncio de origem (pré-visualização fictícia)» mostra as quatro linhas do anúncio.
- No fim, a vista mostra a nota «Mostrar o alvará exigido não verifica a elegibilidade da empresa.»
- O título, os valores e as linhas do anúncio são citáveis.
- A vista fecha com «✕», ao aplicar um filtro de localidade ou quando o agente mostra obras, filtra localidades ou compara. Abrir outra obra substitui-a.

## Comparação

- **Abertura:** Enter ou «Comparar» com 2 a 4 obras selecionadas, ou a ferramenta «comparar» do agente, com 2 ou 3 obras.
- **Posição:** por baixo da tabela e da vista do concurso, com o título «Comparação» e o botão «✕» («Fechar comparação»).
- **Colunas:** uma por obra, com o título citável.
- **Linhas:** Localidade («{localidade} · {N} km»), Tipo, Valor anunciado, Execução, Entrega, Alvará e Plataforma. Os valores são citáveis.
- **Fecho:** «✕», uma mudança na barra de filtros, «Limpar filtros», ou as ferramentas do agente «filtrar», «pesquisar anúncios» e «abrir concurso».

## Comentários e citações

Os comentários e as citações preparam contexto para o agente. Nada é enviado até a pessoa carregar em «Enviar» ([`Notes.tsx`](../../../apps/web/references/prototype-discovery/Notes.tsx), [`Citations.tsx`](../../../apps/web/references/prototype-discovery/Citations.tsx)).

### Comentários

- O botão «✎ Comentar» aparece quando uma ação junta obras ou localidades à seleção. Fica centrado sobre os elementos visíveis que mostram essas unidades (linhas e marcadores), acompanha a deslocação da página e fica dentro da janela. Um clique noutro sítio esconde-o.
- O botão, ou «Comentar» num menu ou na barra de seleção, abre um formulário no mesmo sítio. O formulário mostra o que é comentado, um campo «O que quer dizer sobre estas obras?» (ou «…localidades?»), «Cancelar» e «Guardar». Escape cancela.
- **Comentário sobre obras:** sem localidades escolhidas, abrange as obras selecionadas.
- **Comentário sobre localidades:** com localidades escolhidas, abrange essas localidades e as obras selecionadas. O contexto enviado ao agente inclui também as obras dessas localidades que cumprem os filtros atuais.
- A pré-visualização mostra contagens, por exemplo «3 obras», «2 localidades» ou, num comentário misto, «Obras: 2 selecionadas» e «Localidades: 1 selecionadas». Um clique numa contagem mostra o primeiro e o último nome, cortados em 15 caracteres numa fronteira de palavra; outro clique volta à contagem.
- «Guardar» funciona mesmo sem texto. O comentário passa para os itens para enviar e as unidades comentadas deixam de estar selecionadas.

### Citações

- São citáveis os dados das obras (tabela, vista do concurso, comparação), as linhas do anúncio e as mensagens do agente. Rótulos, títulos de secção e botões não são citáveis. Uma seleção que os mistura cita só as partes citáveis, unidas por « … ».
- Selecionar texto citável mostra «❝ Citar» por cima da seleção. O botão abre um formulário com o texto, a origem (por exemplo, «Pavimentação da Rua do Moinho · Valor anunciado»), o campo «O que quer dizer sobre isto?», «Cancelar» e «Guardar».
- Citar de novo o mesmo texto da mesma origem substitui a nota em vez de duplicar a citação.
- Uma citação de dados de uma obra junta essa obra ao contexto enviado ao agente.

### Itens para enviar

O compositor do chat mostra a secção «Para enviar com o pedido», com o aviso «nada é enviado até carregar em Enviar».

| Item       | Elementos                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Comentário | Contagens expansíveis, campo «Nota» editável, botão «↩» (Descomentar) e botão «✕» (Apagar).       |
| Citação    | Texto citado, origem, campo «Nota (opcional)» editável e botão «✕», que a remove sem confirmação. |

- Enter num campo de nota confirma a nota e não envia o pedido.
- **Descomentar** retira o comentário e perde o texto. Volta a selecionar as localidades e as obras do comentário e junta as localidades dessas obras ao filtro de localidade. Com o filtro em «todas», o filtro passa a ser só essas localidades.
- **Apagar** retira o comentário.
- **«Limpar tudo»** retira todos os comentários e citações. Pede sempre confirmação, com a mensagem «Vai apagar {N comentários} e {M citações}. Nada disto foi enviado.»

## Agente (N13)

O agente é simulado e determinístico ([`agent.ts`](../../../apps/web/references/prototype-discovery/agent.ts), [`Chat.tsx`](../../../apps/web/references/prototype-discovery/Chat.tsx)). Converte um pedido em português em chamadas de ferramentas; um agente real deixaria o modelo escolher as chamadas, com as mesmas ferramentas e resultados.

### Conversa

- O painel tem o título «Agente». O botão «↶ Voltar» aparece quando há alterações aplicadas pelo agente.
- A primeira mensagem é «Olá. Peça-me para filtrar obras, mostrar concursos nas obras, abrir um concurso ou comparar vários.»
- Antes do primeiro pedido, o painel mostra 7 pedidos sugeridos (ver [Exemplos](#exemplos)). Um clique envia logo o texto sugerido, sem os itens para enviar, que continuam preparados.
- O compositor tem o campo «Pedido» e o botão «Enviar ➤». O texto de exemplo é «Peça ao agente…» ou, com itens para enviar, «Diga o que fazer com a seleção…». Enter envia; Shift+Enter muda de linha. O envio exige texto ou pelo menos um item.

### Envio e contexto

- O texto interpretado junta o texto escrito, as notas das citações e as notas dos comentários, separados por «. ».
- O contexto são as obras dos comentários e as obras das citações. As obras apenas selecionadas no ecrã não fazem parte do contexto.
- Depois do envio, os itens para enviar ficam vazios. A mensagem da pessoa mostra o texto, as obras dos comentários agrupadas por localidade (cada uma abre a vista do concurso), os comentários e as citações.
- A resposta do agente mostra o texto, citável, e uma linha «⚙ …» por ferramenta usada. Pode mostrar resultados, conforme as [Opções](#opções), e os botões de uma proposta.
- Sem chamadas de ferramentas e com itens enviados, a resposta é «Recebi N citações e M obras selecionadas. Diga o que quer fazer com elas, por exemplo «abre este concurso» ou «compara estas obras».»

### Ferramentas

Cada chamada parte do resultado da anterior.

| Ferramenta            | Linha no chat                                                                | Efeito no ecrã                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filtrar`             | «filtrar · {filtros} → N concursos» ou «filtrar · sem filtros → N concursos» | Junta os filtros pedidos aos atuais ou, num pedido para limpar, aos iniciais. Limpa as obras mostradas pelo agente e fecha a comparação.                 |
| `filtrar_localidades` | «filtrar localidades · {nomes ou todas} → N concursos»                       | Substitui o filtro de localidade. Limpa as localidades escolhidas e as obras mostradas pelo agente, e fecha a vista do concurso.                         |
| `pesquisar_anuncios`  | «pesquisar anúncios · AAAA-MM-DD → N concursos»                              | Define a data de publicação. Limpa as obras mostradas pelo agente e fecha a comparação.                                                                  |
| `mostrar_concursos`   | «mostrar nas obras · N concursos»                                            | A tabela passa a «Mostrados pelo agente» com essas obras; os marcadores ganham auréola. Fecha a vista do concurso.                                       |
| `abrir_concurso`      | «abrir concurso · {título curto}»                                            | Junta a localidade da obra ao filtro de localidade (com o filtro em «todas», o filtro passa a ser só essa localidade), abre a obra e fecha a comparação. |
| `comparar`            | «comparar · {título curto} × {título curto}»                                 | Abre a comparação. As obras comparadas passam a ser as mostradas pelo agente. Fecha a vista do concurso.                                                 |

O título curto retira «Requalificação», «Reabilitação» ou «Ampliação» e o artigo seguinte ao início do título. O resto do título mantém-se, incluindo a minúscula inicial (por exemplo, «cemitério de Ourém»).

### Interpretação dos pedidos

A interpretação ignora maiúsculas e acentos. As chamadas seguem esta ordem: `filtrar`, `filtrar_localidades`, `pesquisar_anuncios`, depois `mostrar_concursos` e, por fim, `comparar` ou `abrir_concurso`.

| O pedido contém                                                                                     | Resultado                                                                                                                  |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| «limpa», «remove», «tira», «repõe» ou «sem filtros», com «filtro», «tudo» ou «início»               | `filtrar` a partir dos filtros iniciais.                                                                                   |
| «N km»                                                                                              | Distância máxima N, limitada a 50. Acima de 50, junta o aviso «O raio da empresa é de 50 km; não pesquiso para além dele.» |
| «edifíci…»; «via(s)», «estrada» ou «pavimenta…» (exceto com «pavilhão»); «espaço» ou «urban…»       | Tipos de obra Edifícios; Vias de comunicação; Espaços públicos.                                                            |
| «acima de», «mais de» ou «pelo menos», seguido de N «mil» ou «k»                                    | Valor mínimo de N mil €.                                                                                                   |
| «abaixo de», «menos de», «até» ou «no máximo», seguido de N «mil» ou «k»                            | Valor máximo de N mil €.                                                                                                   |
| «entidade», «município», «freguesia» ou «câmara», com o nome de uma localidade                      | A entidade cujo nome contém essa localidade.                                                                               |
| Nomes de localidades, com «localidade», «em», «só» ou «apenas»                                      | `filtrar_localidades` com as localidades nomeadas.                                                                         |
| «todas as localidades», «sem localidade(s)» ou «limpa as localidades»                               | `filtrar_localidades` sem filtro.                                                                                          |
| «hoje», «ontem», «N de outubro» ou «dia N», para uma data que exista nos dados (12 a 15 de outubro) | `pesquisar_anuncios` com essa data.                                                                                        |
| «urgente», «prazo» ou «próximo(s) do fim»                                                           | `mostrar_concursos` com as N obras visíveis de entrega mais próxima, só entre as que têm entrega conhecida.                |
| «caros», «caras», «maiores», «valor mais» ou «valios…»                                              | `mostrar_concursos` com as N obras visíveis de maior valor.                                                                |
| O nome de uma obra, sem pedido para abrir ou comparar                                               | `mostrar_concursos` com as obras nomeadas.                                                                                 |
| «compar…», «diferenç…» ou «vs»                                                                      | `comparar`, com no máximo 3 obras (regra abaixo).                                                                          |
| «abre», «abra», «abrir», «detalhe», «consult…» ou «ver», sem pedido para comparar                   | `abrir_concurso` (regra abaixo).                                                                                           |

- **N** é o primeiro algarismo isolado do pedido, sem contar «N km», ou «um», «dois», «duas», «três» ou «quatro». Por omissão, N é 3.
- **Obras visíveis** são as obras que cumprem os filtros depois das chamadas anteriores, na ordem de prioridade.
- **Nomes de obras reconhecidos:** escola ou Marrazes; pavilhão; rua ou Moinho; largo ou igreja; muro ou EN 356; mercado; cemitério; saúde ou Condeixa.
- **Obras nomeadas fora do raio:** o agente mostra ou abre uma obra nomeada mesmo que não cumpra os filtros. Por exemplo, «Mostra o centro de saúde» lista o Centro de Saúde de Condeixa, a 72 km. O limite de 50 km aplica-se só às distâncias pedidas.
- **Comparar** usa o contexto e as obras nomeadas, se forem pelo menos 2. Senão, usa as obras mostradas pelo agente, se forem pelo menos 2. Senão, usa as 2 primeiras obras visíveis.
- **Abrir** usa a primeira obra nomeada. Senão, usa a primeira obra do contexto. Senão, usa a obra mostrada pelo agente, se for só uma.

| Situação                                        | Resposta                                                                                                                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Última chamada `abrir_concurso`                 | «{título}: {valor}, {N} dias de execução, plataforma {plataforma}.»                                                                                                                                                        |
| Última chamada `comparar`                       | «Comparei N concursos. O de maior valor anunciado é «{título}».»                                                                                                                                                           |
| Outra chamada, com obras                        | «N concursos: {títulos curtos separados por «; »}.»                                                                                                                                                                        |
| Outra chamada, sem obras, com pesquisa por data | «Não há anúncios de obras nessa data.»                                                                                                                                                                                     |
| Outra chamada, sem obras                        | «Nenhum concurso corresponde a estes filtros. Peça-me para limpar ou alargar os filtros.»                                                                                                                                  |
| Nenhuma chamada                                 | Os avisos, seguidos de «Posso filtrar por distância, localidade, tipo de obra, valor, entidade e data de publicação, mostrar concursos nas obras, abrir um concurso ou compará-los. Experimente um dos pedidos sugeridos.» |

Os avisos possíveis são: o aviso do raio; «Nenhum concurso visível tem essa informação.»; «Preciso de pelo menos dois concursos para comparar.»; «Diga qual concurso quer abrir, ou selecione um na lista.» Quando há chamadas, os avisos ficam no fim da resposta.

### Aplicação, proposta e desfazer

- **Ações «Imediatas»:** o ecrã passa logo ao resultado da última chamada. A alteração entra no histórico.
- **Ações «Com proposta»:** o ecrã não muda. A resposta mostra «Aplicar» e «Rejeitar». «Aplicar» põe o ecrã no resultado calculado no momento do pedido, mantém a seleção atual e regista a alteração no histórico. As outras alterações feitas pela pessoa depois do pedido perdem-se. «Rejeitar» mostra «Proposta rejeitada.». Enviar outro pedido rejeita uma proposta pendente.
- **Linhas «⚙ …»:** cada linha é um botão («Repor esta vista») que põe o ecrã no estado calculado a seguir a essa chamada, com a seleção atual; as outras alterações feitas depois perdem-se. Funciona também em propostas pendentes ou rejeitadas, sem «Aplicar». Não entra no histórico.
- **«↶ Voltar»:** desfaz a última alteração do histórico e repõe o ecrã anterior a ela, com a seleção atual. Repetir recua mais.

### Resultados no chat

- Com «No chat» desligado (inicial), os resultados aparecem só na tabela.
- Com «No chat» ligado e uma comparação, a mensagem mostra a tabela de comparação.
- Com «No chat» ligado e obras no resultado:
  - «Lista no chat» mostra um cartão por obra, com o título e «{localidade} · {valor} · {entrega}». Um clique abre a vista do concurso.
  - «Mapa no chat» mostra um mapa pequeno e não interativo, com a empresa e as obras do resultado. Com a lista desligada e até 5 obras, mostra também cartões compactos com o título e «{localidade} · {valor}».

## Opções

O botão «⚙ Opções» no cabeçalho abre um painel ([`Options.tsx`](../../../apps/web/references/prototype-discovery/Options.tsx)). O painel fecha com Escape ou com um clique fora.

| Grupo                | Escolhas                                                               | Inicial                                                       | Texto de ajuda                                                                              |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Resultados do agente | «No chat»; «Lista no chat» e «Mapa no chat», desativadas sem «No chat» | «No chat» e «Mapa no chat» desligados; «Lista no chat» ligada | «Os resultados aparecem só na lista.» ou «Os resultados aparecem na lista e no chat.»       |
| Ações do agente      | «Imediatas» ou «Com proposta»                                          | «Imediatas»                                                   | «O agente altera a lista logo.» ou «O agente propõe e só altera a lista depois de aceitar.» |
| Localidade           | «Mapa» ou «Lista»                                                      | «Mapa»                                                        | «A localidade filtra-se num mapa.» ou «A localidade filtra-se numa lista de caixas.»        |

- As escolhas aplicam-se logo.
- As escolhas mantêm-se ao reiniciar a demonstração. Recarregar a página repõe as escolhas iniciais.

## Reinício

«Reiniciar demonstração» repõe, sem confirmação, os filtros, as seleções, a obra aberta, a comparação, a conversa, o histórico do agente, os comentários e as citações. Mantém as Opções.

## Exemplos

Estes exemplos partem do estado inicial, com as Opções iniciais. Os 7 primeiros pedidos são as sugestões do chat. Os resultados foram obtidos ao executar `interpret` do agente simulado.

| Pedido                           | Linhas de ferramenta                                                                        | Resposta                                                                                                                                                       | Ecrã                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Mostra obras até 30 km           | filtrar · até 30 km → 5 concursos                                                           | 5 concursos: Escola Básica de Marrazes; Cobertura do pavilhão desportivo de Leiria; Pavimentação da Rua do Moinho; Muro de suporte na EN 356; Largo da Igreja. | Distância «até 30 km»; 5 obras na tabela; anel de 30 km no mapa.            |
| Mostra obras em Leiria e Pombal  | filtrar localidades · Leiria, Pombal → 3 concursos                                          | 3 concursos: Escola Básica de Marrazes; Mercado Municipal de Pombal; Cobertura do pavilhão desportivo de Leiria.                                               | «Localidade · 2 localidades»; tabela «Obras em 2 localidades» com 3 obras.  |
| Quais os 2 prazos mais urgentes? | mostrar nas obras · 2 concursos                                                             | 2 concursos: Pavimentação da Rua do Moinho; Muro de suporte na EN 356.                                                                                         | Tabela «Mostrados pelo agente» com essas 2 obras; «Limpar filtros» visível. |
| Só edifícios publicados ontem    | filtrar · até 50 km, Edifícios → 3 concursos; pesquisar anúncios · 2026-10-14 → 2 concursos | 2 concursos: Escola Básica de Marrazes; Cobertura do pavilhão desportivo de Leiria.                                                                            | Edifícios ativo; Publicação 14/10; 2 obras na tabela.                       |
| Compara a escola com o mercado   | comparar · Escola Básica de Marrazes × Mercado Municipal de Pombal                          | Comparei 2 concursos. O de maior valor anunciado é «Reabilitação do Mercado Municipal de Pombal».                                                              | Comparação aberta; tabela «Mostrados pelo agente» com as 2 obras.           |
| Abre o muro de Alcobaça          | abrir concurso · Muro de suporte na EN 356                                                  | Muro de suporte na EN 356: 58 000 €, 45 dias de execução, plataforma Vortal.                                                                                   | «Localidade · Alcobaça»; vista do concurso do muro aberta.                  |
| Obras publicadas hoje            | pesquisar anúncios · 2026-10-15 → 0 concursos                                               | Não há anúncios de obras nessa data.                                                                                                                           | Publicação «Hoje»; «Sem obras com estes filtros.»                           |
| Mostra obras até 80 km           | filtrar · até 50 km → 7 concursos                                                           | 7 concursos: … O raio da empresa é de 50 km; não pesquiso para além dele.                                                                                      | Sem alteração visível.                                                      |
| Mostra o centro de saúde         | mostrar nas obras · 1 concurso                                                              | 1 concurso: Centro de Saúde de Condeixa.                                                                                                                       | Tabela «Mostrados pelo agente» com essa obra, fora do raio de 50 km.        |
| Os 2 mais caros                  | mostrar nas obras · 2 concursos                                                             | 2 concursos: Mercado Municipal de Pombal; Cobertura do pavilhão desportivo de Leiria.                                                                          | Tabela «Mostrados pelo agente» com essas 2 obras.                           |
| Obras do município de Pombal     | filtrar · até 50 km, Município de Pombal (fictício) → 1 concurso                            | 1 concurso: Mercado Municipal de Pombal.                                                                                                                       | Entidade «Município de Pombal»; 1 obra na tabela.                           |
| olá                              | —                                                                                           | Posso filtrar por distância, localidade, tipo de obra, valor, entidade e data de publicação, … Experimente um dos pedidos sugeridos.                           | Sem alteração.                                                              |

Exemplos com os controlos da pessoa, a partir do estado inicial:

| Ação                                                    | Resultado                                                                                                   |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Distância «até 20 km»                                   | 4 obras: escola, pavilhão, Rua do Moinho e Largo da Igreja.                                                 |
| Valor «Mais de 500 mil €»                               | 2 obras: pavilhão e mercado.                                                                                |
| Valor «100 a 500 mil €»                                 | 3 obras: escola, Largo da Igreja e cemitério.                                                               |
| Publicação «Hoje»                                       | «0 obras» e «Sem obras com estes filtros.»; no mapa, todas as localidades ficam «Sem obras nestes filtros». |
| Duplo clique em Pombal no mapa                          | «Localidade · Pombal»; tabela «Obras em Pombal» com o mercado; popover fechado.                             |
| Selecionar 3 obras na tabela e premir Escape duas vezes | O primeiro Escape fecha o botão «✎ Comentar»; o segundo desseleciona as 3 obras, sem confirmação.           |
| Guardar um comentário com texto e carregar em ✕         | O diálogo «Tem a certeza?» pede confirmação para apagar.                                                    |

## Questões em aberto

Continuam por decidir as questões de produto de [termos por definir](termos-por-definir.md#questões-de-regras-não-de-vocabulário), em particular o que o tamanho dos marcadores representa (o protótipo mostra só o número de obras), o significado de «concurso aberto», se o prazo de entrega aparece no anúncio do Diário da República e que unidade é uma localidade.
