// Throwaway review aid (#64). Questions come from the unresolved-terms document;
// neither rendering a term nor accepting an AI action confirms its definition.
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import source from "../../../docs/product/now/termos-por-definir.md?raw";
import "./terms.css";

const questions = new Map(
  [...source.matchAll(/^- \[[ x]\] \*\*(.+?)\*\* — (.+)$/gm)].map((m) => [m[1], m[2]]),
);

const areas = {
  profile: {
    label: "Perfil no painel de dados (todas as variações)",
    names: [
      "Empresa",
      "Perfil de referência da empresa",
      "Localização de referência",
      "Raio de pesquisa",
      "Habilitações da empresa",
      "Classe da empresa",
      "Licença",
    ],
    note: "Compare a nossa empresa com a entidade adjudicante. Classe e licenças são apenas declaradas; não há validação jurídica.",
  },
  states: {
    label: "Estados no painel de dados (todas as variações)",
    names: ["Participação", "Estado da participação / estado da proposta"],
    note: "A quem pertencem «Sem decisão», «Em análise», «Em preparação» e «Não concorrer»? Não são fases do procedimento público.",
  },
  listing: {
    label: "Lista e seleção de obras",
    names: ["Obra", "Concurso / procedimento", "Oportunidade", "Localização da obra"],
    note: "O mesmo exemplo pode entrar por anúncio ou convite. Depois de escolher «Não concorrer», ainda o chamamos oportunidade?",
  },
  map: {
    label: "Mapa e distância",
    names: ["Localização da obra", "Localização de referência", "Raio de pesquisa"],
    note: "O marcador da obra não é a sede da entidade. O círculo parte da referência da empresa; não representa tempo de viagem.",
  },
  deadline: {
    label: "Datas-limite e urgência",
    names: ["Prazo de submissão da proposta"],
    note: "Data/hora limite de entrega, não duração da execução. O limiar «próximo do prazo» é uma regra separada, ainda não confirmada.",
  },
  buyer: {
    label: "Entidade no detalhe ou nos contratos ganhos",
    names: ["Entidade adjudicante"],
    note: "Quem promove a contratação, não a empresa que prepara a proposta.",
  },
  origin: {
    label: "Origem e data no detalhe",
    names: ["Anúncio", "Convite", "Data de publicação"],
    note: "Lacuna a discutir: este demo usa um único campo de data para anúncio e convite. A receção de convite não é data de publicação.",
  },
  value: {
    label: "Valor anunciado",
    names: ["Valor anunciado"],
    note: "Não é o preço da nossa proposta nem o valor adjudicado. A equivalência com «preço base» não está confirmada.",
  },
  execution: {
    label: "Duração no detalhe",
    names: ["Prazo de execução da obra"],
    note: "Período previsto em dias. O início da contagem não está definido neste demo.",
  },
  platform: {
    label: "Plataforma no detalhe",
    names: ["Plataforma do procedimento"],
    note: "AcinGov/Vortal é a plataforma indicada; não é a fonte do anúncio nem uma submissão feita pelo Cairn.",
  },
  requirements: {
    label: "Perguntar «Posso concorrer?» / revisão",
    names: [
      "Revisão de requisitos",
      "Requisito de participação",
      "Habilitações da empresa",
      "Classe da empresa",
      "Licença",
    ],
    note: "O texto da IA apoia a comparação humana; não aprova a participação nem verifica habilitações legalmente.",
  },
  decision: {
    label: "Participar / Não concorrer / confirmação de alteração",
    names: [
      "Decisão de participação",
      "Participação",
      "Estado da participação / estado da proposta",
    ],
    note: "Registar intenção não é entregar uma proposta nem aceitar/recusar formalmente um convite. Uma «proposta da IA» é uma sugestão, não a Proposta do concurso.",
  },
  documents: {
    label: "Checklist no dossier / resposta sobre documentos",
    names: [
      "Proposta",
      "Documento da proposta",
      "Checklist da proposta",
      "Lista de preços unitários",
      "Memorial descritivo / memória descritiva",
    ],
    note: "A checklist é específica deste procedimento. A lista de preços e a memória aparecem só como nomes de documentos; não há edição de preços nem comparação com peças fornecidas pela entidade.",
  },
  awards: {
    label: "Contratos ganhos e ligações",
    names: ["Adjudicação", "Entidade adjudicante"],
    note: "Contratos atribuídos a outras empresas, não oportunidades abertas nem decisões da nossa empresa. Não demonstra todas as participações ou derrotas.",
  },
} as const;

type Area = keyof typeof areas;

// Fail visibly if an annotation drifts away from the canonical source document.
for (const area of Object.values(areas)) {
  for (const name of area.names) {
    if (!questions.has(name)) throw new Error(`Term missing from termos-por-definir.md: ${name}`);
  }
}

const detail: Area[] = ["buyer", "origin", "map", "value", "deadline", "execution", "platform"];
const dossier: Area[] = [...detail, "documents"];
const variants: Record<string, { areas: Area[]; exercise: string }> = {
  canvas: {
    areas: ["listing", "map", ...dossier, "requirements", "decision"],
    exercise:
      "Alterne Lista / Mapa; selecione a escola para abrir o dossier. Pergunte «Posso concorrer à escola?» e depois «Vamos participar na escola».",
  },
  contextual: {
    areas: ["listing", "map", ...dossier, "requirements", "decision"],
    exercise:
      "Selecione uma obra ou o botão de IA da linha; compare os requisitos e marque um documento da checklist.",
  },
  command: {
    areas: ["listing", "map", ...dossier, "requirements", "decision"],
    exercise:
      "Explore Obras, Prazos, Mapa, Perfil e Documentos. No detalhe, altere o estado; compare com «participar» na barra Ctrl+K.",
  },
  agent: {
    areas: [...dossier, "requirements", "decision"],
    exercise:
      "Peça «Prepara a participação na escola». Compare o estado de cada passo do agente com o estado da participação e a aprovação pedida à pessoa.",
  },
  inbox: {
    areas: ["listing", ...dossier, "requirements", "decision"],
    exercise:
      "Leia uma sugestão e abra «Ver obra». Dispensar uma sugestão não é decidir «Não concorrer».",
  },
  chatNav: {
    areas: ["listing", ...dossier, "requirements", "decision"],
    exercise:
      "Selecione a escola à esquerda; compare o dossier com o pedido de participação e a checklist na conversa.",
  },
  chatReview: {
    areas: ["listing", "map", "deadline", "requirements", "decision", "documents"],
    exercise:
      "Compare «Pesquisar», «Decidir» e «Preparar». O raio aparece como alteração, não como mapa; a checklist aparece em texto na conversa, não num dossier.",
  },
  chatBoard: {
    areas: ["listing", "map", "deadline", "requirements", "decision", "documents"],
    exercise:
      "Decida participar na escola e veja-a mudar de grupo. Compare o pipeline com as datas-limite. Requisitos e documentos aparecem só nas respostas da conversa.",
  },
  table: {
    areas: ["listing", ...detail, "requirements", "decision"],
    exercise:
      "Ordene Valor anunciado / Dias até ao prazo. Selecione uma linha para comparar a data de entrega com a duração da obra. Requisitos e decisões também podem ser pedidos no chat.",
  },
  symbols: {
    areas: ["listing", "map", "value", "awards", "requirements", "decision"],
    exercise:
      "Alterne Concursos abertos / Contratos ganhos. Compare o valor anunciado do ponto com o valor dos contratos adjudicados no anel. Revisão e decisões ficam na conversa.",
  },
  dashboard: {
    areas: ["listing", "value", "deadline", "requirements", "decision"],
    exercise:
      "Peça «Vamos participar na escola» e compare as barras por estado. O gráfico do aço mostra preço de fornecedor, não Preço unitário da proposta nem Margem.",
  },
  arcs: {
    areas: ["awards"],
    exercise:
      "Escolha Pombal e siga as ligações entidade → empresa vencedora. Esta vista discute Adjudicação; não demonstra a preparação/submissão da nossa proposta.",
  },
};

const ReviewContext = createContext({
  enabled: false,
  setEnabled: (_enabled: boolean) => {},
  inspect: (_area: Area) => {},
  focused: null as Area | null,
});

export function TermsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [focused, setFocused] = useState<Area | null>(null);
  return (
    <ReviewContext.Provider value={{ enabled, setEnabled, focused, inspect: setFocused }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function TermHint({ area }: { area: Area }) {
  const review = useContext(ReviewContext);
  if (!review.enabled) return null;
  return (
    <span className="term-hint">
      {" "}
      <button
        type="button"
        aria-label={`Rever termos: ${areas[area].names.join("; ")}`}
        onClick={(event) => {
          event.stopPropagation();
          review.inspect(area);
        }}
      >
        (termos)
      </button>
    </span>
  );
}

function AreaQuestions({ area }: { area: Area }) {
  return (
    <>
      <p>{areas[area].note}</p>
      <dl className="term-questions">
        {areas[area].names.map((name) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{questions.get(name)}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function TermsReview({ variant, id }: { variant: string; id: string }) {
  const review = useContext(ReviewContext);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (review.enabled && review.focused !== null)
      panelRef.current?.scrollIntoView({ block: "start" });
  }, [review.enabled, review.focused]);
  const mapping = variants[id];
  if (mapping === undefined) throw new Error(`No term mapping for variant ${id}`);
  const areaIds = [...new Set<Area>(["profile", "states", ...mapping.areas])];
  const names = new Set<string>(areaIds.flatMap((id) => [...areas[id].names]));
  const gaps = [...questions.keys()].filter((name) => name !== undefined && !names.has(name));
  // A focused group belongs to the previous variant until another annotation is selected.
  const focused =
    review.focused !== null && areaIds.includes(review.focused) ? review.focused : null;

  return (
    <section className="terms-review" aria-label="Revisão de termos" ref={panelRef}>
      <label className="terms-toggle">
        <input
          type="checkbox"
          checked={review.enabled}
          onChange={(event) => review.setEnabled(event.target.checked)}
        />{" "}
        Rever termos
      </label>
      {review.enabled && (
        <>
          <h2>Termos da variação {variant}</h2>
          <p>
            Questões em aberto, não definições aprovadas. Alguns exemplos só aparecem depois de
            interagir.
          </p>
          <p>{mapping.exercise}</p>
          <p>
            <small>Fonte: docs/product/now/termos-por-definir.md</small>
          </p>
          <section aria-live="polite" className="term-focus">
            {focused === null ? (
              <p>Clique em (termos) num elemento para ler as suas perguntas aqui.</p>
            ) : (
              <>
                <h3>{areas[focused].label}</h3>
                <AreaQuestions area={focused} />
              </>
            )}
          </section>
          <details>
            <summary>Todos os termos desta variação ({names.size})</summary>
            {areaIds.map((id) => (
              <details key={id}>
                <summary>{areas[id].label}</summary>
                <AreaQuestions area={id} />
              </details>
            ))}
          </details>
          <details>
            <summary>Sem exemplo suficiente nesta variação ({gaps.length})</summary>
            <p>Ausência nesta vista não significa termo resolvido ou fora do produto.</p>
            <ul>
              {gaps.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </details>
        </>
      )}
    </section>
  );
}
