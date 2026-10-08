# Cairn — diagramas Now

Vistas do percurso Now: descoberta, decisão, preparação e submissão simulada. Não representam a totalidade do wireframe; consultar o [contrato completo](../system/wireframe.md).

Modelos conceptuais, não regras jurídicas validadas nem estruturas de backend já decididas. As etiquetas de prioridade pertencem à documentação, não à interface. Fontes: [T1](../transcriptions/transcricao1_gestao_obras.md) e [T2](../transcriptions/transcricao2_gestao_obras.txt).

## Entidades

```mermaid
flowchart LR

    subgraph NOW["NOW — conceitos do percurso até à submissão"]
        EMPRESA["Empresa participante<br/>Localização de referência<br/>Classe e licenças"]
        PESQUISA["Pesquisa de oportunidades<br/>Data de publicação e raio<br/>Visualizações: mapa, lista e linha temporal"]
        CONCURSO["Concurso / procedimento<br/>Entidade, descrição, valor anunciado<br/>Localização, prazo da obra<br/>Prazo de entrega da proposta e plataforma"]
        CONVITE["Convite, quando existir<br/>Entidade, referência e decisão"]
        PECAS["Peças e requisitos do concurso<br/>Desenhos, memorial descritivo, mapas<br/>Documentos exigidos e requisitos de participação"]
        PROPOSTA["Proposta da empresa<br/>Conjunto de documentos<br/>Valor proposto e estado de preparação"]
        DOCUMENTO["Documento da proposta<br/>Identificação e ficheiro<br/>Obrigatoriedade e situação de preparação"]
        MAPA["Mapa de medições / lista de preços unitários<br/>Itens, unidades e quantidades<br/>Preços unitários e valores por item"]
        FINANCEIRO["Cronograma financeiro, quando exigido<br/>Períodos, percentagens e valores previstos"]
        SUBMISSAO["Submissão na plataforma externa<br/>Entrega da proposta dentro do prazo<br/>Limite do NOW; simulada no protótipo"]

        EMPRESA -->|"Define localização e raio"| PESQUISA
        PESQUISA -->|"Identifica oportunidades"| CONCURSO
        CONCURSO --- CONVITE
        CONCURSO --- PECAS
        EMPRESA -->|"Decide participar"| PROPOSTA
        CONCURSO -->|"Objeto da participação"| PROPOSTA
        PECAS -->|"Determinam conteúdo exigido"| PROPOSTA
        PROPOSTA --- DOCUMENTO
        PROPOSTA --- MAPA
        PROPOSTA --- FINANCEIRO
        PROPOSTA --> SUBMISSAO
    end

    DR["Diário da República<br/>Fonte de anúncios"]
    IMPIC["IMPIC<br/>Fonte referida para classe e licenças"]
    PLATAFORMA["Plataforma externa: AcinGov / Vortal<br/>Peças, convites e submissão"]
    EMAIL["E-mail<br/>Aviso de convite"]
    OFFICE["Word / Excel<br/>Ferramentas atuais de preparação"]

    DR -. "Fonte externa; dados fictícios no protótipo" .-> CONCURSO
    IMPIC -. "Referência externa; sem consulta real no protótipo" .-> EMPRESA
    PLATAFORMA -. "Disponibiliza" .-> PECAS
    PLATAFORMA -. "Disponibiliza" .-> CONVITE
    EMAIL -. "Apenas aviso; sem integração de correio" .-> CONVITE
    OFFICE -. "Preparação atual representada no protótipo" .-> PROPOSTA
    SUBMISSAO -. "Ação externa; simulada no protótipo" .-> PLATAFORMA

    style NOW fill:#eef6ee,stroke:#397647
```

## Fluxo de trabalho

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

        Publicado --> Aberto: Conforme prazo indicado no procedimento
        Aberto --> Encerrado: Termina o prazo de entrega
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

    state "Participação no concurso — Now" as Participacao {
        [*] --> EmAnalise
        state "Oportunidade / convite em análise" as EmAnalise
        state "Proposta em preparação" as Preparacao
        state "Proposta completa e revista / pronta para submissão" as Pronta
        state "Proposta submetida na plataforma externa" as Submetida
        state "Não participar" as NaoParticipar
        state "Prazo ultrapassado sem submissão" as SemSubmissao

        EmAnalise --> Preparacao: Rever interesse, classe, licenças e requisitos e decidir participar
        EmAnalise --> NaoParticipar: Decidir não concorrer / recusar convite
        EmAnalise --> SemSubmissao: Termina o prazo sem entrega
        Preparacao --> Pronta: Rever documentos, preços, valor e cronograma exigido
        Pronta --> Preparacao: Rever omissões ou alterações
        Preparacao --> SemSubmissao: Termina o prazo sem entrega
        Pronta --> SemSubmissao: Termina o prazo sem entrega
        Pronta --> Submetida: Submeter na plataforma dentro do prazo
        Submetida --> [*]
        NaoParticipar --> [*]
        SemSubmissao --> [*]
    }

    note right of Participacao
        No wireframe, submissão e confirmação são simuladas.
        Habilitações apoiam revisão humana, sem validação jurídica automática.
        Submetida encerra o percurso Now, não o concurso nem o wireframe completo.
    end note
```

## Percurso principal

Fluxo entre entidades e respetivas relações, não uma sequência de tarefas. Os passos do utilizador estão no diagrama «Fluxo de trabalho».

```mermaid
flowchart LR

    EMPRESA["Empresa<br/>Localização, classe e licenças"]
    PESQUISA["Critérios de pesquisa<br/>Data de publicação e raio"]
    CONCURSO["Concurso / convite<br/>Valor, localização e prazos<br/>Requisitos e plataforma"]
    PECAS["Peças do concurso<br/>Desenhos, memorial e mapas"]
    PROPOSTA["Proposta<br/>Estado de preparação e valor final"]
    DOCUMENTOS["Documentos exigidos<br/>Checklist de preparação"]
    PRECOS["Mapa de medições / preços unitários<br/>Itens, quantidades e preços"]
    FINANCEIRO["Cronograma financeiro<br/>Quando exigido"]
    SUBMISSAO["Submissão da proposta<br/>Registo simulado no wireframe<br/>Fim do percurso Now"]

    EMPRESA -->|"Referência dos critérios"| PESQUISA
    PESQUISA -->|"Correspondem a"| CONCURSO
    EMPRESA -->|"Autora da proposta"| PROPOSTA
    CONCURSO -->|"Objeto da proposta"| PROPOSTA
    CONCURSO -->|"Tem peças"| PECAS
    PECAS -->|"Base da proposta"| PROPOSTA
    PROPOSTA ---|"Inclui"| DOCUMENTOS
    PROPOSTA ---|"Inclui"| PRECOS
    PROPOSTA ---|"Inclui quando exigido"| FINANCEIRO
    PROPOSTA -->|"Objeto da submissão"| SUBMISSAO
```
