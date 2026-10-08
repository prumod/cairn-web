# Cairn — diagramas Now

Vistas do percurso Now: descoberta, decisão, preparação e submissão simulada. Não representam a totalidade do wireframe; consultar o [contrato completo](../system/wireframe.md).

Modelos conceptuais, não regras jurídicas validadas nem estruturas de backend já decididas. As etiquetas de prioridade pertencem à documentação, não à interface. Fontes: [T1](../transcriptions/transcricao1_gestao_obras.md) e [T2](../transcriptions/transcricao2_gestao_obras.txt). Notação e critérios de revisão: [formatos de modelação](../formats/README.md).

## Entidades

Fluxo detalhado entre entidades e relações, com a mesma notação do «Percurso principal», mas incluindo conceitos de suporte e relações fora do caminho principal dentro do âmbito Now. As setas indicam relações, não ordem de execução; os passos estão em «Fluxo de trabalho».

Os conceitos são propostas de modelação derivadas das funcionalidades e entrevistas. Não fixam tabelas, cardinalidades, pertença a agregados ou campos de produção. No wireframe, os ficheiros são fictícios e as submissões simuladas; esses limites não redefinem as entidades. Sistemas externos e ferramentas aparecem num grupo distinto, ligados por linhas tracejadas; não representam integrações já disponíveis. Consultar a vista do sistema para Later e Maybe.

```mermaid
flowchart LR

    subgraph NOW["NOW — descoberta e proposta"]
        EMPRESA["Empresa participante<br/>Localização, classe e licenças declaradas"]
        PESQUISA["Critérios de pesquisa<br/>Data de publicação e raio"]
        ADJUDICANTE["Entidade adjudicante<br/>Identificação e contactos"]
        CONCURSO["Concurso / procedimento<br/>Descrição e valor anunciado<br/>Localização, prazo da obra e prazo de entrega"]
        CONVITE["Convite<br/>Destinatário, referência e informação de resposta"]
        PECAS["Peças do concurso<br/>Desenhos, memorial descritivo e mapas"]
        REQUISITO["Requisito do concurso<br/>Descrição, obrigatoriedade e informação por confirmar"]
        PARTICIPACAO["Participação da empresa<br/>Empresa × concurso<br/>Decisão e estado de acompanhamento"]
        PROPOSTA["Proposta<br/>Estado de preparação e valor proposto"]
        CHECKLIST["Item da checklist<br/>Requisito e situação de preparação"]
        DOCUMENTO["Documento da proposta<br/>Identificação e ficheiro"]
        MAPA["Mapa de medições / preços unitários"]
        ITEM["Item do mapa<br/>Descrição, unidade, quantidade e preço unitário<br/>Subtotal"]
        FINANCEIRO["Cronograma financeiro<br/>Quando exigido"]
        PERIODO["Período do cronograma<br/>Percentagem e valor previsto"]
        SUBMISSAO["Submissão da proposta<br/>Referência e confirmação de entrega"]

        EMPRESA -->|"Referência dos critérios"| PESQUISA
        PESQUISA -->|"Correspondem a"| CONCURSO
        ADJUDICANTE -->|"Entidade do procedimento"| CONCURSO
        CONCURSO -->|"Pode ter"| CONVITE
        EMPRESA -->|"Destinatária"| CONVITE
        CONCURSO -->|"Tem"| PECAS
        CONCURSO -->|"Define"| REQUISITO
        PECAS -->|"Documentam"| REQUISITO
        EMPRESA -->|"Titular"| PARTICIPACAO
        CONCURSO -->|"Objeto da participação"| PARTICIPACAO
        PARTICIPACAO -->|"Pode ter"| PROPOSTA
        PROPOSTA ---|"Inclui"| CHECKLIST
        REQUISITO -->|"Referência do item"| CHECKLIST
        CHECKLIST -->|"Pode referenciar"| DOCUMENTO
        PROPOSTA ---|"Inclui"| DOCUMENTO
        PROPOSTA ---|"Inclui"| MAPA
        MAPA ---|"Contém"| ITEM
        PROPOSTA ---|"Inclui quando exigido"| FINANCEIRO
        FINANCEIRO ---|"Contém"| PERIODO
        PROPOSTA -->|"Objeto da submissão"| SUBMISSAO
    end

    subgraph FONTES["Sistemas externos e ferramentas — contexto, não entidades de domínio"]
        DR["Diário da República"]
        IMPIC["IMPIC"]
        PLATAFORMA["Plataforma externa<br/>AcinGov / Vortal"]
        EMAIL["E-mail"]
        OFFICE["Word / Excel"]
    end

    DR -. "Fonte de anúncios; sem consulta real no wireframe" .-> CONCURSO
    IMPIC -. "Fonte referida de habilitações; acesso por validar" .-> EMPRESA
    CONCURSO -. "Plataforma indicada" .-> PLATAFORMA
    PLATAFORMA -. "Origem das peças" .-> PECAS
    PLATAFORMA -. "Origem do convite" .-> CONVITE
    EMAIL -. "Canal de aviso; simulado" .-> CONVITE
    OFFICE -. "Ferramentas atuais de preparação" .-> PROPOSTA
    SUBMISSAO -. "Destino real externo; simulado no wireframe" .-> PLATAFORMA

    style NOW fill:#eef6ee,stroke:#397647
    style FONTES fill:#eef2f6,stroke:#64748b
```

## Fluxo de trabalho

Percurso da empresa participante. As ferramentas e ações externas descrevem o processo relatado; mapa, lista e preparação assistida representam a experiência proposta. No wireframe, consultas, ficheiros, entregas e confirmações usam dados fictícios ou simulação local, sem efeitos externos. Rever a proposta pressupõe reunir os elementos exigidos; os ramos de preparação não impõem uma execução paralela.

```mermaid
flowchart TD

    subgraph NOW["NOW — Início até submissão da proposta"]
        START(["Início"])
        START --> EMPRESA["Definir referência da empresa<br/>Localização, raio, classe e licenças"]
        EMPRESA --> DR["Consultar anúncios do dia no Diário da República<br/>2.ª série — contratos públicos"]
        DR --> REGIAO["Analisar obras por localização e raio da empresa<br/>Cairn proposto: mapa, lista e prazos"]
        REGIAO --> RELEVANTE{"Existe concurso relevante?"}
        RELEVANTE -- Não --> DR
        RELEVANTE -- Sim --> ANALISAR["Analisar anúncio<br/>Entidade, descrição, valor, localização e prazos"]

        START --> EMAIL["Receber aviso de convite por e-mail"]
        EMAIL --> CONVITE["Consultar convite na plataforma<br/>O e-mail é apenas um aviso"]
        CONVITE --> ANALISAR

        ANALISAR --> HABILITACAO["Verificar classe, licenças e requisitos da empresa<br/>Dados referidos: IMPIC; limites a confirmar"]
        HABILITACAO --> PARTICIPAR{"Participar?"}
        PARTICIPAR -- Não --> NAO(["Não concorrer<br/>Se houver convite, tratar recusa na plataforma"])
        PARTICIPAR -- Sim --> PLATAFORMA["Aceder à plataforma indicada<br/>AcinGov ou outra, por exemplo Vortal"]
        PLATAFORMA --> PECAS["Obter peças do concurso<br/>Desenhos, memorial descritivo, mapas e requisitos"]
        PECAS --> REQUISITOS["Rever requisitos e documentos exigidos"]

        REQUISITOS --> PREPARAR["Preparar conjunto da proposta<br/>Ferramentas atuais: Word e Excel"]
        PREPARAR --> DOCUMENTOS["Preparar documentação exigida<br/>Incluindo documentos do responsável, quando pedidos"]
        PREPARAR --> PRECOS["Preencher mapa de medições / lista de preços unitários<br/>Atribuir preço a cada item"]
        PREPARAR --> CRONOGRAMA["Preparar cronograma financeiro, quando exigido<br/>Distribuir percentagens e valores por período"]

        PRECOS --> VALOR["Definir preços unitários e calcular valor final<br/>Introduzir manualmente preços obtidos externamente<br/>Sem módulo de fornecedores nem regra fixa de margem"]

        DOCUMENTOS --> REVER["Reunir e rever a proposta<br/>Documentos, mapa preenchido, valor e cronograma exigido"]
        CRONOGRAMA --> REVER
        VALOR --> REVER
        REVER --> COMPLETA{"Proposta completa e revista?<br/>Documentos, preços e cronograma exigido"}
        COMPLETA -- Não --> PREPARAR
        COMPLETA -- Sim --> PRAZO{"Dentro do prazo de submissão?"}
        PRAZO -- Não --> EXPIRADA(["Prazo ultrapassado sem submissão"])
        PRAZO -- Sim --> SUBMETER["Submeter proposta na plataforma<br/>Ação externa; no protótipo, apenas simulação"]
        SUBMETER --> CONFIRMACAO["Consultar confirmação de entrega<br/>No wireframe, confirmação simulada"]
        CONFIRMACAO --> FIMNOW(["Fim do percurso Now<br/>Participação continua no acompanhamento"])
    end

    style NOW fill:#eef6ee,stroke:#397647
```

## Estados por entidade

Cada diagrama acompanha uma única entidade: Concurso e Participação. Não combina o ciclo público com as decisões de uma empresa. São modelos conceptuais baseados nas entrevistas, não regras jurídicas verificadas nem fronteiras de agregados de backend já decididas.

### Concurso

Vista do Concurso relevante para Now. O encerramento do prazo não é o fim do concurso; avaliação e contratação estão na vista do sistema. A submissão de uma empresa não altera, por si só, o estado do Concurso.

```mermaid
stateDiagram-v2
    state "Concurso" as Concurso {
        [*] --> Publicado
        state "Publicado / convite disponibilizado" as Publicado
        state "Aberto à entrega de propostas" as Aberto
        state "Prazo de entrega encerrado" as Encerrado

        Publicado --> Aberto: Início do prazo indicado
        Aberto --> Encerrado: Fim do prazo de entrega
    }

    note right of Concurso
        Estado do procedimento, não da proposta da empresa.
        Datas e condições dependem do procedimento.
        A continuação está na vista do sistema.
    end note
```

### Participação da empresa

Estado da relação entre uma empresa e um concurso, incluindo a sua proposta. Não participar ou perder o prazo encerra esta participação, não o Concurso. O diagrama não pressupõe que Participação e Proposta sejam o mesmo agregado no backend.

```mermaid
stateDiagram-v2
    state "Participação da empresa — Now" as Participacao {
        [*] --> EmAnalise
        state "Oportunidade / convite em análise" as EmAnalise
        state "Em preparação da proposta" as Preparacao
        state "Pronta para entrega da proposta" as Pronta
        state "Com proposta submetida" as Submetida
        state "Não participante" as NaoParticipar
        state "Sem proposta entregue dentro do prazo" as SemSubmissao

        EmAnalise --> Preparacao: Decisão de participar [requisitos revistos]
        EmAnalise --> NaoParticipar: Decisão de não concorrer / recusa do convite
        EmAnalise --> SemSubmissao: Fim do prazo [sem entrega]
        Preparacao --> Pronta: Revisão concluída [elementos exigidos completos]
        Pronta --> Preparacao: Omissão ou alteração identificada
        Preparacao --> SemSubmissao: Fim do prazo [sem entrega]
        Pronta --> SemSubmissao: Fim do prazo [sem entrega]
        Pronta --> Submetida: Entrega confirmada [dentro do prazo]
        NaoParticipar --> [*]
        SemSubmissao --> [*]
    }

    note right of Participacao
        No wireframe, entrega e confirmação são simuladas.
        Habilitações apoiam revisão humana, sem validação jurídica automática.
        Submetida é limite da vista Now, não estado final da Participação.
        O acompanhamento continua na vista do sistema.
    end note
```

## Percurso principal

Subconjunto Now da vista detalhada, com os mesmos conceitos e relações. Omite requisitos, itens da checklist e outros conceitos de suporte, mas não combina Concurso com Convite nem Documento com Item da checklist. As setas representam relações, não passos do utilizador ou fronteiras de agregados. O percurso termina visualmente na Submissão; o acompanhamento da Participação continua fora desta vista.

```mermaid
flowchart LR
    EMPRESA["Empresa participante<br/>Localização, classe e licenças declaradas"]
    PESQUISA["Critérios de pesquisa<br/>Data de publicação e raio"]
    CONCURSO["Concurso / procedimento<br/>Descrição e valor anunciado<br/>Localização, prazo da obra e prazo de entrega"]
    PECAS["Peças do concurso<br/>Desenhos, memorial descritivo e mapas"]
    PARTICIPACAO["Participação da empresa<br/>Empresa × concurso<br/>Decisão e estado de acompanhamento"]
    PROPOSTA["Proposta<br/>Estado de preparação e valor proposto"]
    DOCUMENTO["Documento da proposta<br/>Identificação e ficheiro"]
    MAPA["Mapa de medições / preços unitários"]
    FINANCEIRO["Cronograma financeiro<br/>Quando exigido"]
    SUBMISSAO["Submissão da proposta<br/>Referência e confirmação de entrega"]

    EMPRESA -->|"Referência dos critérios"| PESQUISA
    PESQUISA -->|"Correspondem a"| CONCURSO
    CONCURSO -->|"Tem"| PECAS
    EMPRESA -->|"Titular"| PARTICIPACAO
    CONCURSO -->|"Objeto da participação"| PARTICIPACAO
    PARTICIPACAO -->|"Pode ter"| PROPOSTA
    PROPOSTA ---|"Inclui"| DOCUMENTO
    PROPOSTA ---|"Inclui"| MAPA
    PROPOSTA ---|"Inclui quando exigido"| FINANCEIRO
    PROPOSTA -->|"Objeto da submissão"| SUBMISSAO
```
