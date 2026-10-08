import { useState, type FormEvent, type ReactNode } from "react";

type Page =
  | "inicio"
  | "oportunidades"
  | "convites"
  | "prazos"
  | "proposta"
  | "acompanhamento"
  | "fornecedores"
  | "obras"
  | "recursos"
  | "materiais"
  | "financas"
  | "planeamento"
  | "pos-obra"
  | "perfil"
  | "concorrentes"
  | "assistente"
  | "historico-precos"
  | "referencias"
  | "previsoes"
  | "waterfall"
  | "mapas-avancados"
  | "padroes-contratos";

type Opportunity = {
  id: string;
  title: string;
  buyer: string;
  place: string;
  value: number;
  deadline: string;
  publishedAt: string;
  distanceKm: number;
  kind: "Anúncio" | "Convite";
  requirements: string;
  documents: string[];
  quantities: { item: string; unit: string; quantity: number }[];
};

const referenceDate = "2026-10-01";
const originalOpportunities: Opportunity[] = [
  {
    id: "obra-escola",
    title: "Reabilitação da Escola do Vale",
    buyer: "Município de Viseu",
    place: "Viseu",
    value: 284000,
    deadline: "2026-10-18",
    publishedAt: "2026-09-29",
    distanceKm: 18,
    kind: "Anúncio",
    requirements: "Classe demonstrativa 3 · alvará de construção · experiência em reabilitação",
    documents: [
      "Declaração de proposta",
      "Memória descritiva",
      "Plano de trabalhos",
      "Lista de preços",
    ],
    quantities: [
      { item: "Preparação e proteção", unit: "vg", quantity: 1 },
      { item: "Reparação de cobertura", unit: "m²", quantity: 240 },
      { item: "Pintura interior", unit: "m²", quantity: 680 },
    ],
  },
  {
    id: "obra-praca",
    title: "Arranjo da Praça da Ribeira",
    buyer: "Junta de Freguesia da Ribeira",
    place: "Coimbra",
    value: 91500,
    deadline: "2026-09-20",
    publishedAt: "2026-09-16",
    distanceKm: 74,
    kind: "Anúncio",
    requirements: "Classe demonstrativa 2 · licença de obras públicas",
    documents: ["Declaração de proposta", "Lista de preços"],
    quantities: [
      { item: "Pavimento em granito", unit: "m²", quantity: 130 },
      { item: "Mobiliário urbano", unit: "un", quantity: 8 },
    ],
  },
  {
    id: "obra-cobertura",
    title: "Substituição de cobertura do pavilhão",
    buyer: "Associação Desportiva do Centro",
    place: "Aveiro",
    value: 126000,
    deadline: "2026-10-24",
    publishedAt: "2026-10-01",
    distanceKm: 63,
    kind: "Convite",
    requirements: "Classe demonstrativa 2 · habilitação por confirmar",
    documents: ["Declaração de proposta", "Memória descritiva", "Lista de preços"],
    quantities: [
      { item: "Desmontagem da cobertura", unit: "m²", quantity: 520 },
      { item: "Painel sandwich", unit: "m²", quantity: 520 },
    ],
  },
];

const navigation: { title: string; items: { id: Page; label: string }[] }[] = [
  {
    title: "Descoberta",
    items: [
      { id: "oportunidades", label: "Anúncios e mapa" },
      { id: "convites", label: "Convites" },
      { id: "prazos", label: "Prazos" },
      { id: "assistente", label: "Pesquisa assistida" },
      { id: "concorrentes", label: "Análise de concorrentes" },
    ],
  },
  {
    title: "Propostas",
    items: [
      { id: "proposta", label: "Preparar proposta" },
      { id: "acompanhamento", label: "Acompanhamento" },
    ],
  },
  {
    title: "Trabalho",
    items: [
      { id: "obras", label: "Obras e clientes" },
      { id: "planeamento", label: "Planeamento" },
      { id: "recursos", label: "Pessoas e equipamento" },
      { id: "materiais", label: "Materiais e stock" },
      { id: "financas", label: "Finanças" },
      { id: "pos-obra", label: "Receção e garantia" },
    ],
  },
  {
    title: "Fornecedores",
    items: [
      { id: "fornecedores", label: "Fornecedores e cotações" },
      { id: "historico-precos", label: "Histórico de preços" },
      { id: "referencias", label: "Preços de referência" },
    ],
  },
  {
    title: "Análise",
    items: [
      { id: "previsoes", label: "Previsão de materiais" },
      { id: "waterfall", label: "Resumo de valores" },
      { id: "mapas-avancados", label: "Mapas e cronogramas" },
      { id: "padroes-contratos", label: "Padrões de contratos" },
    ],
  },
  { title: "Empresa", items: [{ id: "perfil", label: "Perfil da empresa" }] },
];

const pageTitles: Record<Page, string> = {
  inicio: "Visão geral",
  oportunidades: "Anúncios de obras",
  convites: "Convites recebidos",
  prazos: "Prazos de propostas",
  proposta: "Preparar proposta",
  acompanhamento: "Acompanhamento da proposta",
  fornecedores: "Fornecedores e cotações",
  obras: "Obras e clientes",
  recursos: "Pessoas e equipamento",
  materiais: "Materiais e stock",
  financas: "Finanças da obra",
  planeamento: "Planeamento da obra",
  "pos-obra": "Receção e garantia",
  perfil: "Perfil da empresa",
  concorrentes: "Análise de concorrentes",
  assistente: "Pesquisa assistida",
  "historico-precos": "Histórico de preços",
  referencias: "Preços de referência e margem",
  previsoes: "Previsão de materiais",
  waterfall: "Resumo de valores",
  "mapas-avancados": "Mapas e cronogramas",
  "padroes-contratos": "Padrões em contratos públicos",
};

const initialPrices: Record<string, number> = {
  "Preparação e proteção": 0,
  "Reparação de cobertura": 36,
  "Pintura interior": 0,
  "Pavimento em granito": 48,
  "Mobiliário urbano": 790,
  "Desmontagem da cobertura": 12,
  "Painel sandwich": 52,
};
const initialPreparedByOpportunity: Record<string, string[]> = {
  "obra-escola": ["Declaração de proposta"],
  "obra-praca": ["Declaração de proposta"],
  "obra-cobertura": ["Declaração de proposta", "Memória descritiva", "Lista de preços"],
};

function money(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <p role="status">{children}</p>;
}

export function InteractiveWireframe() {
  const [page, setPage] = useState<Page>("inicio");
  const [opportunities, setOpportunities] = useState(originalOpportunities);
  const [selectedId, setSelectedId] = useState("obra-escola");
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState("80");
  const [publicationDate, setPublicationDate] = useState("2026-10-01");
  const [showMap, setShowMap] = useState(true);
  const [notice, setNotice] = useState("");
  const [decisions, setDecisions] = useState<Record<string, string>>({
    "obra-escola": "Em preparação",
    "obra-praca": "Não concorrer",
    "obra-cobertura": "Submetida",
  });
  const [preparedDocuments, setPreparedDocuments] = useState(initialPreparedByOpportunity);
  const [prices, setPrices] = useState(initialPrices);
  const [scheduleRequirements, setScheduleRequirements] = useState<Record<string, boolean>>({
    "obra-escola": true,
    "obra-praca": false,
    "obra-cobertura": true,
  });
  const [readySchedules, setReadySchedules] = useState<Record<string, boolean>>({
    "obra-cobertura": true,
  });
  const [simulatedSubmittedId, setSimulatedSubmittedId] = useState<string | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [showDemoControls, setShowDemoControls] = useState(false);
  const [profileLocation, setProfileLocation] = useState("Viseu");
  const [profileRadius, setProfileRadius] = useState("80");
  const [licence, setLicence] = useState("Classe 3 demonstrativa");
  const [supplierQuery, setSupplierQuery] = useState("cimento");
  const [supplierName, setSupplierName] = useState("Materiais do Mondego");
  const [quotePrice, setQuotePrice] = useState("8,40");
  const [quoteValidUntil, setQuoteValidUntil] = useState("2026-10-30");
  const [quoteRows, setQuoteRows] = useState([
    {
      supplier: "Materiais do Mondego",
      material: "Cimento CEM II",
      price: 8.4,
      validUntil: "2026-10-30",
    },
    {
      supplier: "Depósito Central",
      material: "Cimento CEM II",
      price: 8.9,
      validUntil: "2026-09-15",
    },
  ]);
  const [workProgress, setWorkProgress] = useState<Record<string, number>>({
    Estrutura: 100,
    Cobertura: 55,
    Acabamentos: 15,
  });
  const [selectedTask, setSelectedTask] = useState("Cobertura");
  const [selectedDocument, setSelectedDocument] = useState("Memória descritiva");
  const [previewDocument, setPreviewDocument] = useState("Memória descritiva de demonstração.pdf");
  const [assistantQuestion, setAssistantQuestion] = useState(
    "Que anúncios de obras estão dentro do meu raio?",
  );
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [competitor, setCompetitor] = useState("Construtora do Centro");
  const [demoImport, setDemoImport] = useState("Mapa de medições de demonstração.csv");
  const [selectedWork, setSelectedWork] = useState("Reabilitação da Escola do Vale");
  const [costAmount, setCostAmount] = useState("42000");
  const [billedAmount, setBilledAmount] = useState("78500");
  const [receivedAmount, setReceivedAmount] = useState("52000");
  const [consumption, setConsumption] = useState("18");
  const [materialStock, setMaterialStock] = useState("42");
  const [advancedQuantities, setAdvancedQuantities] = useState<Record<string, number>>({});
  const [periodOne, setPeriodOne] = useState("40");
  const [periodTwo, setPeriodTwo] = useState("60");
  const [showExport, setShowExport] = useState(false);

  const selected =
    opportunities.find((item) => item.id === selectedId) ?? originalOpportunities[0]!;
  const visibleOpportunities = opportunities.filter(
    (item) =>
      `${item.title} ${item.place} ${item.buyer}`
        .toLocaleLowerCase("pt-PT")
        .includes(search.toLocaleLowerCase("pt-PT")) &&
      item.publishedAt <= publicationDate &&
      item.distanceKm <= Number(radius),
  );
  const prepared = preparedDocuments[selected.id] ?? [];
  const checklistDocument = selected.documents.includes(selectedDocument)
    ? selectedDocument
    : (selected.documents[0] ?? "");
  const financialScheduleRequired = scheduleRequirements[selected.id] ?? false;
  const scheduleReady = readySchedules[selected.id] ?? false;
  const simulatedSubmitted = simulatedSubmittedId === selected.id;
  const proposalTotal = selected.quantities.reduce(
    (total, item) => total + item.quantity * (prices[item.item] ?? 0),
    0,
  );
  const missingPrices = selected.quantities.filter((item) => (prices[item.item] ?? 0) <= 0);
  const missingDocuments = selected.documents.filter((item) => !prepared.includes(item));
  const deadlinePassed = selected.deadline < referenceDate;
  const financialPercentageTotal = Number(periodOne) + Number(periodTwo);
  const proposalReady =
    missingPrices.length === 0 &&
    missingDocuments.length === 0 &&
    (!financialScheduleRequired || scheduleReady) &&
    !deadlinePassed;

  function setScheduleRequired(required: boolean) {
    setScheduleRequirements((current) => ({ ...current, [selected.id]: required }));
    if (!required) {
      setReadySchedules((current) => ({ ...current, [selected.id]: false }));
    }
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function selectOpportunity(id: string) {
    setSelectedId(id);
    setNotice("");
    navigate("oportunidades");
  }

  function updateDecision(id: string, value: string) {
    setDecisions((current) => ({ ...current, [id]: value }));
    setNotice(
      value === "Participar"
        ? "Decisão registada nesta demonstração. A preparação da proposta está disponível."
        : "Decisão registada nesta demonstração. Não foi enviada uma resposta ao procedimento.",
    );
  }

  function resetDemo() {
    setOpportunities(originalOpportunities);
    setSelectedId("obra-escola");
    setSearch("");
    setRadius("80");
    setPublicationDate("2026-10-01");
    setShowMap(true);
    setDecisions({
      "obra-escola": "Em preparação",
      "obra-praca": "Não concorrer",
      "obra-cobertura": "Submetida",
    });
    setPreparedDocuments(initialPreparedByOpportunity);
    setPrices(initialPrices);
    setScheduleRequirements({
      "obra-escola": true,
      "obra-praca": false,
      "obra-cobertura": true,
    });
    setReadySchedules({ "obra-cobertura": true });
    setSimulatedSubmittedId(null);
    setSimulateFailure(false);
    setShowDemoControls(false);
    setProfileLocation("Viseu");
    setProfileRadius("80");
    setLicence("Classe 3 demonstrativa");
    setSupplierQuery("cimento");
    setSupplierName("Materiais do Mondego");
    setQuotePrice("8,40");
    setQuoteValidUntil("2026-10-30");
    setQuoteRows([
      {
        supplier: "Materiais do Mondego",
        material: "Cimento CEM II",
        price: 8.4,
        validUntil: "2026-10-30",
      },
      {
        supplier: "Depósito Central",
        material: "Cimento CEM II",
        price: 8.9,
        validUntil: "2026-09-15",
      },
    ]);
    setWorkProgress({ Estrutura: 100, Cobertura: 55, Acabamentos: 15 });
    setSelectedTask("Cobertura");
    setAssistantAnswer("");
    setDemoImport("Mapa de medições de demonstração.csv");
    setSelectedDocument("Memória descritiva");
    setPreviewDocument("Memória descritiva de demonstração.pdf");
    setCostAmount("42000");
    setBilledAmount("78500");
    setReceivedAmount("52000");
    setConsumption("18");
    setMaterialStock("42");
    setAdvancedQuantities({});
    setPeriodOne("40");
    setPeriodTwo("60");
    setShowExport(false);
    navigate("inicio");
    setNotice("Demonstração reiniciada. Os exemplos e a data de referência foram repostos.");
  }

  function runSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileLocation.trim() || Number(radius) <= 0) {
      setNotice(
        "Indique uma localização e um raio superior a zero para aplicar os filtros demonstrativos.",
      );
      return;
    }
    setNotice(
      visibleOpportunities.length === 0
        ? "Não existem exemplos que correspondam à pesquisa. Altere os filtros para tentar novamente."
        : `${visibleOpportunities.length} exemplo(s) correspondem aos filtros. Nenhuma fonte externa foi consultada.`,
    );
  }

  function markPrepared(documentName: string, isPrepared: boolean) {
    setPreparedDocuments((current) => {
      const existing = current[selected.id] ?? [];
      const updated = isPrepared
        ? [...new Set([...existing, documentName])]
        : existing.filter((item) => item !== documentName);
      return { ...current, [selected.id]: updated };
    });
  }

  function simulateSubmission() {
    if (decisions[selected.id] === "Submetida") {
      setNotice(
        "Este exemplo já está marcado como submetido. Não pode simular uma segunda submissão.",
      );
      return;
    }
    if (!proposalReady) {
      setNotice(
        "A proposta tem itens por resolver. Regresse à checklist, aos preços ou ao cronograma antes de continuar.",
      );
      return;
    }
    if (simulateFailure) {
      setNotice(
        "A demonstração simulou uma falha ao abrir a plataforma externa. Nenhum documento foi enviado. Pode tentar novamente ou voltar à preparação.",
      );
      return;
    }
    setSimulatedSubmittedId(selected.id);
    setDecisions((current) => ({ ...current, [selected.id]: "Submetida" }));
    setNotice(
      "Submissão simulada. Nenhum documento foi enviado e nenhuma plataforma externa foi contactada.",
    );
  }

  function addQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedPrice = Number(quotePrice.replace(",", "."));
    if (
      !supplierName.trim() ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0 ||
      !quoteValidUntil
    ) {
      setNotice(
        "Indique fornecedor, preço positivo e validade para registar a cotação demonstrativa.",
      );
      return;
    }
    setQuoteRows((current) => [
      ...current,
      {
        supplier: supplierName,
        material: supplierQuery || "Material",
        price: parsedPrice,
        validUntil: quoteValidUntil,
      },
    ]);
    setNotice("Cotação fictícia adicionada. Não foi contactado nenhum fornecedor.");
  }

  function answerAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = assistantQuestion.toLocaleLowerCase("pt-PT");
    if (
      question.includes("finance") ||
      question.includes("despesa") ||
      question.includes("saldo")
    ) {
      setAssistantAnswer(
        `Na demonstração da ${selectedWork}, foram registados ${money(Number(costAmount))} em despesas. O valor faturado é ${money(Number(billedAmount))} e o valor recebido é ${money(Number(receivedAmount))}. Estes totais são exemplos locais.`,
      );
    } else if (
      ["anúncio", "oportunidade", "concurso", "raio", "pesquisa"].some((term) =>
        question.includes(term),
      )
    ) {
      setAssistantAnswer(
        "Encontrei exemplos fictícios de anúncios dentro do raio ilustrativo. Consulte a lista de oportunidades. Não consultei fontes externas.",
      );
    } else {
      setAssistantAnswer(
        "Esta pergunta não está coberta pelos exemplos locais. Tente perguntar sobre anúncios ou sobre despesas, faturação e recebimentos. Nenhum serviço de IA foi consultado.",
      );
    }
  }

  function togglePriority(current: string) {
    setWorkProgress((progress) => ({
      ...progress,
      [current]: Math.min(100, (progress[current] ?? 0) + 10),
    }));
  }

  const home = (
    <>
      <Section title="Continuar uma tarefa">
        <p>
          Dados fictícios · Estado temporário neste separador · Sem ligações a serviços externos
        </p>
        <ul>
          <li>
            <button onClick={() => navigate("oportunidades")}>Pesquisar anúncios e convites</button>{" "}
            · {visibleOpportunities.length} exemplos no conjunto
          </li>
          <li>
            <button onClick={() => navigate("proposta")}>Preparar uma proposta</button> ·{" "}
            {decisions[selected.id]}
          </li>
          <li>
            <button onClick={() => navigate("acompanhamento")}>Acompanhar uma proposta</button> ·
            Resultado e contrato de demonstração
          </li>
          <li>
            <button onClick={() => navigate("obras")}>Registar progresso de uma obra</button> · 3
            itens de execução
          </li>
        </ul>
      </Section>
      <Section title="Prazos de propostas">
        <p>Data de referência fixa da demonstração: {date(referenceDate)}.</p>
        <ul>
          {opportunities.map((item) => (
            <li key={item.id}>
              <button onClick={() => selectOpportunity(item.id)}>{item.title}</button> · limite{" "}
              {date(item.deadline)} ·{" "}
              {item.deadline < referenceDate
                ? "Prazo ultrapassado no exemplo"
                : "Dentro do prazo no exemplo"}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Reiniciar">
        <p>
          O estado não fica guardado após atualizar a página. Pode repor os exemplos a qualquer
          momento.
        </p>
        <button onClick={resetDemo}>Reiniciar demonstração</button>
      </Section>
    </>
  );

  const opportunityPage = (
    <>
      <Section title="Filtros demonstrativos">
        <form onSubmit={runSearch}>
          <label htmlFor="search">Pesquisar por obra, entidade ou localidade</label>
          <br />
          <input id="search" value={search} onChange={(event) => setSearch(event.target.value)} />
          <p>
            <label htmlFor="pub-date">Data de publicação</label>
            <br />
            <input
              id="pub-date"
              type="date"
              value={publicationDate}
              onChange={(event) => setPublicationDate(event.target.value)}
            />
          </p>
          <p>
            <label htmlFor="radius">Raio ilustrativo em quilómetros</label>
            <br />
            <input
              id="radius"
              type="number"
              min="1"
              value={radius}
              onChange={(event) => setRadius(event.target.value)}
            />
          </p>
          <p>
            Localização usada: {profileLocation}. As distâncias fictícias foram preparadas a partir
            de Viseu e não são recalculadas ao alterar a localização.
          </p>
          <button type="submit">Aplicar filtros</button>{" "}
          <button
            type="button"
            onClick={() => {
              setSearch("sem correspondência");
              setNotice(
                "Filtro sem resultados selecionado. A lista vazia inclui uma forma de corrigir a pesquisa.",
              );
            }}
          >
            Mostrar pesquisa sem resultados
          </button>
        </form>
      </Section>
      <Section title="Resultados">
        <p>
          <button aria-pressed={showMap} onClick={() => setShowMap(true)}>
            Mapa esquemático
          </button>{" "}
          <button aria-pressed={!showMap} onClick={() => setShowMap(false)}>
            Lista
          </button>
        </p>
        {visibleOpportunities.length === 0 ? (
          <>
            <p role="status">Não foram encontrados exemplos.</p>
            <button
              onClick={() => {
                setSearch("");
                setNotice("Filtros de texto removidos. Os exemplos voltaram à lista.");
              }}
            >
              Limpar pesquisa
            </button>
          </>
        ) : showMap ? (
          <>
            <p>Esquema de posições ilustrativas. Os pontos não representam coordenadas reais.</p>
            <svg
              role="group"
              aria-labelledby="map-title map-description"
              viewBox="0 0 480 180"
              width="100%"
              height="180"
            >
              <title id="map-title">Mapa esquemático de oportunidades</title>
              <desc id="map-description">
                Três posições fictícias. Selecione um ponto para abrir o procedimento
                correspondente.
              </desc>
              <line x1="20" y1="90" x2="460" y2="90" stroke="currentColor" strokeWidth="1" />
              {visibleOpportunities.map((item, index) => {
                const x = 75 + index * 145;
                return (
                  <g key={item.id}>
                    <a
                      href="#oportunidade"
                      aria-label={`Selecionar ${item.title}, ${item.place}`}
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedId(item.id);
                        setNotice(`${item.title} selecionada.`);
                      }}
                    >
                      <title>Abrir {item.title}</title>
                      <circle
                        cx={x}
                        cy={90 + (index % 2 ? 28 : -24)}
                        r="12"
                        fill="none"
                        stroke="currentColor"
                      />
                      <text x={x} y={95 + (index % 2 ? 28 : -24)} textAnchor="middle">
                        {index + 1}
                      </text>
                    </a>
                    <text x={x} y={145}>
                      {item.place} · {item.distanceKm} km
                    </text>
                  </g>
                );
              })}
            </svg>
            <ol>
              {visibleOpportunities.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setSelectedId(item.id);
                      setNotice(`${item.title} selecionada no mapa.`);
                    }}
                  >
                    {item.title}
                  </button>{" "}
                  · {item.place} · {money(item.value)}{" "}
                  <button onClick={() => selectOpportunity(item.id)}>Ver detalhe</button>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <ul>
            {visibleOpportunities.map((item) => (
              <li key={item.id}>
                <button onClick={() => setSelectedId(item.id)}>{item.title}</button> · {item.buyer}{" "}
                · {item.place} · {item.distanceKm} km · publicação {date(item.publishedAt)} ·{" "}
                {money(item.value)} · limite {date(item.deadline)}{" "}
                <button onClick={() => selectOpportunity(item.id)}>Abrir</button>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title="Detalhe do procedimento selecionado">
        <h3>{selected.title}</h3>
        <p>Entidade adjudicante: {selected.buyer}</p>
        <p>Localização: {selected.place}</p>
        <p>Valor anunciado: {money(selected.value)}. Este valor não é o preço da proposta.</p>
        <p>Prazo demonstrativo da obra: 120 dias. Limite de entrega: {date(selected.deadline)}.</p>
        <p>Plataforma indicada: Plataforma externa de demonstração, sem ligação real.</p>
        <p>
          <button
            onClick={() =>
              setNotice(
                `Pré-visualização fictícia do anúncio: ${selected.title}. Nenhum endereço externo foi aberto.`,
              )
            }
          >
            Consultar pré-visualização do anúncio
          </button>
        </p>
        <h3>Requisitos e decisão</h3>
        <p>{selected.requirements}</p>
        <p>Perfil atual: {licence}. Esta comparação não confirma elegibilidade jurídica.</p>
        {selected.id === "obra-praca" && (
          <p>
            Informação em falta neste exemplo: licença de obras públicas. A pessoa deve confirmar as
            habilitações aplicáveis.
          </p>
        )}
        {selected.id === "obra-cobertura" && (
          <p>
            Habilitação pós-adjudicação por confirmar. Esta informação não substitui a revisão dos
            requisitos de participação.
          </p>
        )}
        <button onClick={() => updateDecision(selected.id, "Participar")}>Participar</button>{" "}
        <button onClick={() => updateDecision(selected.id, "Não concorrer")}>Não concorrer</button>
        {decisions[selected.id] === "Participar" && (
          <p>
            <button onClick={() => navigate("proposta")}>Iniciar preparação da proposta</button>
          </p>
        )}
      </Section>
    </>
  );

  const invitePage = (
    <>
      <Section title="Convites fictícios">
        {opportunities
          .filter((item) => item.kind === "Convite")
          .map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>
                Entidade: {item.buyer} · Local: {item.place} · Limite: {date(item.deadline)}
              </p>
              <p>
                Origem: convite indicado por um aviso demonstrativo de e-mail. Nenhuma caixa de
                correio foi consultada.
              </p>
              <button
                onClick={() => {
                  setSelectedId(item.id);
                  updateDecision(item.id, "Participar");
                }}
              >
                Registar intenção de participar
              </button>{" "}
              <button
                onClick={() => {
                  setSelectedId(item.id);
                  updateDecision(item.id, "Não concorrer");
                }}
              >
                Registar que não vai concorrer
              </button>{" "}
              <button onClick={() => selectOpportunity(item.id)}>Ver procedimento</button>
            </article>
          ))}
      </Section>
      <Section title="Aviso">
        <p>
          O registo é local. A aceitação ou recusa formal teria de ocorrer na plataforma indicada
          pelo procedimento.
        </p>
      </Section>
    </>
  );

  const deadlinePage = (
    <Section title="Prazos por ordem">
      <p>
        Data de referência fixa: {date(referenceDate)}. Os avisos não dependem da data atual do
        computador.
      </p>
      <ol>
        {[...opportunities]
          .sort((a, b) => a.deadline.localeCompare(b.deadline))
          .map((item) => (
            <li key={item.id}>
              <button onClick={() => selectOpportunity(item.id)}>{item.title}</button> · limite{" "}
              {date(item.deadline)} ·{" "}
              {item.deadline < referenceDate
                ? "Prazo ultrapassado"
                : item.deadline <= "2026-10-08"
                  ? "Próximo do prazo"
                  : "Prazo futuro"}{" "}
              · estado: {decisions[item.id]}
            </li>
          ))}
      </ol>
      <p>
        Esta lista mostra limites de entrega de propostas, não o cronograma de execução da obra.
      </p>
    </Section>
  );

  const proposalPage = (
    <>
      <Section title="Escolher procedimento">
        <label htmlFor="proposal-opportunity">Procedimento</label>
        <br />
        <select
          id="proposal-opportunity"
          value={selectedId}
          onChange={(event) => {
            setSelectedId(event.target.value);
          }}
        >
          {opportunities.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <p>
          Entidade: {selected.buyer} · Valor anunciado: {money(selected.value)} · Limite de entrega:{" "}
          {date(selected.deadline)}.
        </p>
        <p>
          Estado da proposta:{" "}
          {simulatedSubmitted ? "Submetida (simulação)" : decisions[selected.id]}
        </p>
      </Section>
      <Section title="Peças do procedimento">
        <p>
          Pré-visualizações fictícias. A obtenção real das peças teria lugar na plataforma indicada.
        </p>
        <ul>
          {[
            "Desenhos de demonstração.pdf",
            "Memória descritiva de demonstração.pdf",
            "Mapa de medições de demonstração.xlsx",
          ].map((documentName) => (
            <li key={documentName}>
              <button
                onClick={() => {
                  setPreviewDocument(documentName);
                  setNotice(`Pré-visualização aberta: ${documentName}.`);
                }}
              >
                Abrir {documentName}
              </button>
              {previewDocument === documentName && (
                <p>
                  Pré-visualização fictícia selecionada. Não foi aberto nenhum ficheiro externo.
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Checklist da proposta">
        <ul>
          {selected.documents.map((documentName) => (
            <li key={documentName}>
              <label>
                <input
                  type="checkbox"
                  checked={prepared.includes(documentName)}
                  onChange={(event) => markPrepared(documentName, event.target.checked)}
                />
                {documentName} (obrigatório neste exemplo)
              </label>
            </li>
          ))}
        </ul>
        <p>
          Em falta: {missingDocuments.length ? missingDocuments.join(", ") : "nenhum documento"}.
        </p>
        <label htmlFor="attach-document">Anexar exemplo fictício</label>
        <br />
        <select
          id="attach-document"
          value={checklistDocument}
          onChange={(event) => setSelectedDocument(event.target.value)}
        >
          {selected.documents.map((documentName) => (
            <option key={documentName}>{documentName}</option>
          ))}
        </select>{" "}
        <button
          onClick={() => {
            markPrepared(checklistDocument, true);
            setNotice(
              `${checklistDocument} marcado como preparado. Nenhum ficheiro foi carregado.`,
            );
          }}
        >
          Marcar como preparado
        </button>
      </Section>
      <Section title="Lista de preços unitários">
        <p>Edite preços demonstrativos. Subtotais e total usam os valores indicados abaixo.</p>
        {selected.quantities.map((item) => (
          <fieldset key={item.item}>
            <legend>{item.item}</legend>
            <p>
              Unidade: {item.unit} · Quantidade: {item.quantity}
            </p>
            <label htmlFor={`price-${item.item}`}>Preço unitário (€)</label>
            <br />
            <input
              id={`price-${item.item}`}
              type="number"
              min="0"
              step="0.01"
              value={prices[item.item] ?? 0}
              onChange={(event) =>
                setPrices((current) => ({
                  ...current,
                  [item.item]: Number(event.target.value),
                }))
              }
            />
            <p>Subtotal: {money(item.quantity * (prices[item.item] ?? 0))}</p>
          </fieldset>
        ))}
        <p>
          <strong>Total demonstrativo: {money(proposalTotal)}</strong>
        </p>
        <p>
          Itens sem preço:{" "}
          {missingPrices.length ? missingPrices.map((item) => item.item).join(", ") : "nenhum"}. A
          margem não é aplicada automaticamente.
        </p>
      </Section>
      <Section title="Cronograma financeiro">
        <p>Este cronograma de pagamentos da proposta é distinto do plano de execução da obra.</p>
        <label>
          <input
            type="radio"
            name="schedule-required"
            checked={financialScheduleRequired}
            onChange={() => setScheduleRequired(true)}
          />
          Exigido neste exemplo
        </label>{" "}
        <label>
          <input
            type="radio"
            name="schedule-required"
            checked={!financialScheduleRequired}
            onChange={() => setScheduleRequired(false)}
          />
          Não exigido neste exemplo
        </label>
        {financialScheduleRequired && (
          <>
            <p>
              Período 1: 40% · {money(proposalTotal * 0.4)}. Período 2: 60% ·{" "}
              {money(proposalTotal * 0.6)}.
            </p>
            <button
              onClick={() => {
                setReadySchedules((current) => ({
                  ...current,
                  [selected.id]: !scheduleReady,
                }));
                setNotice(
                  scheduleReady
                    ? "Cronograma financeiro marcado como não preparado."
                    : "Cronograma financeiro demonstrativo marcado como preparado.",
                );
              }}
            >
              {scheduleReady
                ? "Desmarcar cronograma preparado"
                : "Marcar cronograma como preparado"}
            </button>
          </>
        )}
      </Section>
      <Section title="Rever e simular">
        <ul>
          <li>Documentos por preparar: {missingDocuments.length}</li>
          <li>Itens sem preço: {missingPrices.length}</li>
          <li>
            Cronograma:{" "}
            {!financialScheduleRequired
              ? "não exigido"
              : scheduleReady
                ? "preparado"
                : "por preparar"}
          </li>
          <li>Prazo: {deadlinePassed ? "ultrapassado" : "dentro da data fixa da demonstração"}</li>
          <li>Total da proposta: {money(proposalTotal)}</li>
        </ul>
        {!proposalReady && (
          <p>
            Resolva os pontos acima antes da simulação. Pode voltar a qualquer campo nesta página.
          </p>
        )}
        {proposalReady && (
          <p>
            A revisão está completa para este exemplo. A simulação não valida regras jurídicas nem
            contabilísticas.
          </p>
        )}
        <button
          disabled={!proposalReady || decisions[selected.id] === "Submetida"}
          onClick={simulateSubmission}
        >
          {decisions[selected.id] === "Submetida" ? "Submissão já registada" : "Simular submissão"}
        </button>{" "}
        <button
          onClick={() =>
            setNotice(
              "Pré-visualização da plataforma externa. A demonstração não abre nem envia dados para essa plataforma.",
            )
          }
        >
          Pré-visualizar plataforma
        </button>
        {decisions[selected.id] === "Submetida" && !simulatedSubmitted && (
          <p role="status">Estado inicial fictício. Nenhum documento real foi enviado.</p>
        )}
        {simulatedSubmitted && (
          <p role="status">Submissão simulada · nenhum documento foi enviado.</p>
        )}
      </Section>
    </>
  );

  const trackingPage = (
    <>
      <Section title="Propostas em acompanhamento">
        <ul>
          {opportunities.map((item) => (
            <li key={item.id}>
              <button onClick={() => setSelectedId(item.id)}>{item.title}</button> · estado:{" "}
              {decisions[item.id]} · valor anunciado {money(item.value)}. O valor anunciado não é o
              valor da proposta.
            </li>
          ))}
        </ul>
        <p>Procedimento selecionado: {selected.title}</p>
      </Section>
      <Section title="Resultado e concorrentes">
        <p>
          Resultado fictício: proposta classificada em 2.º lugar. Valores concorrentes
          demonstrativos: {money(231000)} e {money(248500)}.
        </p>
        <p>
          Relatório: pré-visualização incluída. Reclamação: estado demonstrativo “por avaliar”.
          Nenhum documento foi submetido.
        </p>
        <button
          onClick={() =>
            setNotice(
              "Pré-visualização fictícia do relatório aberta. Nenhum documento externo foi obtido.",
            )
          }
        >
          Abrir relatório demonstrativo
        </button>{" "}
        <button
          onClick={() =>
            setNotice(
              "Reclamação marcada como em preparação. Nada foi enviado à entidade adjudicante.",
            )
          }
        >
          Preparar reclamação demonstrativa
        </button>
      </Section>
      <Section title="Depois da adjudicação">
        <ul>
          <li>
            Documentos de habilitação: por preparar, separados dos requisitos de participação.
          </li>
          <li>Minuta do contrato: pré-visualização fictícia.</li>
          <li>Contrato: aguarda revisão humana.</li>
          <li>Auto de consignação: ainda não registado.</li>
        </ul>
        <button onClick={() => navigate("pos-obra")}>Ver receção, garantia e pós-obra</button>
      </Section>
    </>
  );

  const supplierPage = (
    <>
      <Section title="Pesquisar fornecedores">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setNotice(
              `2 fornecedores fictícios correspondem a “${supplierQuery}”. Não foi usado um serviço de mapas ou pesquisa externa.`,
            );
          }}
        >
          <label htmlFor="supplier-query">Material ou fornecedor</label>
          <br />
          <input
            id="supplier-query"
            value={supplierQuery}
            onChange={(event) => setSupplierQuery(event.target.value)}
          />{" "}
          <button>Pesquisar exemplos</button>
        </form>
        <ul>
          <li>
            Materiais do Mondego · Coimbra · cimento, agregados · contacto de exemplo
            contacto@exemplo.invalid
          </li>
          <li>
            Depósito Central · Viseu · cimento, ferramentas · contacto de exemplo
            compras@exemplo.invalid
          </li>
        </ul>
        <p>Contactos e localizações são fictícios. Não são enviados pedidos de cotação.</p>
      </Section>
      <Section title="Registar uma cotação">
        <form onSubmit={addQuote}>
          <p>
            <label htmlFor="supplier-name">Fornecedor</label>
            <br />
            <input
              id="supplier-name"
              value={supplierName}
              onChange={(event) => setSupplierName(event.target.value)}
            />
          </p>
          <p>
            <label htmlFor="quote-price">Preço (€)</label>
            <br />
            <input
              id="quote-price"
              inputMode="decimal"
              value={quotePrice}
              onChange={(event) => setQuotePrice(event.target.value)}
            />
          </p>
          <p>
            <label htmlFor="quote-validity">Válida até</label>
            <br />
            <input
              id="quote-validity"
              type="date"
              value={quoteValidUntil}
              onChange={(event) => setQuoteValidUntil(event.target.value)}
            />
          </p>
          <button>Registar cotação fictícia</button>
        </form>
      </Section>
      <Section title="Pesquisa assistida de fornecedores">
        <p>As sugestões são determinísticas e usam apenas estes exemplos locais.</p>
        <button
          onClick={() =>
            setNotice(
              `Sugestões fictícias para ${supplierQuery}: Materiais do Mondego e Depósito Central. Não foi consultado um serviço de IA.`,
            )
          }
        >
          Sugerir fornecedores
        </button>
        <ul>
          <li>Materiais do Mondego · contacto@exemplo.invalid</li>
          <li>Depósito Central · compras@exemplo.invalid</li>
        </ul>
        <p>Não foi consultado um serviço externo de IA.</p>
      </Section>
      <Section title="Comparar cotações">
        <table>
          <caption>Cotações fictícias de cimento</caption>
          <thead>
            <tr>
              <th scope="col">Fornecedor</th>
              <th scope="col">Material</th>
              <th scope="col">Preço</th>
              <th scope="col">Validade</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {quoteRows.map((row, index) => (
              <tr key={`${row.supplier}-${index}`}>
                <td>{row.supplier}</td>
                <td>{row.material}</td>
                <td>{money(row.price)}</td>
                <td>
                  {date(row.validUntil)}
                  {row.validUntil < referenceDate ? " · validade ultrapassada no exemplo" : ""}
                </td>
                <td>
                  <button
                    onClick={() =>
                      setNotice(
                        `${row.supplier} marcado como fornecedor preferido. A escolha continua a ser sua.`,
                      )
                    }
                  >
                    Marcar como preferido
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>A comparação não escolhe um fornecedor automaticamente.</p>
      </Section>
      <Section title="Extrair dados de uma cotação fictícia">
        <label htmlFor="quote-import">Exemplo incluído</label>
        <br />
        <select
          id="quote-import"
          value={demoImport}
          onChange={(event) => setDemoImport(event.target.value)}
        >
          <option>Orçamento fictício de cimento.pdf</option>
          <option>Mensagem de cotação fictícia.eml</option>
        </select>
        <p>Pré-visualização: Cimento CEM II · 8,40 €/saco · validade 30 de outubro de 2026.</p>
        <button
          onClick={() =>
            setNotice(
              "Valores extraídos como sugestão. Reveja fornecedor, preço e validade antes de registar.",
            )
          }
        >
          Extrair pré-visualização
        </button>{" "}
        <button
          onClick={() =>
            setNotice(
              "Falha simulada na leitura do exemplo. Reveja o formato, tente outro exemplo ou cancele. Nenhum e-mail foi consultado.",
            )
          }
        >
          Simular falha de leitura
        </button>
      </Section>
    </>
  );

  const worksPage = (
    <>
      <Section title="Registos de obras e clientes">
        <ul>
          {[
            "Reabilitação da Escola do Vale",
            "Arranjo da Praça da Ribeira",
            "Reparação do Centro Comunitário",
          ].map((work) => (
            <li key={work}>
              <button onClick={() => setSelectedWork(work)}>{work}</button> · Cliente demonstrativo{" "}
              {work === selectedWork ? "(selecionada)" : ""}
            </li>
          ))}
        </ul>
        <p>Obra selecionada: {selectedWork}</p>
        <label htmlFor="client-name">Nome do cliente demonstrativo</label>
        <br />
        <input id="client-name" defaultValue="Município de Viseu (exemplo)" />
        <p>
          <button
            onClick={() =>
              setNotice("Registo guardado apenas no estado temporário desta demonstração.")
            }
          >
            Guardar alterações demonstrativas
          </button>
        </p>
      </Section>
      <Section title="Resumo da obra">
        <p>
          Estado: em execução · Responsável demonstrativo: Inês Martins · Contrato: {money(284000)}.
        </p>
        <p>
          Relações demonstradas: obra → cliente, itens de medição, pessoas, materiais, despesas,
          faturas e receções.
        </p>
        <button onClick={() => navigate("planeamento")}>Abrir planeamento</button>{" "}
        <button onClick={() => navigate("financas")}>Abrir finanças</button>{" "}
        <button onClick={() => navigate("pos-obra")}>Abrir pós-obra</button>
      </Section>
    </>
  );

  const resourcePage = (
    <>
      <Section title="Pessoas e mão de obra">
        <table>
          <caption>Pessoas fictícias afetas à obra</caption>
          <thead>
            <tr>
              <th scope="col">Pessoa</th>
              <th scope="col">Função</th>
              <th scope="col">Custo demonstrativo diário</th>
              <th scope="col">Afetação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Inês Martins</th>
              <td>Encarregada</td>
              <td>€ 145,00</td>
              <td>
                <label>
                  <input type="checkbox" defaultChecked />
                  Reabilitação da Escola do Vale
                </label>
              </td>
            </tr>
            <tr>
              <th scope="row">Rui Costa</th>
              <td>Pedreiro</td>
              <td>€ 112,00</td>
              <td>
                <label>
                  <input type="checkbox" />
                  Reabilitação da Escola do Vale
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <button onClick={() => setNotice("Afetação atualizada apenas na demonstração.")}>
          Guardar afetações
        </button>
      </Section>
      <Section title="Equipamento">
        <ul>
          <li>Grua móvel demonstrativa · disponibilidade indicada: 2 dias</li>
          <li>Plataforma elevatória demonstrativa · em uso noutra obra</li>
        </ul>
        <label htmlFor="equipment">Afetar equipamento</label>
        <br />
        <select id="equipment">
          <option>Grua móvel demonstrativa</option>
          <option>Plataforma elevatória demonstrativa</option>
        </select>{" "}
        <button
          onClick={() =>
            setNotice(
              "Afetação de equipamento registada localmente. Não existe planeamento automático de recursos.",
            )
          }
        >
          Registar afetação
        </button>
      </Section>
    </>
  );

  const materialPage = (
    <>
      <Section title="Stock por obra">
        <label htmlFor="stock-work">Obra</label>
        <br />
        <select
          id="stock-work"
          value={selectedWork}
          onChange={(event) => setSelectedWork(event.target.value)}
        >
          <option>Reabilitação da Escola do Vale</option>
          <option>Arranjo da Praça da Ribeira</option>
        </select>
        <table>
          <caption>Materiais fictícios disponíveis na obra selecionada</caption>
          <thead>
            <tr>
              <th scope="col">Material</th>
              <th scope="col">Unidade</th>
              <th scope="col">Disponível</th>
              <th scope="col">Necessário</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Cimento CEM II</th>
              <td>saco</td>
              <td>42</td>
              <td>60</td>
            </tr>
            <tr>
              <th scope="row">Tinta interior branca</th>
              <td>litro</td>
              <td>110</td>
              <td>95</td>
            </tr>
          </tbody>
        </table>
        <p>Disponibilidade demonstrativa. Confirme as quantidades antes de qualquer compra real.</p>
        <button
          onClick={() =>
            setNotice("Necessidade registada como nota local. Nenhuma encomenda foi criada.")
          }
        >
          Registar necessidade
        </button>
      </Section>
    </>
  );

  const financePage = (
    <>
      <Section title="Movimentos da obra">
        <p>
          <label htmlFor="cost">Despesas registadas (€)</label>
          <br />
          <input
            id="cost"
            type="number"
            value={costAmount}
            onChange={(event) => setCostAmount(event.target.value)}
          />
        </p>
        <p>
          <label htmlFor="billed">Valor faturado (€)</label>
          <br />
          <input
            id="billed"
            type="number"
            value={billedAmount}
            onChange={(event) => setBilledAmount(event.target.value)}
          />
        </p>
        <p>
          <label htmlFor="received">Valor recebido (€)</label>
          <br />
          <input
            id="received"
            type="number"
            value={receivedAmount}
            onChange={(event) => setReceivedAmount(event.target.value)}
          />
        </p>
        <p>
          Saldo demonstrativo sobre faturado: {money(Number(billedAmount) - Number(costAmount))}.
        </p>
        <p>
          Por receber: {money(Number(billedAmount) - Number(receivedAmount))}. Faturado e recebido
          são valores distintos.
        </p>
        <button
          onClick={() =>
            setNotice("Movimentos atualizados no estado temporário desta demonstração.")
          }
        >
          Guardar movimentos demonstrativos
        </button>
      </Section>
      <Section title="Perguntar sobre esta obra">
        <form onSubmit={answerAssistant}>
          <label htmlFor="finance-question">Pergunta</label>
          <br />
          <input
            id="finance-question"
            value={assistantQuestion}
            onChange={(event) => setAssistantQuestion(event.target.value)}
          />
          <button>Perguntar</button>
        </form>
        {assistantAnswer && <p role="status">{assistantAnswer}</p>}
        <p>Respostas limitadas aos exemplos mostrados. Não foi usado um modelo externo.</p>
        <button onClick={() => navigate("waterfall")}>Ver composição de valores</button>
      </Section>
    </>
  );

  const planningPage = (
    <>
      <Section title="Plano de execução demonstrativo">
        <p>
          Plano de execução separado do cronograma financeiro da proposta. Selecione uma tarefa para
          alterar o progresso local.
        </p>
        <label htmlFor="task">Tarefa</label>
        <br />
        <select
          id="task"
          value={selectedTask}
          onChange={(event) => setSelectedTask(event.target.value)}
        >
          {Object.keys(workProgress).map((task) => (
            <option key={task}>{task}</option>
          ))}
        </select>
        <p>
          Progresso de {selectedTask}:{" "}
          <label htmlFor="progress">{workProgress[selectedTask]}%</label>
          <br />
          <input
            id="progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={workProgress[selectedTask]}
            onChange={(event) =>
              setWorkProgress((current) => ({
                ...current,
                [selectedTask]: Number(event.target.value),
              }))
            }
          />
        </p>
        <p>
          <button onClick={() => togglePriority(selectedTask)}>
            Aumentar progresso em 10 pontos
          </button>
        </p>
        <svg
          role="group"
          aria-labelledby="gantt-title gantt-description"
          viewBox="0 0 600 190"
          width="100%"
          height="190"
        >
          <title id="gantt-title">Cronograma Gantt demonstrativo</title>
          <desc id="gantt-description">
            Três tarefas com dependências. Selecione uma barra para abrir a tarefa.
          </desc>
          <text x="10" y="32">
            Estrutura
          </text>
          <text x="10" y="82">
            Cobertura
          </text>
          <text x="10" y="132">
            Acabamentos
          </text>
          <line x1="155" y1="26" x2="540" y2="26" stroke="currentColor" />
          <text x="155" y="18">
            Outubro
          </text>
          <text x="310" y="18">
            Novembro
          </text>
          <text x="450" y="18">
            Dezembro
          </text>
          {Object.entries(workProgress).map(([task, progress], index) => {
            const y = 20 + index * 50;
            const x = 155 + index * 80;
            return (
              <g key={task}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(28, (180 * progress) / 100)}
                  height="22"
                  fill="none"
                  stroke="currentColor"
                />
                <text x={x + 5} y={y + 16}>
                  {progress}%
                </text>
                <a
                  href="#tarefa"
                  onClick={(event) => {
                    event.preventDefault();
                    setSelectedTask(task);
                  }}
                >
                  <title>Selecionar {task}</title>
                  <rect x={x} y={y} width="180" height="26" fill="transparent" />
                </a>
              </g>
            );
          })}
          <path d="M335 52 L335 72 L415 72" fill="none" stroke="currentColor" />
          <path d="M415 122 L415 142 L495 142" fill="none" stroke="currentColor" />
        </svg>
        <table>
          <caption>Tarefas e datas planeadas (exemplos fixos)</caption>
          <thead>
            <tr>
              <th scope="col">Tarefa</th>
              <th scope="col">Início</th>
              <th scope="col">Fim</th>
              <th scope="col">Dependência</th>
              <th scope="col">Responsável</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Estrutura</th>
              <td>5 out.</td>
              <td>20 out.</td>
              <td>Nenhuma</td>
              <td>Equipa A</td>
            </tr>
            <tr>
              <th scope="row">Cobertura</th>
              <td>21 out.</td>
              <td>12 nov.</td>
              <td>Estrutura</td>
              <td>Rui Costa</td>
            </tr>
            <tr>
              <th scope="row">Acabamentos</th>
              <td>13 nov.</td>
              <td>4 dez.</td>
              <td>Cobertura</td>
              <td>Equipa B</td>
            </tr>
          </tbody>
        </table>
        <p>
          Previsão demonstrativa: conclusão em dezembro, assumindo que as dependências e durações se
          mantêm.
        </p>
      </Section>
      <Section title="Importar, editar e exportar mapas">
        <label htmlFor="map-import">Exemplo de importação</label>
        <br />
        <select
          id="map-import"
          value={demoImport}
          onChange={(event) => setDemoImport(event.target.value)}
        >
          <option>Mapa de medições de demonstração.csv</option>
          <option>Cronograma financeiro de demonstração.xlsx</option>
        </select>
        <p>Pré-visualização: 3 linhas · quantidades e unidades demonstrativas.</p>
        <button
          onClick={() =>
            setNotice(
              "Importação de demonstração concluída após revisão. Nenhum ficheiro local foi lido.",
            )
          }
        >
          Simular importação
        </button>{" "}
        <button
          onClick={() =>
            setNotice(
              "Falha simulada: formato de exemplo não reconhecido. Escolha outro exemplo ou cancele. Nenhum ficheiro foi alterado.",
            )
          }
        >
          Simular falha
        </button>
        <p>
          <button onClick={() => setShowExport((value) => !value)}>
            Pré-visualizar exportação demonstrativa
          </button>
        </p>
        {showExport && <pre>Obra;Tarefa;Quantidade\nEscola do Vale;Cobertura;240 m²</pre>}
      </Section>
    </>
  );

  const afterWorkPage = (
    <>
      <Section title="Fases da obra">
        <ol>
          <li>Execução: cobertura a 55% no exemplo atual.</li>
          <li>Receção provisória: por marcar.</li>
          <li>Garantia: começa após aceitação demonstrativa.</li>
          <li>Receção definitiva: por confirmar após o prazo de garantia.</li>
        </ol>
        <p>
          Execução e garantia são fases diferentes. Receção provisória e definitiva também são
          eventos distintos.
        </p>
      </Section>
      <Section title="Obra concluída sob garantia">
        <p>Reparação do Centro Comunitário · receção provisória: 1 de maio de 2026.</p>
        <p>
          Garantia demonstrativa até 1 de maio de 2027 · vistoria pendente · retenção: {money(3400)}
          .
        </p>
        <p>
          Este exemplo separado da obra em execução permite rever o percurso até à receção
          definitiva.
        </p>
        <button
          onClick={() =>
            setNotice(
              "Vistoria marcada como revista apenas na demonstração. Não foi enviado um alerta.",
            )
          }
        >
          Rever vistoria
        </button>
      </Section>
      <Section title="Vistorias, reparações e retenções">
        <table>
          <caption>Registos pós-obra fictícios, ordenados pela data</caption>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Ação</th>
              <th scope="col">Estado</th>
              <th scope="col">Valor retido</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-11-12</td>
              <td>Vistoria demonstrativa</td>
              <td>Agendada</td>
              <td>{money(5680)}</td>
            </tr>
            <tr>
              <td>2027-05-12</td>
              <td>Fim do prazo de garantia, exemplo</td>
              <td>Por confirmar</td>
              <td>{money(5680)}</td>
            </tr>
            <tr>
              <td>2027-06-01</td>
              <td>Receção definitiva demonstrativa</td>
              <td>Por preparar</td>
              <td>{money(0)}</td>
            </tr>
          </tbody>
        </table>
        <p>Datas fixas de demonstração. Alertas não são enviados.</p>
        <button
          onClick={() =>
            setNotice(
              "Receção provisória registada apenas nesta demonstração. Nenhum documento foi assinado.",
            )
          }
        >
          Registar receção provisória
        </button>{" "}
        <button
          onClick={() =>
            setNotice("Reparação adicionada à lista demonstrativa. Nenhuma equipa foi contactada.")
          }
        >
          Registar reparação
        </button>{" "}
        <button
          onClick={() =>
            setNotice("Receção definitiva marcada como por preparar. Nenhum aceite foi enviado.")
          }
        >
          Preparar receção definitiva
        </button>
      </Section>
    </>
  );

  const profilePage = (
    <>
      <Section title="Referência da empresa">
        <p>
          <label htmlFor="profile-location">Localização de pesquisa</label>
          <br />
          <input
            id="profile-location"
            value={profileLocation}
            onChange={(event) => setProfileLocation(event.target.value)}
          />
        </p>
        <p>
          <label htmlFor="profile-radius">Raio ilustrativo (km)</label>
          <br />
          <input
            id="profile-radius"
            type="number"
            min="1"
            value={profileRadius}
            onChange={(event) => setProfileRadius(event.target.value)}
          />
        </p>
        <p>
          <label htmlFor="licence">Classe e habilitações demonstrativas</label>
          <br />
          <input
            id="licence"
            value={licence}
            onChange={(event) => setLicence(event.target.value)}
          />
        </p>
        <button
          onClick={() => {
            setRadius(profileRadius);
            setNotice(
              "Perfil atualizado. A pesquisa usa estes valores apenas nos exemplos locais.",
            );
          }}
        >
          Guardar perfil demonstrativo
        </button>
        <p>Não consultamos o IMPIC e não atribuímos limites monetários à classe.</p>
      </Section>
    </>
  );

  const competitorsPage = (
    <>
      <Section title="Participações e resultados">
        <label htmlFor="competitor">Exemplo de concorrente</label>
        <br />
        <select
          id="competitor"
          value={competitor}
          onChange={(event) => setCompetitor(event.target.value)}
        >
          <option>Construtora do Centro</option>
          <option>Obras da Serra</option>
        </select>
        <p>
          {competitor}: 4 participações demonstrativas, 2 vitórias registadas neste conjunto
          ilustrativo. Valores observados: {money(231000)} a {money(272000)}.
        </p>
        <table>
          <caption>Registos fictícios incluídos na demonstração</caption>
          <thead>
            <tr>
              <th scope="col">Procedimento</th>
              <th scope="col">Resultado</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Reabilitação da Escola do Vale</td>
              <td>2.º lugar</td>
              <td>{money(231000)}</td>
            </tr>
            <tr>
              <td>Arranjo da Praça da Ribeira</td>
              <td>Vitória</td>
              <td>{money(87600)}</td>
            </tr>
          </tbody>
        </table>
        <p>
          Estes exemplos não representam todas as participações. A vitória de um concorrente não
          indica fraude.
        </p>
      </Section>
      <Section title="Distribuição esquemática">
        <svg
          role="img"
          aria-labelledby="competitor-map-title"
          viewBox="0 0 400 100"
          width="100%"
          height="100"
        >
          <title id="competitor-map-title">Dois locais fictícios de procedimentos</title>
          <circle cx="110" cy="45" r="9" fill="none" stroke="currentColor" />
          <text x="126" y="50">
            Viseu
          </text>
          <circle cx="270" cy="45" r="9" fill="none" stroke="currentColor" />
          <text x="286" y="50">
            Coimbra
          </text>
        </svg>
        <p>Posições ilustrativas. Sem cobertura nem consulta do Portal BASE.</p>
      </Section>
    </>
  );

  const assistantPage = (
    <>
      <Section title="Perguntar sobre os exemplos">
        <form onSubmit={answerAssistant}>
          <label htmlFor="assistant-question">Pergunta</label>
          <br />
          <input
            id="assistant-question"
            value={assistantQuestion}
            onChange={(event) => setAssistantQuestion(event.target.value)}
          />
          <button>Obter resposta demonstrativa</button>
        </form>
        {assistantAnswer && <p role="status">{assistantAnswer}</p>}
        <p>A pesquisa assistida usa respostas determinísticas incluídas na aplicação.</p>
      </Section>
      <Section title="Fontes e limites">
        <p>
          Exemplos usados: lista de oportunidades e resumo financeiro desta demonstração. Pode abrir
          cada exemplo para rever os valores.
        </p>
        <ul>
          <li>
            <button onClick={() => navigate("oportunidades")}>
              Lista de oportunidades demonstrativas
            </button>
          </li>
          <li>
            <button onClick={() => navigate("financas")}>Resumo financeiro demonstrativo</button>
          </li>
        </ul>
        <p>Não há fontes oficiais consultadas nem validação independente da resposta.</p>
      </Section>
    </>
  );

  const historyPage = (
    <>
      <Section title="Evolução de cotações">
        <label htmlFor="history-material">Material</label>
        <br />
        <select id="history-material">
          <option>Cimento CEM II</option>
          <option>Tinta interior branca</option>
        </select>
        <svg
          role="img"
          aria-labelledby="price-chart-title price-chart-description"
          viewBox="0 0 480 180"
          width="100%"
          height="180"
        >
          <title id="price-chart-title">Histórico ilustrativo do preço do cimento</title>
          <desc id="price-chart-description">
            Três preços fictícios: 8,10, 8,40 e 8,90 euros. A linha apenas liga observações
            registadas.
          </desc>
          <line x1="35" y1="145" x2="455" y2="145" stroke="currentColor" />
          <line x1="35" y1="20" x2="35" y2="145" stroke="currentColor" />
          <polyline
            points="80,100 240,78 400,42"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="80" cy="100" r="5" fill="currentColor" />
          <circle cx="240" cy="78" r="5" fill="currentColor" />
          <circle cx="400" cy="42" r="5" fill="currentColor" />
          <text x="58" y="165">
            ago.
          </text>
          <text x="220" y="165">
            set.
          </text>
          <text x="380" y="165">
            out.
          </text>
        </svg>
        <table>
          <caption>Observações de preço fictícias, sem interpolação</caption>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Preço por saco</th>
              <th scope="col">Fornecedor</th>
              <th scope="col">Validade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-08-01</td>
              <td>{money(8.1)}</td>
              <td>Depósito Central</td>
              <td>{date("2026-08-31")}</td>
            </tr>
            <tr>
              <td>2026-09-01</td>
              <td>{money(8.4)}</td>
              <td>Materiais do Mondego</td>
              <td>{date("2026-09-15")}</td>
            </tr>
            <tr>
              <td>2026-10-01</td>
              <td>{money(8.9)}</td>
              <td>Depósito Central</td>
              <td>{date("2026-10-30")}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Section title="Validade">
        <p>
          {quoteRows.filter((row) => row.validUntil < referenceDate).length} cotação(ões) com
          validade ultrapassada na data de referência {date(referenceDate)}.
        </p>
        <button onClick={() => navigate("fornecedores")}>Registar ou atualizar uma cotação</button>
      </Section>
    </>
  );

  const referencesPage = (
    <>
      <Section title="Preço de referência">
        <p>Material: Cimento CEM II · preços fictícios introduzidos manualmente.</p>
        <p>
          Média deste conjunto:{" "}
          {money(quoteRows.reduce((sum, quote) => sum + quote.price, 0) / quoteRows.length)} por
          saco. A média não é um preço de mercado.
        </p>
        <p>
          Intervalo observado: {money(Math.min(...quoteRows.map((quote) => quote.price)))} a{" "}
          {money(Math.max(...quoteRows.map((quote) => quote.price)))}.
        </p>
      </Section>
      <Section title="Simular uma margem">
        <label htmlFor="margin">Margem hipotética (%)</label>
        <br />
        <input id="margin" type="number" min="0" max="100" defaultValue="10" />
        <p>
          Aplicar a referência a um custo de exemplo produz um valor para revisão humana. Não existe
          uma margem aprovada.
        </p>
        <button
          onClick={() =>
            setNotice(
              "Sugestão demonstrativa: reveja a fonte, o preço e a margem antes de a usar. Nenhuma margem foi aplicada à proposta.",
            )
          }
        >
          Calcular sugestão demonstrativa
        </button>
        <p>A margem de 25% não é aplicada automaticamente.</p>
      </Section>
    </>
  );

  const forecastPage = (
    <>
      <Section title="Estimativa simples de consumo">
        <p>Material: Cimento CEM II · consumo registado nesta demonstração.</p>
        <p>
          <label htmlFor="material-consumption">Consumo médio diário (sacos)</label>
          <br />
          <input
            id="material-consumption"
            type="number"
            min="0"
            value={consumption}
            onChange={(event) => setConsumption(event.target.value)}
          />
        </p>
        <p>
          <label htmlFor="material-stock">Stock disponível (sacos)</label>
          <br />
          <input
            id="material-stock"
            type="number"
            min="0"
            value={materialStock}
            onChange={(event) => setMaterialStock(event.target.value)}
          />
        </p>
        <p>
          Estimativa ao ritmo indicado: aproximadamente{" "}
          {Number(consumption) > 0 ? Math.floor(Number(materialStock) / Number(consumption)) : "—"}{" "}
          dia(s) de stock. Pressupõe consumo constante e ignora entregas futuras.
        </p>
        <p>É um intervalo de planeamento demonstrativo, não uma previsão real.</p>
      </Section>
    </>
  );

  const waterfallPage = (
    <>
      <Section title="Composição ilustrativa do valor">
        <p>Exemplo de contrato: {money(120000)}. Custos e valor restante são dados fictícios.</p>
        <svg
          role="img"
          aria-labelledby="waterfall-title waterfall-desc"
          viewBox="0 0 540 240"
          width="100%"
          height="240"
        >
          <title id="waterfall-title">Composição demonstrativa do valor do contrato</title>
          <desc id="waterfall-desc">
            Contrato 120 mil euros, menos materiais 32 mil, mão de obra 28 mil, outros custos 18
            mil, igual a 42 mil euros restantes antes de outros fatores.
          </desc>
          <line x1="28" y1="205" x2="520" y2="205" stroke="currentColor" />
          <rect x="48" y="45" width="70" height="160" fill="none" stroke="currentColor" />
          <text x="48" y="35">
            120 000
          </text>
          <text x="45" y="225">
            Contrato
          </text>
          <rect x="160" y="45" width="70" height="43" fill="none" stroke="currentColor" />
          <text x="160" y="105">
            −32 000
          </text>
          <text x="155" y="225">
            Materiais
          </text>
          <rect x="270" y="88" width="70" height="37" fill="none" stroke="currentColor" />
          <text x="270" y="145">
            −28 000
          </text>
          <text x="265" y="225">
            Mão de obra
          </text>
          <rect x="380" y="125" width="70" height="24" fill="none" stroke="currentColor" />
          <text x="380" y="168">
            −18 000
          </text>
          <text x="375" y="225">
            Outros custos
          </text>
          <rect x="475" y="149" width="42" height="56" fill="none" stroke="currentColor" />
          <text x="465" y="135">
            42 000
          </text>
          <text x="466" y="225">
            Restante
          </text>
        </svg>
        <table>
          <caption>Valores mostrados no diagrama</caption>
          <thead>
            <tr>
              <th scope="col">Rubrica</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Valor do contrato</th>
              <td>{money(120000)}</td>
            </tr>
            <tr>
              <th scope="row">Materiais</th>
              <td>−{money(32000)}</td>
            </tr>
            <tr>
              <th scope="row">Mão de obra</th>
              <td>−{money(28000)}</td>
            </tr>
            <tr>
              <th scope="row">Outros custos</th>
              <td>−{money(18000)}</td>
            </tr>
            <tr>
              <th scope="row">Restante antes de outros fatores</th>
              <td>{money(42000)}</td>
            </tr>
          </tbody>
        </table>
      </Section>
    </>
  );

  const advancedMapsPage = (
    <>
      <Section title="Mapa de medições">
        <p>Edite a quantidade de cada item e reveja o subtotal.</p>
        {selected.quantities.map((item) => (
          <fieldset key={item.item}>
            <legend>{item.item}</legend>
            <p>
              Unidade: {item.unit} · Preço unitário: {money(prices[item.item] ?? 0)}
            </p>
            <label htmlFor={`advanced-${item.item}`}>Quantidade</label>
            <br />
            <input
              id={`advanced-${item.item}`}
              type="number"
              value={advancedQuantities[item.item] ?? item.quantity}
              min="0"
              onChange={(event) =>
                setAdvancedQuantities((current) => ({
                  ...current,
                  [item.item]: Number(event.target.value),
                }))
              }
            />
            <p>
              Subtotal:{" "}
              {money((advancedQuantities[item.item] ?? item.quantity) * (prices[item.item] ?? 0))}
            </p>
          </fieldset>
        ))}
        <button
          onClick={() =>
            setNotice(
              "Alterações do mapa demonstrativo revistas. A edição não altera documentos reais.",
            )
          }
        >
          Rever edição
        </button>
      </Section>
      <Section title="Cronograma financeiro editável">
        <p>
          Período 1: <label htmlFor="period-one">percentagem</label>{" "}
          <input
            id="period-one"
            type="number"
            value={periodOne}
            onChange={(event) => setPeriodOne(event.target.value)}
            min="0"
            max="100"
          />
          %
        </p>
        <p>
          Período 2: <label htmlFor="period-two">percentagem</label>{" "}
          <input
            id="period-two"
            type="number"
            value={periodTwo}
            onChange={(event) => setPeriodTwo(event.target.value)}
            min="0"
            max="100"
          />
          %
        </p>
        <button
          onClick={() =>
            setNotice(
              financialPercentageTotal === 100
                ? "Cronograma demonstrativo validado. As percentagens totalizam 100%."
                : `Cronograma inválido neste exemplo: as percentagens totalizam ${financialPercentageTotal}%. Ajuste os períodos para somar 100%.`,
            )
          }
        >
          Validar cronograma
        </button>
        <p>Exemplos e formatos avançados precisam de validação antes de automatizar.</p>
      </Section>
      <Section title="Importar e exportar">
        <label htmlFor="advanced-import">Exemplo fictício</label>
        <br />
        <select
          id="advanced-import"
          value={demoImport}
          onChange={(event) => setDemoImport(event.target.value)}
        >
          <option>Mapa de medições de demonstração.csv</option>
          <option>Cronograma financeiro de demonstração.xlsx</option>
        </select>
        <p>
          <button
            onClick={() =>
              setNotice("Pré-visualização importada. Confirme cada linha antes de a aceitar.")
            }
          >
            Simular importação
          </button>{" "}
          <button
            onClick={() =>
              setNotice("Falha simulada na importação. Verifique o formato ou cancele.")
            }
          >
            Simular falha
          </button>
        </p>
        <button onClick={() => setShowExport((value) => !value)}>Pré-visualizar exportação</button>
        {showExport && <pre>Item;Unidade;Quantidade\nReparação de cobertura;m²;240</pre>}
      </Section>
    </>
  );

  const contractPage = (
    <>
      <Section title="Padrões neste conjunto demonstrativo">
        <p>Conjunto fictício: 5 procedimentos de construção incluídos nesta demonstração.</p>
        <table>
          <caption>Critérios ilustrativos de comparação</caption>
          <thead>
            <tr>
              <th scope="col">Critério</th>
              <th scope="col">Observação</th>
              <th scope="col">Limite</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Prazo médio de entrega</th>
              <td>21 dias no conjunto</td>
              <td>Exemplo pequeno, não representa o mercado</td>
            </tr>
            <tr>
              <th scope="row">Percentagem com cronograma financeiro</th>
              <td>40% nos exemplos</td>
              <td>Não indica uma regra geral</td>
            </tr>
            <tr>
              <th scope="row">Resultado repetido</th>
              <td>2 vitórias associadas ao mesmo nome fictício</td>
              <td>Não demonstra fraude ou irregularidade</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Section title="Rever o método">
        <label htmlFor="pattern-scope">Âmbito da análise</label>
        <br />
        <select id="pattern-scope">
          <option>Procedimentos fictícios de construção</option>
          <option>Exemplos com cronograma financeiro</option>
        </select>
        <p>Não há consulta ao Diário da República, Portal BASE ou outra fonte pública.</p>
        <button
          onClick={() =>
            setNotice(
              "Resumo metodológico demonstrativo. Verifique número de exemplos, critérios e possíveis dados em falta antes de tirar conclusões.",
            )
          }
        >
          Ver resumo metodológico
        </button>
      </Section>
    </>
  );

  const content: Record<Page, ReactNode> = {
    inicio: home,
    oportunidades: opportunityPage,
    convites: invitePage,
    prazos: deadlinePage,
    proposta: proposalPage,
    acompanhamento: trackingPage,
    fornecedores: supplierPage,
    obras: worksPage,
    recursos: resourcePage,
    materiais: materialPage,
    financas: financePage,
    planeamento: planningPage,
    "pos-obra": afterWorkPage,
    perfil: profilePage,
    concorrentes: competitorsPage,
    assistente: assistantPage,
    "historico-precos": historyPage,
    referencias: referencesPage,
    previsoes: forecastPage,
    waterfall: waterfallPage,
    "mapas-avancados": advancedMapsPage,
    "padroes-contratos": contractPage,
  };

  return (
    <>
      <header>
        <p>
          <button onClick={() => navigate("inicio")}>Cairn</button> · Protótipo interativo
        </p>
        <p>
          <strong>Demonstração com dados fictícios.</strong> Não envia documentos, consulta serviços
          externos nem executa operações reais.
        </p>
        <p>Data de referência fixa: {date(referenceDate)} · Estado temporário, sem persistência</p>
        <button onClick={resetDemo}>Reiniciar demonstração</button>
      </header>
      <div>
        <nav aria-label="Tarefas">
          <h2>Navegação</h2>
          <ul>
            <li>
              <button
                aria-current={page === "inicio" ? "page" : undefined}
                onClick={() => navigate("inicio")}
              >
                Visão geral
              </button>
            </li>
          </ul>
          {navigation.map((group) => (
            <section key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      aria-current={page === item.id ? "page" : undefined}
                      onClick={() => navigate(item.id)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
        <main>
          <h1>{pageTitles[page]}</h1>
          {notice && <Notice>{notice}</Notice>}
          {content[page]}
          <details
            open={showDemoControls}
            onToggle={(event) => setShowDemoControls(event.currentTarget.open)}
          >
            <summary>Controlos da demonstração</summary>
            <p>
              Use estes controlos para rever estados alternativos. Não afetam serviços externos.
            </p>
            <p>
              <label>
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(event) => setSimulateFailure(event.target.checked)}
                />
                Simular falha ao abrir a plataforma externa durante a submissão
              </label>
            </p>
            <p>
              <button
                onClick={() => {
                  setSearch("sem correspondência");
                  navigate("oportunidades");
                }}
              >
                Mostrar pesquisa sem resultados
              </button>
            </p>
            <p>
              <button
                onClick={() => {
                  setSelectedId("obra-praca");
                  navigate("proposta");
                }}
              >
                Abrir proposta com prazo ultrapassado
              </button>
            </p>
            <p>
              <button
                onClick={() => {
                  setSelectedId("obra-escola");
                  setPreparedDocuments((current) => ({
                    ...current,
                    [selected.id]: ["Declaração de proposta"],
                  }));
                  setPrices({ ...initialPrices, "Reparação de cobertura": 0 });
                  setReadySchedules((current) => ({ ...current, [selected.id]: false }));
                  navigate("proposta");
                  setNotice("Estado incompleto carregado: faltam documentos, preços e cronograma.");
                }}
              >
                Abrir proposta incompleta
              </button>
            </p>
            <p>
              <button
                onClick={() =>
                  setNotice(
                    "Falha simulada na importação. Reveja o formato, tente um exemplo incluído ou cancele. Nenhum ficheiro foi alterado.",
                  )
                }
              >
                Simular falha de importação
              </button>
            </p>
            <p>
              <button
                onClick={() =>
                  setNotice(
                    "Falha simulada na leitura da cotação. Escolha um exemplo incluído, tente novamente ou cancele. Nenhum e-mail foi consultado.",
                  )
                }
              >
                Simular falha de leitura de cotação
              </button>
            </p>
          </details>
        </main>
      </div>
      <footer>
        <p>Cairn · Demonstração local · Nenhuma operação real foi executada.</p>
      </footer>
    </>
  );
}
