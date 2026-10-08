# Cairn — contrato do wireframe sem estilos

## Objetivo e estatuto

Representar a experiência completa do utilizador antes de implementar o backend. O wireframe permite rever o que cada pessoa vê, introduz, altera e faz, e usar essa experiência para compreender abstrações, responsabilidades e estruturas de dados futuras. Ecrãs e tipos de frontend não se convertem automaticamente em tabelas de base de dados.

Este documento regista o âmbito acordado; não afirma que o wireframe já existe. A implementação é trabalho separado. React no Vite existente é a abordagem recomendada, não uma arquitetura de backend aprovada.

## Cobertura e prioridades

- Cobrir todas as funcionalidades documentadas em [Now](../now/funcionalidades.md), [Later](../later/funcionalidades.md) e [Maybe](../maybe/funcionalidades.md): N01–N12, L01–L08 e M01–M12.
- [Never](../never/funcionalidades.md) permanece vazio; não inventar exclusões nem ecrãs para preencher este nível.
- Representar a experiência completa: ecrãs, navegação, campos, controlos, interações, validações, alterações de estado, resultados vazios, informação em falta, erros e correção/regresso quando aplicáveis.
- Later e Maybe não se limitam a um painel estático de âmbito. Devem demonstrar as respetivas experiências; isso não altera a prioridade nem confirma viabilidade técnica, valor ou regras de negócio.
- Não mostrar etiquetas, separadores ou navegação Now/Later/Maybe/Never no frontend. A navegação deve seguir os conceitos e tarefas do utilizador.
- Manter a classificação rastreável em documentação, código ou comentários. Não é necessário dividir o código em quatro árvores de pastas; a rastreabilidade não deve ditar abstrações prematuras.

## Sem estilos

Usar elementos HTML semânticos e a apresentação nativa do browser, sem CSS de apresentação, estilos inline, biblioteca visual ou trabalho de identidade gráfica. O objetivo é rever a experiência, não a aparência. Rótulos, associação entre campos, foco por teclado e estrutura legível continuam necessários.

Mapas, Gantt e outras visualizações devem representar a interação e a informação necessárias, sem polimento visual nem serviços externos. A escolha concreta de representação fica para a implementação do wireframe; não substituir automaticamente uma experiência visual relevante por uma tabela sem revisão.

## Sem dados reais nem efeitos externos

- Usar exemplos fictícios coerentes, pré-visualizações incluídas na demonstração e estado local descartável. Sem backend, base de dados, autenticação externa ou persistência de produção.
- Simular localmente os resultados de pesquisa, sugestões de IA, importações, documentos, e-mails, integrações e restantes ações externas. Não consultar DR, BASE, IMPIC, fornecedores, mapas, ERP ou plataformas reais.
- Não recolher dados pessoais, ler caixas de correio, carregar documentos reais, enviar mensagens, comprar selos, assinar documentos, efetuar pagamentos ou submeter propostas.
- Distinguir claramente a demonstração de uma operação real, sem expor a classificação de prioridades. Uma confirmação de submissão deve indicar que nada foi enviado.
- Disponibilizar reinício da demonstração. Exemplos de datas e estados devem ser determinísticos, sem depender de prazos ou avisos de produção.
- Cálculos e validações demonstrativos não são regras jurídicas ou contabilísticas aprovadas. Incertezas devem ficar documentadas, não escondidas em automatismos.

## Percursos a representar

### Descoberta e proposta

Perfil da empresa → anúncios ou convites → mapa/lista/prazos → detalhe e revisão de requisitos → decisão de participar ou não → peças e checklist → preços unitários e total → cronograma financeiro quando exigido → revisão → submissão simulada. Incluir pesquisa vazia, informação de habilitação em falta/incompatível, recusa, preparação incompleta, regresso à preparação, proposta pronta e prazo ultrapassado.

Este é o percurso Now, não o limite do wireframe completo. A submissão simulada pode alimentar os exemplos de acompanhamento posterior.

### Gestão e acompanhamento

Demonstrar fornecedores/cotações, registos de obras/clientes, acompanhamento pós-submissão, funcionários/mão de obra/equipamento, materiais/stock, finanças por obra, progresso e pós-obra. Preservar as distinções entre faturado e recebido, preparação e habilitação pós-adjudicação, execução e garantia, e receção provisória e definitiva.

### Capacidades a validar

Demonstrar as experiências propostas em Maybe: planeamento tipo Project/Gantt, pesquisa assistida, análise de concorrentes, perguntas sobre finanças, pesquisa de fornecedores por IA, extração de cotações, histórico/validade de preços, referências/margens, previsão de materiais, waterfall, edição/importação/exportação avançada e padrões de contratos públicos. Resultados são fictícios; não demonstram fraude, cobertura de fontes, previsões reais ou respostas de IA verificadas.

## Revisão e aprendizagem para o backend

Durante a revisão, identificar informação necessária, relações entre conceitos, ações do utilizador, condições de transição, falhas e regras por confirmar. Registar decisões de domínio à medida que a experiência é validada. Não fixar desde já interfaces, tabelas ou módulos de produção apenas para reproduzir os ecrãs.

A verificação futura deve percorrer todas as funcionalidades, confirmar a coerência dos exemplos e estados, a ausência de estilos e etiquetas de prioridade, o reinício e a inexistência de chamadas ou efeitos externos. Uma build bem-sucedida, por si só, não prova uma experiência completa.
