# Mapeamento de dados de plataformas

## O que modela

Como informação proveniente de uma fonte pode corresponder a conceitos do domínio. Liga **origem → proprietário candidato → dado de origem → propriedade, entidade ou Value Object proposto**.

O mapeamento ajuda a identificar onde a informação nasce, quem poderá ser responsável por ela, o que pode evitar reintrodução manual e quais acessos ou integrações precisam de investigação. Não é um contrato de API nem prova de que os dados são atualmente copiados entre sistemas.

## Estrutura

```text
Plataforma ou canal de origem
  └── Agregado / entidade candidato a gerir a informação
        └── Dado na origem → propriedade / entidade / Value Object proposto
              ├── Evidência e estatuto
              └── Lacunas de acesso, cobertura, atualização ou interpretação
```

- **Origem:** sistema, base de dados, ficheiro ou canal que fornece a informação; telefone e e-mail podem ser canais, não bases de dados estruturadas.
- **Agregado candidato:** responsabilidade de domínio proposta, não propriedade já aprovada. Usar «entidade» quando a fronteira de agregado ainda não foi validada.
- **Dado na origem:** conceito identificado na fonte. Não inventar nomes de campos de API nem preenchê-los a partir de suposições.
- **Destino proposto:** propriedade, referência a entidade ou VO. Um VO como `Dinheiro` inclui montante e moeda; os detalhes ainda precisam de validação.
- **Evidência:** fonte exata (URL/documento e passagem/secção), o que confirma, data de consulta quando aplicável e estatuto: confirmado na fonte, relato, inferência ou por verificar.
- **Lacunas:** método de acesso, autorização, licença, formato, identidade, cobertura, atualização, erros e regras por confirmar.

## Exemplo de formato

Exemplo apenas de correspondência conceptual. Não confirma o schema, o acesso ou a cobertura de qualquer sistema, nem que uma organização copie estes dados. Os nomes são propostas de domínio, não nomes de campos da origem.

- **Origem:** sistema externo de encomendas.
  - **Entidade / agregado candidato:** `Encomenda`.
    - Identificador da encomenda → `EncomendaRef`.
    - Total → `Encomenda.total : Dinheiro`.
    - Data de criação → `Encomenda.criadaEm : DataHora`.
    - Estado comunicado → informação de estado; **não inferir** automaticamente uma transição sem regras e datas suficientes.
  - **Evidência:** exemplo didático, sem fonte anexada; não constitui mapeamento verificado. Num mapeamento real, ligar à documentação e à amostra autorizada correspondente.
  - **Validação necessária:** identificadores, significado e moeda dos valores, acesso autorizado, termos de reutilização, cobertura e atualização.

## Outras distinções úteis

- Distinguir a informação estruturada da origem de notificações como e-mail ou SMS; não assumir que a notificação contém todos os dados nem permite executar uma ação formal.
- Um dado recebido por telefone, e-mail ou ficheiro pode corresponder a um conceito do domínio, mas extração automática, validade e registo precisam de confirmação.
- Relatos sobre sistemas e folhas de cálculo não definem campos concretos; registar lacunas em vez de inventar schema.

## Como rever

- Cada correspondência distingue evidência de proposta e de informação desconhecida?
- Origem, identidade e destino estão explícitos sem fixar agregados prematuramente?
- Facto, hipótese e estado derivado não foram confundidos?
- Está claro o que precisaria de integração versus importação/manual, sem afirmar que alguma já existe?
- Os limites de acesso e os dados pessoais foram considerados antes de recolher dados reais?
- As citações são links ou localizadores úteis que permitem confirmar a evidência?
