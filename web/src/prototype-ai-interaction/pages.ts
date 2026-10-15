// PROTOTYPE (throwaway, issue #64): simulated semantic page search (idea M13). A real
// version would ask Jev to classify the query; this one scores loose keywords and adds
// random jitter so the ranking visibly changes between runs, like a non-deterministic model.

export type PageId = "obras" | "prazos" | "mapa" | "perfil" | "documentos";

export type AppPage = { id: PageId; title: string; description: string; keywords: string[] };

export const appPages: AppPage[] = [
  {
    id: "obras",
    title: "Obras",
    description: "Lista de anúncios e convites, com detalhe, estado e checklist.",
    keywords: [
      "obra",
      "concurso",
      "anuncio",
      "convite",
      "oportunidad",
      "lista",
      "procedimento",
      "detalhe",
    ],
  },
  {
    id: "prazos",
    title: "Prazos",
    description: "Datas-limite de entrega ordenadas, com aviso de proximidade.",
    keywords: [
      "prazo",
      "data",
      "limite",
      "urgente",
      "semana",
      "fecha",
      "entrega",
      "calendario",
      "quando",
      "atras",
    ],
  },
  {
    id: "mapa",
    title: "Mapa",
    description: "Onde estão as obras à volta da empresa e dentro do raio.",
    keywords: ["mapa", "onde", "localizac", "distancia", "perto", "proxim", "regiao", "local"],
  },
  {
    id: "perfil",
    title: "Perfil da empresa",
    description: "Localização, raio de pesquisa, classe e licenças.",
    keywords: [
      "perfil",
      "empresa",
      "classe",
      "licenc",
      "alvara",
      "habilitac",
      "raio",
      "localizac",
      "configur",
      "definic",
    ],
  },
  {
    id: "documentos",
    title: "Documentos da proposta",
    description: "Checklist dos documentos a preparar em cada participação.",
    keywords: [
      "document",
      "checklist",
      "marcar",
      "falta",
      "preparar",
      "anexo",
      "deucp",
      "proposta",
      "papeis",
      "entregar",
    ],
  },
];

// Loose associations stand in for the semantic closeness a language model would infer.
const related: Record<PageId, PageId[]> = {
  obras: ["prazos", "documentos"],
  prazos: ["obras", "documentos"],
  mapa: ["obras", "perfil"],
  perfil: ["mapa", "obras"],
  documentos: ["obras", "prazos"],
};

const jitter = () => (Math.random() - 0.5) * 0.4;

export type PageMatch = { page: AppPage; score: number; reason: string };

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function rankPages(query: string): PageMatch[] {
  const tokens = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
  const matches: PageMatch[] = [];
  for (const page of appPages) {
    const hits = new Set<string>();
    for (const token of tokens) {
      for (const keyword of page.keywords) {
        if (keyword.startsWith(token) || token.startsWith(keyword)) hits.add(keyword);
      }
      if (normalize(page.title).includes(token)) hits.add(normalize(page.title));
    }
    if (hits.size === 0) continue;
    const base = Math.min(1, hits.size / 2.5);
    const score = Math.max(0.05, Math.min(0.99, base + jitter()));
    matches.push({ page, score, reason: `Relacionado com: ${[...hits].join(", ")}` });
  }
  const primaries = matches.slice();
  for (const primary of primaries) {
    for (const id of related[primary.page.id]) {
      const page = appPages.find((p) => p.id === id);
      if (page === undefined || matches.some((m) => m.page.id === id)) continue;
      const score = Math.max(0.05, Math.min(0.9, primary.score * 0.55 + jitter() * 0.5));
      matches.push({ page, score, reason: `Associada a «${primary.page.title}»` });
    }
  }
  return matches.toSorted((a, b) => b.score - a.score);
}
