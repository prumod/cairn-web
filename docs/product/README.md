# Cairn — contexto do produto

## Organização

- [Now](now/funcionalidades.md): funcionalidades prioritárias.
- [Termos por definir (Now)](now/termos-por-definir.md): vocabulário a confirmar.
- [Later](later/funcionalidades.md): funcionalidades pretendidas para depois.
- [Maybe](maybe/funcionalidades.md): ideias a validar antes de compromisso.
- [Never](never/funcionalidades.md): exclusões deliberadas; atualmente vazio.
- [Transcriptions](transcriptions/): entrevistas e notas originais, com numeração de origem.
- [System](system/): [ideia inicial](system/ideia_inicial.txt) e [contrato do protótipo interativo](system/prototype.md).
- [Research](research/): [investigação técnica](research/pesquisa_arquitetura_cairn.md), [pesquisa de mercado](research/pesquisa_mercado_cairn.md) e [fluxo de capturas e anotações](research/screenshots/canvas-workflow.md).

O protótipo evolui na mesma implementação: primeiro wireframe sem estilos para rever estrutura e comportamento; depois design visual próximo da produção. UX e UI são revistas ao longo dessa evolução. Mockups são representações visuais de apoio, normalmente estáticas; não substituem o protótipo interativo.

## Quatro níveis de prioridade

- **Now:** funcionalidades prioritárias do percurso de descoberta, decisão, preparação e submissão de proposta.
- **Later:** funcionalidades pretendidas para produção posterior, incluindo o cronograma financeiro da proposta (L09), adiado de Now.
- **Maybe:** ideias que precisam de validação antes de compromisso de produção.
- **Never:** exclusões deliberadas do produto, não apenas de uma fase. Nenhuma foi aprovada.

Now tem 11 funcionalidades (N01–N10 e N12); Later tem 9 (L01–L09). Os identificadores das restantes funcionalidades mantêm-se.

A classificação é uma decisão de produto, não uma divisão da interface. O protótipo interativo cobre toda a experiência de Now, Later e Maybe. Demonstrar uma capacidade não altera a prioridade, não confirma a viabilidade de integração e não constitui compromisso de produção. Gantt/Microsoft Project permanece Maybe.

## Estatuto das fontes e convenções

As prioridades foram acordadas com o utilizador, mas ainda precisam de validação com o entrevistado. As entrevistas são textos revistos com trechos incertos; não são regras jurídicas nem documentação de APIs. T1 e T2 identificam as secções das entrevistas, não versões de documentos derivados.

Só os registos em `transcriptions/` usam numeração de entrevista. Os documentos derivados têm nomes descritivos e são atualizados diretamente, com histórico no Git; não se criam conjuntos `transcricao_3_*` ou snapshots numerados.

Para a experiência completa e os limites técnicos da demonstração, prevalece [system/prototype.md](system/prototype.md).

## Validação pendente

- Confirmar as necessidades e percursos com o entrevistado, incluindo os de Later e Maybe.
- Confirmar os exemplos de campos, documentos, mapas, cronogramas, habilitações, preços e arredondamento; não transformar exemplos das entrevistas em regras legais.
- Validar a utilidade das capacidades Maybe sem as promover automaticamente a Now ou Later.
- Verificar fontes, APIs, licenças e cobertura numa tarefa separada antes de qualquer integração real.
