# Cairn — contexto do produto

## Organização

- [Now](now/funcionalidades.md): funcionalidades prioritárias.
- [Termos por definir (Now)](now/termos-por-definir.md): vocabulário a confirmar.
- [Especificação do protótipo Now](now/especificacao-prototipo.md): comportamento implementado no protótipo principal.
- [Later](later/funcionalidades.md): funcionalidades pretendidas para depois.
- [Maybe](maybe/funcionalidades.md): ideias a validar antes de compromisso.
- [Never](never/funcionalidades.md): exclusões deliberadas.
- [Transcriptions](transcriptions/): entrevistas e notas originais, com numeração de origem.
- [System](system/): [ideia inicial](system/ideia_inicial.txt) e [contrato do protótipo interativo](system/prototype.md).
- [Research](research/): [questões de investigação](research/README.md), [investigação técnica](research/pesquisa_arquitetura_cairn.md), [pesquisa de mercado](research/pesquisa_mercado_cairn.md) e [fluxo de capturas e anotações](research/screenshots/canvas-workflow.md).

O wireframe interativo mostra as funcionalidades futuras; o protótipo principal mostra as que estão em decisão agora (hoje, Now). Quando uma funcionalidade ganha protótipo principal, sai do wireframe. Em cada implementação, evolui-se o mesmo código: primeiro estrutura e comportamento, depois design visual próximo da produção. UX e UI são revistas ao longo dessa evolução. Mockups são representações visuais de apoio, normalmente estáticas; não substituem o protótipo interativo.

## Quatro níveis de prioridade

- **Now:** descoberta e consulta de obras do Diário da República: mapa, assistente, vista do concurso e filtros.
- **Later:** funcionalidades pretendidas para produção posterior, incluindo a decisão de participar, o dossier, a checklist, os preços e a passagem à plataforma, adiados de Now pela T3.
- **Maybe:** ideias que precisam de validação antes de compromisso de produção.
- **Never:** exclusões deliberadas do produto, não apenas de uma fase.

Now tem 6 funcionalidades (N01–N04, N13 e N14); Later tem 18 (L01–L18); Maybe tem 14 (M01 e M03–M15); Never tem 3 (X01–X03).

## Correspondência de identificadores

Uma funcionalidade que muda de nível recebe um identificador novo nesse nível; o antigo não é reutilizado. Os documentos em `research/` usam os identificadores anteriores.

| Anterior | Atual | Motivo                                    |
| -------- | ----- | ----------------------------------------- |
| N05      | L10   | Fora da lista Now da T3.                  |
| N06      | L11   | Fora da lista Now da T3.                  |
| N07      | L12   | Decisão de participar adiada.             |
| N08      | L13   | Dossier adiado na T3.                     |
| N09      | L14   | Checklist adiada na T3.                   |
| N10      | L15   | Preparação da proposta adiada.            |
| N11      | L09   | Adiado antes da T3.                       |
| N12      | L16   | Plataforma (AcinGov) deixada para o fim.  |
| M02      | N13   | Assistente central escolhido na T3.       |
| —        | N14   | Filtros, nova na T3.                      |
| —        | L17   | Navegação pelo assistente, nova na T3.    |
| —        | L18   | Vista agrupada por fases, nova na T3.     |
| —        | M13   | Mapa 3D, nova na T3.                      |
| —        | M14   | Caixa de entrada de anúncios, nova na T3. |
| —        | M15   | Conversas por fase, nova na T3.           |
| —        | X01   | Trajetos rejeitados na T3.                |
| —        | X02   | Distritos rejeitados na T3.               |
| —        | X03   | Exclusão automática rejeitada na T3.      |

A classificação é uma decisão de produto, não uma divisão da interface. O protótipo interativo cobre toda a experiência de Now, Later e Maybe. Demonstrar uma capacidade não altera a prioridade, não confirma a viabilidade de integração e não constitui compromisso de produção. Gantt/Microsoft Project permanece Maybe.

## Estatuto das fontes e convenções

As prioridades foram acordadas com o utilizador, mas ainda precisam de validação com o entrevistado. As entrevistas são textos revistos com trechos incertos; não são regras jurídicas nem documentação de APIs. T1, T2 e T3 identificam as entrevistas, não versões de documentos derivados. T1 e T2 citam secções; T3 cita instantes da gravação.

Só os registos em `transcriptions/` usam numeração de entrevista. Os documentos derivados têm nomes descritivos e são atualizados diretamente, com histórico no Git; não se criam conjuntos `transcricao_3_*` ou snapshots numerados.

Para a experiência completa e os limites técnicos da demonstração, prevalece [system/prototype.md](system/prototype.md).

## Nova transcrição

1. Coloque o ficheiro em `transcriptions/` e integre-o em `main` através de um PR com a label `transcription` (por exemplo, `gh pr create --label transcription`). Faça o mesmo quando o ficheiro foi criado localmente: o único circuito corre no GitHub.
2. Só o merge de um PR com essa label, ou do PR do próprio circuito, inicia o circuito. O [workflow](../../.github/workflows/agent-incorporate-transcription.yml) aplica a [skill](../../.agents/skills/incorporate-transcription/SKILL.md) e abre um PR seguinte com as atualizações dos documentos derivados e do [wireframe interativo](../../apps/web/references/interactive-wireframe.tsx), para revisão.
3. Registe o feedback duradouro da revisão em [`.github/agent-memory/incorporate-transcription.md`](../../.github/agent-memory/incorporate-transcription.md). Cada execução carrega esse ficheiro.

O workflow também pode ser iniciado manualmente no GitHub Actions. Para o testar, envie uma transcrição de teste para um branch e execute `gh workflow run agent-incorporate-transcription.yml --ref <branch>`: a execução manual usa esse branch, e o PR aberto contra `main` inclui também o ficheiro de teste. Depois da revisão, feche esse PR sem merge, porque enquanto estiver aberto um PR com a label `agent-incorporate-transcription` o circuito ignora as execuções reais.

## Validação pendente

- Confirmar as necessidades e percursos com o entrevistado, incluindo os de Later e Maybe.
- Confirmar os exemplos de campos, documentos, mapas, cronogramas, habilitações, preços e arredondamento; não transformar exemplos das entrevistas em regras legais.
- Validar a utilidade das capacidades Maybe sem as promover automaticamente a Now ou Later.
- Verificar fontes, APIs, licenças e cobertura numa tarefa separada antes de qualquer integração real.
