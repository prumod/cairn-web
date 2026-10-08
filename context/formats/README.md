# Formatos de modelação

Guias reutilizáveis para escrever e rever documentos de modelação em qualquer projeto. Os exemplos são fictícios, pequenos e ilustrativos: não são modelos aprovados nem descrições completas de processos reais.

## Escolher o formato

- [Estados](state-diagrams.md): como **uma entidade** muda ao longo do seu ciclo de vida.
- [Entidades e agregados](entity-aggregate-flows.md): vista DDD de BC, AR, entidades/VO, composição, referências e interações.
- [Fluxo de trabalho](workflow-flows.md): ações, decisões e caminhos do utilizador.
- [Percurso principal entre entidades](main-entity-flows.md): subconjunto das entidades e relações que explica o caminho principal.
- [Mapeamento de dados de plataformas](platform-data-mappings.md): origem da informação e destino proposto no domínio, com evidência e lacunas.

## Convenções comuns

- Diagramas em blocos `mermaid` dentro de Markdown, não em ficheiros Mermaid separados. Usar títulos descritivos; evitar IDs locais ou versões, salvo quando façam parte do domínio ou do documento.
- Não confundir o facto de usar `flowchart` com modelar tarefas: o significado depende do tipo de nós e relações escolhido.
- Estados acompanham uma entidade; workflow acompanha ações; a vista DDD acompanha estrutura e colaboração entre agregados; o percurso principal projeta apenas conceitos e relações. Interações DDD podem usar eventos/pedidos entre raízes, mas não caixas de tarefas ou estados a fingir ser entidades.
- Cumprir a notação do formato escolhido. A incerteza da modelação exige marcar hipóteses, não tornar os seus elementos de notação opcionais. As simplificações do percurso principal não se aplicam à vista DDD detalhada.
- Identificadores Mermaid são locais ao desenho, não IDs de produção, nomes de tabelas nem números de versão.
- As legendas são locais ao formato. Não presumir que uma seta tracejada significa o mesmo em todos os documentos.
- Distinguir factos de fonte, propostas de modelação e decisões aprovadas. Uma ilustração não valida API, licença, regra jurídica, integração ou fronteira de agregado.

## Aplicar noutro domínio

Substituir os conceitos e regras dos exemplos pelos do domínio em análise. Os exemplos relacionados usam um domínio fictício de encomendas para mostrar coerência entre vistas, não para impor esse modelo. Registar fontes, decisões e limites nos documentos do projeto; alterar um exemplo deste diretório não aprova uma decisão de domínio.
