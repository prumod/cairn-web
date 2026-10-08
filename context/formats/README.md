# Formatos de modelação

Guias reutilizáveis para escrever e rever documentos, não modelos aprovados do Cairn. Os exemplos adaptam os formatos discutidos com o utilizador; são pequenos e ilustrativos, não transcrições literais nem descrição completa de um procedimento real.

## Escolher o formato

- [Estados](state-diagrams.md): como **uma entidade** muda ao longo do seu ciclo de vida.
- [Entidades e agregados](entity-aggregate-flows.md): vista DDD obrigatória com BC, AR, entidades/VO, composição, referências e interações; fronteiras propostas explicitamente como hipóteses.
- [Fluxo de trabalho](workflow-flows.md): ações, decisões e caminhos do utilizador.
- [Percurso principal entre entidades](main-entity-flows.md): subconjunto das entidades e relações que explica o caminho principal.
- [Mapeamento de dados de plataformas](platform-data-mappings.md): origem da informação e destino proposto no domínio, com evidência e lacunas.

## Convenções comuns

- Diagramas em blocos `mermaid` dentro de Markdown, não em ficheiros Mermaid separados. Títulos descritivos, sem números de entrevista ou versão.
- Não confundir o facto de usar `flowchart` com modelar tarefas: o significado depende do tipo de nós e relações escolhido.
- Estados acompanham uma entidade; workflow acompanha ações; a vista DDD acompanha estrutura e colaboração entre agregados; o percurso principal projeta apenas conceitos e relações. Interações DDD podem usar eventos/pedidos entre raízes, mas não caixas de tarefas ou estados a fingir ser entidades.
- Cumprir a notação do formato escolhido. A incerteza da modelação exige marcar hipóteses, não tornar os seus elementos de notação opcionais. As simplificações do percurso principal não se aplicam à vista DDD detalhada.
- Identificadores Mermaid são locais ao desenho, não IDs de produção, nomes de tabelas nem números de versão.
- As legendas são locais ao formato. Não presumir que uma seta tracejada significa o mesmo em todos os documentos.
- Distinguir factos de fonte, propostas de modelação e decisões aprovadas. Uma ilustração não valida API, licença, regra jurídica, integração ou fronteira de agregado.
- Prioridade de produto é independente do formato. Gantt/Microsoft Project continua Maybe; Never continua vazio. O wireframe cobre a experiência completa sem expor prioridades na interface.

## Onde estão os modelos do produto

Consultar os [diagramas Now](../now/diagrams.md), os [diagramas do sistema](../system/diagrams.md) e o [contrato do wireframe](../system/wireframe.md). Alterar um exemplo deste diretório não altera esses modelos nem o âmbito aprovado. O [mapeamento existente](../transcricao1_mapping-plataforma-dados.txt) permanece intacto e ainda não foi convertido para o formato proposto aqui.
