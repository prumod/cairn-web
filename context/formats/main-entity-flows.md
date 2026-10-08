# Percurso principal entre entidades

## O que modela

Uma projeção estrutural reduzida da [vista DDD de entidades e agregados](entity-aggregate-flows.md). Mostra os conceitos e relações necessários para explicar o caminho principal, incluindo elementos de suporte ou VO relevantes, sem toda a colaboração entre agregados.

Este formato usa **relações entre conceitos, não tarefas nem transições de estados**. As interações por eventos/pedidos ficam na vista DDD; as ações do utilizador ficam no [workflow](workflow-flows.md).

## Notação

- `flowchart LR`.
- Caixas com os mesmos nomes da vista detalhada, sem os prefixos DDD, grupos BC ou propriedades não essenciais. A classificação original continua a existir na vista detalhada.
- `A ---|"Inclui"| B`: mesma composição proposta da vista detalhada.
- `A -. "Referência: relação" .-> B`: mesma referência estrutural da vista detalhada; conservar nome e direção.
- Sem eventos/pedidos, caixas de espera, decisões, tarefas ou sistemas externos no percurso estrutural reduzido.

## Exemplo

Projeção do exemplo de encomendas da vista DDD detalhada, sem inventar relações, promover componentes a raízes ou impor uma sequência de ações.

```mermaid
flowchart LR
    C["Cliente"]
    O["Encomenda"]
    I["Item da encomenda"]
    P["Pagamento"]

    O -. "Referência: cliente" .-> C
    O ---|"Inclui"| I
    P -. "Referência: encomenda" .-> O
```

Outros conceitos, como Produto, Inventário ou Entrega, podem surgir numa vista do sistema sem pertencer ao caminho principal escolhido. Não acrescentar conceitos apenas para copiar o âmbito de um exemplo. Se a sequência ou coordenação entre agregados for a questão, consultar workflow ou vista DDD, respetivamente.

## Como rever

- Os conceitos, nomes e relações são um subconjunto da vista detalhada, com a mesma direção e tipo de ligação?
- A omissão dos prefixos e atributos é apenas visual, sem mudar identidade, composição ou propriedade?
- Inclui só os conceitos necessários ao percurso escolhido?
- Cada linha é uma composição ou referência, não tarefa, evento ou transição de estado?
- Os casos condicionais continuam explícitos nos rótulos relevantes?
- Âmbito e limites estão claros, sem declarar conclusão de um ciclo por terminar a vista?
