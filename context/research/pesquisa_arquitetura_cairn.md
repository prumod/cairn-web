# Investigação técnica end-to-end — Cairn

**Idioma:** Português (Portugal) · **Acesso de pesquisa:** 07-10-2026 · **Natureza:** investigação técnica com recomendações; não é aprovação do entrevistado, compromisso de implementação, protótipo construído nem aconselhamento jurídico.

**Atualização de âmbito:** esta investigação foi escrita com a hipótese de um protótipo limitado a Now. Essa hipótese, as recomendações de painel Later/Maybe estático e o respetivo roteiro estão superados pelo [contrato atual do wireframe](../system/wireframe.md): experiência completa de Now, Later e Maybe, sem estilos, com dados fictícios e ações locais simuladas; prioridades apenas em código/comentários/documentação. O restante texto preserva as conclusões e recomendações originais, não é autorização para integrações nem especificação atual do wireframe.

## Resumo executivo

O repositório contém apenas um frontend scaffold React/Vite; o backend e os deploys pretendidos Vercel/Railway ainda não estão configurados [README.md, «Deployment target»]. O primeiro protótipo deve ser deliberadamente offline, demonstrativo e sem efeitos externos: fixtures fictícias determinísticas, estado local reiniciável, sem API, ficheiros reais, autenticação, fonte pública, integração ou submissão verdadeira. O limite funcional é Now N01–N12 até **submissão simulada**, Later L01–L08, Maybe M01–M12, Never vazio; Gantt/Microsoft Project é Maybe M01, não Later [prioridades atuais](../README.md).

Para produção, recomendação (inferência): começar por monólito modular HTTP/API + PostgreSQL gerido, armazenamento privado de objetos e worker assíncrono, preservando módulos/domínios e separação por tenant desde o início; não há justificação atual para microserviços. A dependência de dados públicos não pode ser tratada como resolvida: a API BASE tem documentação e exige token, mas o processo de concessão, cobertura, limites e qualidade ainda carecem de validação; para Diário da República foi localizada base legal para acordos de acesso automatizado, mas não uma especificação pública de API. Não integrar submissão ou assinatura em Cairn sem validação contratual, técnica e jurídica específica.

## 1. Escopo, evidência local e confiança

### Ficheiros locais efetivamente consultados

A investigação original leu os 19 ficheiros de contexto então existentes e o README. Esta reorganização não constitui uma nova consulta de fontes externas. As localizações atuais dos materiais preservados são:

- [README do repositório](../../README.md): scaffold, comandos e intenções de deployment.
- [Prioridades](../README.md), desdobradas em [Now](../now/funcionalidades.md), [Later](../later/funcionalidades.md), [Maybe](../maybe/funcionalidades.md) e [Never](../never/funcionalidades.md): 32 funcionalidades; Gantt em Maybe e Never vazio.
- [Diagramas Now](../now/diagrams.md): estados da participação, entidades, fluxo e percurso principal, até submissão simulada.
- [Diagramas do sistema](../system/diagrams.md): estados, entidades e fluxo mais amplo; inclui também o percurso principal Now como vista de contexto.
- [T1](../transcriptions/transcricao1_gestao_obras.md): entrevista revista, especialmente fontes, propostas, convites, prazos, cotações e pós-obra.
- [T2](../transcriptions/transcricao2_gestao_obras.txt): entrevista revista, especialmente descoberta, plataformas, habilitações e fluxo após entrega.
- [Mapeamento de plataformas](../transcricao1_mapping-plataforma-dados.txt): conceitos e atribuições por confirmar; deixado intacto.
- [Ideia inicial](../system/ideia_inicial.txt): capacidades exploratórias, não âmbito aprovado por si só.
- [Pesquisa de mercado](pesquisa_mercado_cairn.md): contexto de concorrência e maturidade, não repetido.
- [Notas visuais](<../transcriptions/transcricao1_Notas Iniciais Projeto.jpeg>): Excel/Sage, DR/BASE/AcinGov, mapas e tarefas; Project não utilizado pelo entrevistado.

Os quatro diagramas obsoletos derivados da primeira entrevista também foram consultados na investigação original, mas foram removidos nesta reorganização. O histórico permanece no Git; não são especificação atual.

**Falhas de leitura na investigação original:** nenhuma. Relatos e exemplos das entrevistas não são regras jurídicas nem contratos de interface. Para o âmbito atual do wireframe prevalece [system/wireframe.md](../system/wireframe.md).

### Etiquetas usadas

- **Facto de fonte:** explicitamente documentado numa fonte primária ou ficheiro local.
- **Recomendação:** decisão técnica proposta, não facto de fonte.
- **Inferência:** interpretação desta investigação, explicitamente assinalada.
- **Confiança:** alta para factos explícitos; média para inferências arquiteturais; baixa/por validar para acesso, coverage e operação de integração.

## 2. Protótipo Now: arquitetura sem dados

**Recomendação:** frontend estático React/Vite, sem servidor e sem chamadas de rede; fixtures TypeScript/JSON versionadas e exclusivamente fictícias; cálculo local puro; estado descartável em memória (ou armazenamento local explicitamente demonstrativo); botão «Reiniciar demonstração» limpa tudo e volta ao estado inicial. Manter os dados numa camada `demo/fixtures`, repositórios simulados e selectors puros para que a UI não se acople a serviços futuros. Não incluir tokens, telemetria de conteúdo nem pedidos de rede.

Fixtures determinísticas: conjunto pequeno com anúncio relevante, convite, pesquisa vazia, dado de habilitação em falta/incompatível, preparação incompleta, prazo vencido e caso pronto. Utilizar identificadores, entidades, locais, datas e valores inequivocamente fictícios; data de referência fixa para N05; coerência dos mesmos resultados no mapa/lista/prazos. Coordenadas podem ser fictícias; mapa apenas ilustrativo. Não mostrar dados atuais do governo nem alegar que a classe/licença está validada [funcionalidades Now, N01–N07](../now/funcionalidades.md) e [contrato atual do wireframe](../system/wireframe.md).

Estados de UI: inicial; carregamento local (se visualmente útil); resultados/vazio; detalhe; decisão «participar/não concorrer»; preparação com faltas; prazo ultrapassado; pronto; modal/painel de simulação e confirmação final. A simulação só ocorre no cenário completo e dentro do prazo; revisão permite regressar a preparação; recusa e expiração encerram localmente. Indicar persistentemente «Demonstração — dados fictícios; nenhuma submissão será enviada» e, ao concluir: «Submissão simulada — nenhum documento foi enviado». Não apresentar botão operacional que possa ser confundido com ação real. Bloquear uploads reais; usar pré-visualizações incluídas no bundle. Reset também apaga os estados locais.

**Garantia anti-submissão (recomendação de segurança):** não definir endpoint de submit, SDK/credenciais de plataforma, links acionáveis que imitem submissão, e-mail, assinatura, compra de selos, scrape ou envio de documentos; nenhuma dependência ou evento UI deve alcançar plataformas. Teste de arquitetura automatizado: falhar se fixtures/endpoints incluem URLs de produção, e2e observar `requestfailed`/nenhum tráfego externo ao completar. O protótipo não recolhe dados pessoais. O painel Later/Maybe é apenas estático; particularmente M01 Gantt não vira ecrã funcional.

## 3. Produção: topologia e limites

### Estado atual comprovado

`README.md`: frontend privado em `web/`, Bun workspace, Vite + React, Node 22.12+ para builds Vercel, comandos `bun run check`, backend separado não scaffolded; deploy Vercel pretendido mas não ligado; Railway pretendido para backend; scaffold sem autenticação/backend; sem testes automatizados nem CI. Portanto os nomes de fornecedores são intenção, não configuração ou serviço operacional.

### Recomendação

1. **Vercel:** servir bundle SPA estático e previews por PR; separar envs Preview/Production e nunca pôr segredos no bundle client. README já sugere root repo, install `bun install --frozen-lockfile`, build `bun run build`, output `web/dist`. Vercel documenta ambientes Preview/Production com variáveis separadas [Vercel, Environments, acesso 07-10-2026, https://vercel.com/docs/deployments/environments].
2. **Railway:** serviço backend API containerizado, health/readiness endpoint, migrations executadas em release controlado, logs e métricas. Não assumir deploy configurado. Railway documenta health check durante deploy, mas não substitui monitorização contínua; serviço com volume tem limitações de deploy concorrente [Railway, Healthchecks, https://docs.railway.com/deployments/healthchecks; Volumes, https://docs.railway.com/volumes/reference].
3. **Arquitetura:** monólito modular por domínio (opportunities/provenance, participation, proposal, pricing, identity/tenancy, ingestion), uma API versionada (`/api/v1`), PostgreSQL e worker separado no mesmo código/repo/processo de deploy independente quando houver tarefas. Usar outbox + fila para ingestão, evitando chamada externa síncrona ao consultar UI. Microserviços só se escala/equipa/limites operacionais justificarem; não há agora evidência dessa necessidade (inferência, confiança média).
4. **Dados:** PostgreSQL gerido; ficheiros em object storage privado, metadados/versões no SQL, URLs temporárias assinadas e verificação de malware. Railway documentação alerta para persistência associada a volume e aconselha backup/PITR/offsite; backups nativos têm janelas/restrições [Railway, Postgres backups & restores, https://docs.railway.com/guides/postgres-backups-restores]. Para produção, comparar Postgres gerido com backup fora do mesmo projeto/fornecedor e testar restauração; não depender só de snapshot local.
5. **API boundary:** browser nunca acede diretamente a DB, API BASE, storage permanente ou credenciais de fornecedores. Backend autentica cada request, valida schema/limites, autorização por objeto/tenant, quotas, idempotência para comandos, regista correlation ID e trata erros. Documentar OpenAPI e contrato/versão, rate limit e paginar.
6. **Ingestão assíncrona:** scheduler + conector por fonte com checkpoint cursor/data, retries limitados com backoff, deduplicação e dead-letter; guardar payload bruto permitido, hash, origem, timestamp de recolha, revisão/schema, URL e estado de validação. Normalizar em entidade de oportunidade sem apagar versão bruta. Monitorizar freshness, cobertura, erros e atraso; UI comunica «fonte atualizada em…», «parcial» e falha. Desativar connector se termos/acesso mudarem.

## 4. Modelo de domínio, versão, proveniência e dinheiro

Modelo mínimo de produção (recomendação; não implica antecipar módulos Later):

- `Tenant/Organization`, `User`, `Membership` e roles; `CompanyProfile` por tenant (localização, habilitações declaradas, sem inferir elegibilidade automática).
- `Source` + `SourceRecord`/`OpportunityVersion`: identificador externo, URL, tipo (anúncio/convite), entidade, CPV se documentado, valores/descrições/prazos, datas de publicação/observação, origem, confiança/cobertura, hash e payload bruto autorizado. Correções fazem nova versão, não overwrite silencioso.
- `Participation` (empresa × procedimento), `Proposal` (versões/draft), `RequirementSnapshot`, `DocumentChecklistItem`, `ProposalDocument` (metadados/status/hash/object key), `BillOfQuantities`/`LineItem`, `FinancialSchedule`/periods, `SubmissionSimulation` apenas no demo. Produção real posterior requer modelo separado e decisão de âmbito.
- Estados: workflow da empresa separado do lifecycle do procedimento. Guardar transições como eventos/audit; transição válida apenas por comando e precondições; `Ready` depende de checklist e itens de preço, não significa validade jurídica; submissão simulada não se converte em submetida. Prazo de execução não se confunde com deadline de proposta; valor base/anunciado não se confunde com valor proposto/adjudicado [diagramas Now e estados].
- Invariantes a validar com utilizador: máximo uma participação ativa por empresa/procedimento; transições permitidas; submissão demo apenas com proposta completa/dentro da data de referência; requisito/doc pode ser obrigatório/opcional/por confirmar; versões de proposta congeladas no momento de revisão; aceitar correcções sem perder trilho.
- Proveniência: cada campo normalizado liga a um registo de fonte, data de extração, localizador (URL/secção/ficheiro), versão e estado humano (não revisto/revisto/corrigido). Não transformar anotações em fonte governamental. Reter matéria bruta segundo termos e política, minimizando cópias.
- Multi-tenant desde primeira versão com dados reais: tenant_id em toda linha, FK composta ou verificações, contexto tenant derivado da identidade verificada (nunca confiar em tenant_id fornecido pelo cliente). RLS PostgreSQL como segunda barreira, não substituto de autorização. Donos/superusers podem contornar RLS e policies têm semântica permissive/restrictive; testar com roles não-owner e FORCE RLS quando adequado [PostgreSQL, Row Security Policies, acesso 07-10-2026, https://www.postgresql.org/docs/current/ddl-rowsecurity.html].
- Dinheiro: EUR, guardar unidades menores inteiras (cêntimos) ou NUMERIC decimal exato com escala explícita, não binary float; quantidades podem precisar precisão separada da moeda. Especificar por item: base × quantidade, escala/preço unitário, regras de IVA/descontos e ponto de arredondamento; arredondar explicitamente ao cêntimo por linha vs total e preservar valor bruto/derivado. Testes de fronteira e totais. A margem de 25% da T1 §11 é exemplo incerto, não regra; Now N10 não inclui margem automática. Guardar taxas/percentagens como decimal e validar soma 100% quando aplicável; cronograma N11 demonstrativo, não previsão contabilística.

## 5. Fontes públicas e integrações de procurement (estado em 07-10-2026)

Separar **documentação de acesso**, **método tecnicamente documentado**, **credenciais operacionais**, **cobertura/latência** e **termos**. Entrevistas e diagramas levantam hipóteses apenas.

### Portal BASE / IMPIC

**Verificado diretamente:** a documentação REST oficial em https://www.base.gov.pt/APIBase2 lista operações de consulta de contratos, anúncios, modificações contratuais e entidades, e exige o header `_AcessToken`. A página consultada não documenta emissão self-service do token.

**Encontrado apenas em resultados indexados oficiais — não verificado diretamente:** a notícia BASE/IMPIC de 2025 e a página sobre formas de obter dados parecem descrever um pedido de acesso pelo Helpdesk com aprovação/token e opções de dados abertos/extração, incluindo limitações e diferenças de atualização/completude. As páginas correspondentes devolveram HTTP 404 no fetch desta investigação. Tratar estes detalhes como pistas a confirmar, não como factos estabelecidos.

**Fontes:** BASE, «API REST Documentation», https://www.base.gov.pt/APIBase2 (consultada 07-10-2026); IMPIC, «API para consulta de dados do Portal Base» (07-05-2025), https://www.base.gov.pt/Base4/pt/noticias/2025/api-para-consulta-de-dados-do-portal-base/ (resultado indexado; página não obtida); IMPIC, «Formas de obter dados sobre os contratos públicos», https://www.base.gov.pt/Base4/pt/documentacao/formas-de-obter-dados-sobre-os-contratos-publicos/ (resultado indexado; página não obtida).

**Implicação e validação:** a documentação de endpoints não comprova que Cairn obterá credenciais nem define concessão real, schema estável, rate limits, sandbox, SLA, histórico, cobertura geográfica ou termos de reutilização. Confirmar estes pontos por canal oficial; testar amostra de anúncios/contratos conhecida e comparar IDs/datas com o DR antes de estimar ingestão. Estatísticas agregadas não demonstram cobertura suficiente.

### Diário da República / INCM

Lei n.º 68/2021 estabelece regime de dados abertos/reutilização e prevê formatos legíveis por máquina/API para certos dados dinâmicos, com exceções e condições; DL n.º 10/2023, art. 149.º alterou DL 83/2016 para permitir à INCM plataformas baseadas em atos publicados e acordos gratuitos ou pagos para acesso automatizado. Fontes primárias: DR, Lei 68/2021, https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2021-170221049 e PDF oficial https://files.dre.pt/1s/2021/08/16600/0000200035.pdf; DR, Decreto-Lei 10/2023, art. 149.º, https://diariodarepublica.pt/dr/detalhe/decreto-lei/10-2023-207177836; INCM, Diário da República, https://incm.pt/site/diario-da-republica/ (acesso 07-10-2026). **Não localizado** nesta pesquisa um catálogo público de API de anúncios/contratação com schema, credenciais, SLA ou política de recolha automatizada. Isso não demonstra inexistência. Pedir à INCM documentação/acordo e clarificar se se cobre anúncio de concurso e anexos; não fazer scraping até haver autorização/termos verificados.

### dados.gov.pt

O portal de dados abertos é um ponto de descoberta de conjuntos e metadados; resultados de pesquisa para IMPIC apresentam datasets de contratos/anúncios/modificações: https://dados.gov.pt/pt/datasets/?q=impic (resultado pesquisado em 07-10-2026). O fetch devolveu HTTP 503. Não se confirmou diretamente formato, licença, data de atualização, esquema nem cobertura de cada dataset; inspecionar ficha e recurso antes de usar. Dataset descarregável não é sinónimo de API operacional adequada a near-real-time.

### IMPIC alvarás/licenças

Os resultados de pesquisa sobre o Relatório de Atividades IMPIC 2024 sugerem que uma proposta de web service para consultar alvarás/certificados/licenças imobiliárias estava «em stand-by» no contexto do DL 49/2024; **não consegui verificar a passagem no PDF**. Mesmo se correta, refere licenças de mediação imobiliária e não prova endpoint para alvarás de empreiteiro nem disponibilidade geral. Fonte a confirmar: IMPIC, Relatório de Atividades 2024, https://www.impic.pt/impic/assets/misc/img/informacao_institucional/relatorio_atividades/RelatorioAtividades_2024.pdf (resultado indexado; extração textual insuficiente). Tentar pesquisa pública/validação manual como hipótese; não prometer API nem decisão de elegibilidade automática.

### eSPap / CNCP

A eSPap documenta CNCP associado ao SNCP e acordos-quadro, com acesso por SAC e aplicações próprias; plataforma eletrónica SNCP é para procedimentos ao abrigo dos seus acordos. Fonte: eSPap, «Sobre o Portal», https://www.compraspublicas.espap.gov.pt/Paginas/Sobre.aspx; «Sistema de Autenticação e Credenciação», https://www.sac.espap.gov.pt/sac/Geral/; «Plataforma Eletrónica de Contratação», https://www.espap.gov.pt/FrontEnd/Paginas/Areas/SP_CP/SP_CP_HomePage_tpl_2.aspx (acesso 07-10-2026). Relatórios mencionam web services/interoperabilidade interna; **não foi localizada API pública aberta para Cairn**. CNCP trata catálogo/acordos-quadro de bens/serviços; não deve ser confundido com feed completo de concursos públicos de empreitada. Acesso e utilidade dependem de perfil/credenciais SNCP.

### acinGov e VORTAL

acinGov ajuda/FAQ oficial descreve fluxo de utilizador, peças, upload, assinatura/submissão, avisos e suporte; não foi encontrada especificação pública API para fornecedores com endpoints/auth/OpenAPI. Fonte: acinGov, Ajuda, https://apps.acingov.pt/acingovprod/2/index.php/zonaPublica/zona_publica_c/indexAjuda (acesso 07-10-2026). VORTAL documenta integrações de serviço com ERP/BASEgov em páginas comerciais, mas não uma API pública self-service; pedir contrato, documentação e sandbox a fornecedor. Fonte: VORTAL, FAQ https://www.vortal.biz/pt-pt/faq/ e INCM BaseGov https://site.vortal.biz/incm-basegov/ (acesso 07-10-2026). Entrevistas mencionam plataformas/convites/submissão, mas não comprovam que Cairn possa integrar. A decisão Now fixa entrega real fora do protótipo.

**Cobertura/frescura/termos:** relatórios estatísticos mostram volume comunicado, não cobertura completa ou garantia de atualização; comparar amostra com a fonte primária, medir atraso, duplicados, campos em falta, alterações, anexos, convites e procedimentos não abertos. Verificar termos/licenças, limites, redistribuição e retenção por fonte. Nunca converter «não localizei API» em «API não existe».

## 6. Fronteira de envio, assinatura e eIDAS

No prototype, nada é transmitido, assinado, comprado ou validado. Em eventual produção, manter explicitamente separados: draft Cairn; pacote exportado pelo utilizador; autenticação/assinatura; receção e confirmação da plataforma. Recomendação: primeiro exportação assistida/link para plataforma, sem operar credenciais do cliente; integração formal somente com API autorizada, sandbox, acordo de operador, idempotência, confirmação verificável, tratamento de recusas/timeout e prova/audit de entrega. Nunca dizer «submetida» sem confirmação autoritativa da plataforma.

eIDAS (Regulamento (UE) 910/2014) art. 25: uma assinatura não pode ser privada de efeito legal/admissibilidade apenas por ser eletrónica/não qualificada; assinatura eletrónica qualificada tem efeito equivalente à manuscrita e certificados qualificados de um Estado-Membro são reconhecidos nos outros. Fonte EUR-Lex, versão consolidada https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02014R0910-20241018 (acesso 07-10-2026). Isto **não** determina por si só qual assinatura/procedimento é exigido em cada concurso, nem substitui condições técnicas da plataforma ou aconselhamento jurídico. Cairn não deve capturar chaves privadas, certificados ou credenciais de assinatura.

## 7. Segurança, privacidade e RGPD

RGPD exige princípios (finalidade, minimização, exatidão, retenção limitada, integridade/confidencialidade), proteção por defeito e medidas proporcionais ao risco; artigos 32/33 incluem segurança e notificação de certas violações em até 72 horas; DPIA antes de tratamento provavelmente de alto risco. Fonte: EUR-Lex, Regulamento (UE) 2016/679, arts. 5, 25, 32, 33, 35, https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng (acesso 07-10-2026). Isto é descrição da lei, não aconselhamento.

**Recomendações de engenharia:**

- Threat model e inventário/classificação de dados antes de autenticação/ficheiros. Minimizar dados pessoais; distinguir pessoas de contacto profissional e dados sensíveis (ex. registo criminal citado na T2 §15) e excluir estes últimos do MVP salvo base/finalidade aprovadas.
- Isolamento tenant por autorização no backend em todos os objetos, testes negativos BOLA/IDOR, autorização também a nível de propriedades e funções admin. OWASP API Security Top 10 2023 inclui Broken Object Level Authorization, Property Level Authorization e Function Level Authorization: https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/, `/0xa3-broken-object-property-level-authorization/`, `/0xa5-broken-function-level-authorization/` (acesso 07-10-2026). Não confiar em UUID obscuro como controlo.
- Segredos em gestor de segredos, rotação, mínimo privilégio, MFA para operadores, cookies seguros/CSRF conforme mecanismo, CSP, CORS restrito, limites e validação. TLS em trânsito, cifragem em repouso, chave/storage separados.
- Ficheiros: allowlist formatos/tamanho, nomes gerados, storage privado fora do webroot, MIME real e magic bytes, malware scan/quarentena, download autorizado assinado e curto; PDF/Office são conteúdo não confiável, sem execução/renderização ativa, macros ou instruções de conteúdo. Não analisar anexos de origem externa com IA sem isolamento, política de retenção e validação humana. Registar hash e proveniência.
- Auditoria append-only de autenticação, acessos/exportações, transições e alterações de permissões; não registar tokens nem conteúdo documental sensível nos logs. Definir retenção/apagamento, exportação de dados, processo de incidente e exercício de restauração.
- Backups cifrados, segregados e restore testado, RPO/RTO acordados. DPA/subcontratantes, localização, transferências internacionais e DPIA/ROPA/base jurídica devem ser avaliados com responsável de proteção de dados/jurista antes de production.

## 8. Integrações ordenadas por valor/risco

Ordem recomendada (inferência; baixo a alto risco):

1. **Dados demo / importação manual controlada** — valor para validação, risco mínimo. Now permite preços manuais; sem email real.
2. **DR/BASE read-only** — potencialmente grande valor para descoberta; risco alto de credenciais, schema, frescura, termos e anexos. Primeiro prova documental + amostra; BASE autorizado pode ser candidato a dados adjudicados; DR exige esclarecer acesso automatizado.
3. **Mapas/geocoding** — valor claro N03, mas protótipo é ilustrativo. Produção: escolher fornecedor após verificar licença, atribuição, cobertura, geocoding, custos e privacidade da localização da empresa; cache conforme termos. Não introduzir antes de ingestão/licença comprovada.
4. **E-mail/convites** — valor para N06/Later, risco elevado de escopo OAuth, conteúdo malicioso e exposição; no Now somente convite fictício. Futuro: integração mínima autorizada, read-only, mailbox segregada, não aceitar/recusar automaticamente.
5. **acinGov/VORTAL submit/e-sign** — alto valor transacional, risco muito alto (credenciais, assinatura, prazo, irreversibilidade e obrigação formal); adiar indefinidamente até documentação pública/contrato/sandbox e validação jurídica. O produto atual mantém submissão fora do Cairn.
6. **SAGE/ERP e fornecedores/cotações** — Later (L01/L06 etc.), interoperabilidade, licenças, dados financeiros e reconciliação elevam custo; validar primeiro export/import e sistema/versão exatos. Não iniciar módulo genérico nem assumir API SAGE. Integração fornecedor/email é futura e requer consentimento, trilho de preços/validade e revisão humana.

## 9. Deploy, observabilidade, testes e rollout

**CI recomendado:** PR: frozen install, format check, lint, typecheck, build (README `bun run check`); testes unitários de domínio/cálculo e componentes; testes de integração API/Postgres quando existir; E2E de percurso completo e negativo (nenhum network/submission), visual smoke; secret/dependency scan; migrations testadas em DB efémera. README diz que hoje não existe CI nem framework de testes, logo isto é recomendação, não capacidade presente. React/Vite são tecnologias atuais; React recomenda framework para novas apps de produção, mas scaffold existente pode manter SPA estática pela simplicidade e decisão do README [React, Creating a React App, https://react.dev/learn/creating-a-react-app; Vite, Building for Production, https://vite.dev/guide/build; acesso 07-10-2026].

**Observabilidade:** logs estruturados sem dados pessoais, correlation/trace IDs, métricas de erro/latência/uso; métricas por connector: atraso desde última recolha, volume, sucesso, duplicados, schema drift e cobertura. Alertas por frescura e falha; painel operacional. Health/readiness e liveness distintos. Não considerar healthcheck de deploy Railway como monitorização contínua [Railway, Healthchecks].

**Rollout por gates:** (0) prototype estático e usabilidade com dados falsos; (1) decisão sobre produto e requisitos, exemplos anonimizados aprovados; (2) prova de acesso/cobertura/licenças a uma fonte read-only sem utilizadores; (3) alpha autenticada com tenants de teste, documentos fictícios, audit/RLS, restore; (4) piloto fechado e só read-only com termos/acesso acordados, suporte/incidentes e métrica de qualidade; (5) expansão por fonte/funcionalidade após gate de segurança, cobertura e valor; submissão real permanece fora até decisão separada. Rollback por feature flag e connector disable; migrations compatíveis para trás.

## 10. Roteiro de validação end-to-end

1. **Prototype Now:** implementar apenas N01–N12 local e demonstrativo; validar percurso com entrevistado sem recolher ficheiros reais. Critérios: reset, invariantes de estados, valores, prazo e aviso anti-envio testados.
2. **Descoberta de domínio:** rever requisitos/documentos reais anonimizados com autorização, mapear estados/prazos/regras por tipo de procedimento; determinar o que é texto do anúncio vs decisão humana. Validar moeda, IVA, quantidades, arredondamento e estrutura do mapa.
3. **Viabilidade das fontes (spike isolado):** pedir acesso BASE pelo canal oficial; solicitar documentação INCM; examinar ficha e licença de datasets dados.gov; perguntar à acinGov/VORTAL/esPAP sobre API, sandbox, contratos e limites; medir cobertura/frescura contra amostra manual. Não integrar enquanto não houver autorização.
4. **Arquitetura production readiness:** escolher identidade, tenancy, storage, DB gerida/backup, fila, observabilidade, threat model, política de retenção, contratos de processamento e CI. Testar restore e isolamento cruzado.
5. **Alpha read-only:** oportunidades com proveniência explícita, falhas e desatualização visíveis; revisão humana. Medir precisão de campos e atraso, não só número de resultados.
6. **Preparação real (se aprovada):** importação/manual de documentos e cálculo com exact decimal, versionamento e audit; exportação sob controlo do utilizador. Ainda sem submissão e assinatura.
7. **Gates de expansão:** decidir separadamente Later/M, especialmente fornecedores/email/ERP. M01 Gantt permanece Maybe; nunca assumir compromisso Later. Submissão externa só após autorização formal e análise autónoma.

### Ameaças principais

- Acesso/token indisponível ou revogado; termos que proíbem redistribuição; schema/serviço instável.
- BASE incompleto/atrasado para anúncios face ao DR, anúncio corrigido, link quebrado, dados duplicados, convites que não estão na fonte pública.
- Falso positivo de raio/localização, erro de elegibilidade ou prazo, timezone e confusão entre preço base e preço proposto.
- Fuga entre tenants/IDOR ou URLs de ficheiro expostas; prompt injection ou malware em anexos; credenciais em logs; dependência de fornecedor.
- Corrupção/erro de arredondamento, versão de proposta sobrescrita; submissão duplicada/incorreta se um dia integrada.
- Dependência operacional de Railway/volume, backup que não restaura, secret/Preview exposto.

### Questões em aberto / ações mais úteis

1. Entrevistado confirma N01–N12 e fornece pacote de exemplo anonimizável (mapa, checklist, cronograma)? Como representa prazo e IVA? Qual regra de rounding aceita?
2. BASE concede token ao projeto? Qual schema/documentação atual, limite, refresh, histórico, uso/reutilização, SLA e cobertura de anúncios/obras? Medir amostra real antes de arquitetura de ingestion.
3. INCM tem API/licença/sandbox para atos/anúncios e anexos? Quais custos/limites/termos?
4. O que os datasets concretos dados.gov cobrem e quando atualizam? Qual dataset é substituto/espelho e que licença se aplica?
5. IMPIC disponibiliza pesquisa ou serviço de alvarás para habilitações de empreiteiros? Resultados indexados sobre o relatório de 2024 sugerem uma proposta de web service diferente e em stand-by; confirmar diretamente com o IMPIC.
6. AcinGov/VORTAL/eSPap têm API de consulta ou integração destinada a fornecedor, e em que condições? Separar API interna de plataforma de interface operacional pública.
7. Quem é controller/processor por conjunto de dados; quais categorias pessoais e retention? Há necessidade de DPIA? Como tratar anexos e dados de representantes?
8. Para operação: orçamento, equipa, volume esperado, região, frescura exigida, RPO/RTO, residência de dados, auth/SSO e suporte.

## 11. Contradições e limites

- As entrevistas descrevem Diário da República e Portal BASE e sugerem API; isso é evidência de fluxo/hipótese, não prova técnica. A documentação oficial BASE consultada confirma uma API condicionada; o estado de concessão e cobertura continua desconhecido.
- Lei 68/2021 contém regime para dados abertos/API de dados dinâmicos, mas DL 10/2023 também prevê acordos gratuitos/pagos para acesso automatizado de atos pela INCM. Não interpretar o quadro como autorização geral para scraping irrestrito.
- Os diagramas Now delimitam esse percurso em submissão simulada, não a totalidade da demonstração. A hipótese original de protótipo Now está superada: o [wireframe atual](../system/wireframe.md) inclui Now, Later e Maybe, mantendo as prioridades de produto separadas da experiência.
- `pesquisa_mercado_cairn.md` aponta concorrentes e capacidades, mas não demonstra adequação comprovada a todos os requisitos nem substituto único; esta nota não repete ranking comercial.
- Fetch oficial falhou em algumas URLs (BASE métodos/anúncio API: HTTP 404; dados.gov: 503; DRE DL com conteúdo dinâmico; PDF IMPIC com extração textual insuficiente). Isto limita confirmação direta dos detalhes, não permite concluir indisponibilidade. Confirmar páginas e passagens junto das entidades antes de decisões.

## 12. Fontes consultadas e prioridade

Fontes institucionais/primárias mantidas (todas consultadas em 07-10-2026):

- **BASE/IMPIC, API REST Documentation** — endpoints e autenticação: https://www.base.gov.pt/APIBase2
- **BASE/IMPIC, Formas de obter dados sobre contratos públicos** — opções, atualização/limites; pesquisa indexada, fetch atual 404: https://www.base.gov.pt/Base4/pt/documentacao/formas-de-obter-dados-sobre-os-contratos-publicos/
- **BASE/IMPIC, API para consulta de dados do Portal BASE (2025)** — pedido de acesso; pesquisa indexada, fetch atual 404: https://www.base.gov.pt/Base4/pt/noticias/2025/api-para-consulta-de-dados-do-portal-base/
- **IMPIC, Relatório de Atividades 2024** — pesquisa indexada sugere contexto de web service em stand-by; extração PDF insuficiente para confirmar: https://www.impic.pt/impic/assets/misc/img/informacao_institucional/relatorio_atividades/RelatorioAtividades_2024.pdf
- **DR, Lei 68/2021** https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2021-170221049; **PDF oficial** https://files.dre.pt/1s/2021/08/16600/0000200035.pdf
- **DR, DL 10/2023** https://diariodarepublica.pt/dr/detalhe/decreto-lei/10-2023-207177836; fetch dinâmico, usado com pesquisa da própria entidade.
- **dados.gov.pt — pesquisa IMPIC** https://dados.gov.pt/pt/datasets/?q=impic — descoberta de dataset; cobertura/licença por ficheiro pendente.
- **eSPap CNCP / SAC** https://www.compraspublicas.espap.gov.pt/Paginas/Sobre.aspx ; https://www.sac.espap.gov.pt/sac/Geral/ — acesso restrito/contextual, não API pública demonstrada.
- **acinGov Ajuda** https://apps.acingov.pt/acingovprod/2/index.php/zonaPublica/zona_publica_c/indexAjuda — workflow da plataforma, não especificação API.
- **VORTAL FAQ / BaseGov** https://www.vortal.biz/pt-pt/faq/ ; https://site.vortal.biz/incm-basegov/ — integrações ofertadas; documentação developer pública não localizada.
- **EUR-Lex GDPR** https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng — obrigações RGPD.
- **EUR-Lex eIDAS** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02014R0910-20241018 — efeitos de assinatura qualificada.
- **OWASP API Security Top 10 2023** https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/ (e API3/API5 nas ligações acima).
- **PostgreSQL RLS** https://www.postgresql.org/docs/current/ddl-rowsecurity.html.
- **Vercel Environments** https://vercel.com/docs/deployments/environments.
- **Railway Healthchecks / PostgreSQL backups** https://docs.railway.com/deployments/healthchecks ; https://docs.railway.com/guides/postgres-backups-restores.
- **React / Vite** https://react.dev/learn/creating-a-react-app ; https://vite.dev/guide/build.

**Depriorizadas:** snippets de busca como prova final; entrevista como evidência de endpoint; websites comerciais para provar interoperabilidade contratual; páginas de terceiros/SEO sobre leis/APIs. Pesquisa de mercado local foi mantida como contexto de concorrência, conforme pedido, não repetida.

## Conclusão

A decisão técnica segura é demonstrar agora uma SPA de dados fictícios com fronteira anti-submissão testável e sem backend; em paralelo, reduzir incerteza de domínio e acesso. Para produção, preferir monólito modular com API autenticada, Postgres com isolamento tenant, object storage privado, worker de ingestão e provenance/versioning; ativar conectores individualmente apenas após evidência de acesso, licença, frescura e cobertura. As incertezas mais críticas são autorização/acesso aos dados, fidelidade dos campos e regras de negócio, isolamento multi-tenant e eventual fronteira de assinatura/envio.
