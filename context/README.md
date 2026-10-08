# Cairn — contexto do produto

## Organização

- [Now](now/funcionalidades.md): funcionalidades prioritárias.
- [Later](later/funcionalidades.md): funcionalidades pretendidas para depois.
- [Maybe](maybe/funcionalidades.md): ideias a validar antes de compromisso.
- [Never](never/funcionalidades.md): exclusões deliberadas; atualmente vazio.
- [Transcriptions](transcriptions/): entrevistas e notas originais, com numeração de origem.
- [System](system/): [ideia inicial](system/ideia_inicial.txt) e [contrato do wireframe](system/wireframe.md).
- [Research](research/): [investigação técnica](research/pesquisa_arquitetura_cairn.md) e [pesquisa de mercado](research/pesquisa_mercado_cairn.md).
- [Formats](formats/README.md): guias reutilizáveis e exemplos ilustrativos para modelação pontual; não são especificação do produto.

O [mapeamento de plataformas](transcricao1_mapping-plataforma-dados.txt) permanece na raiz, sem alterações, por decisão explícita de adiar a sua reorganização.

## Quatro níveis de prioridade

- **Now:** funcionalidades prioritárias do percurso de descoberta, decisão, preparação e submissão de proposta.
- **Later:** funcionalidades pretendidas para produção posterior.
- **Maybe:** ideias que precisam de validação antes de compromisso de produção.
- **Never:** exclusões deliberadas do produto, não apenas de uma fase. Nenhuma foi aprovada.

A classificação é uma decisão de produto, não uma divisão da interface. O wireframe cobre toda a experiência de Now, Later e Maybe. Demonstrar uma capacidade não altera a prioridade, não confirma a viabilidade de integração e não constitui compromisso de produção. Gantt/Microsoft Project permanece Maybe.

## Estatuto das fontes e convenções

As prioridades foram acordadas com o utilizador, mas ainda precisam de validação com o entrevistado. As entrevistas são textos revistos com trechos incertos; não são regras jurídicas nem documentação de APIs. T1 e T2 identificam as secções das entrevistas, não versões de documentos derivados.

Só os registos em `transcriptions/` usam numeração de entrevista, com a exceção temporária do mapeamento deixado intacto. Os documentos derivados têm nomes descritivos e são atualizados diretamente, com histórico no Git; não se criam conjuntos `transcricao_3_*` ou snapshots numerados.

Para a experiência completa e os limites técnicos da demonstração, prevalece [system/wireframe.md](system/wireframe.md).

## Validação pendente

- Confirmar as necessidades e percursos com o entrevistado, incluindo os de Later e Maybe.
- Confirmar os exemplos de campos, documentos, mapas, cronogramas, habilitações, preços e arredondamento; não transformar exemplos das entrevistas em regras legais.
- Validar a utilidade das capacidades Maybe sem as promover automaticamente a Now ou Later.
- Verificar fontes, APIs, licenças e cobertura numa tarefa separada antes de qualquer integração real.
