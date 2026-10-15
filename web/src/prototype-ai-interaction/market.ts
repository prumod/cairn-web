// PROTOTYPE (throwaway, issue #64): fictional market data for the visualisation variants
// (I-L). Awarded contracts and price history do not exist in the Now data model; they stand
// in for the Maybe features M03 (competitors), M07 (price history) and M12 (contract patterns).
// Every company, number and trend below is invented.

import { type Db, type Procedure, euro } from "./data";
import { type AiReply, interpret } from "./simulatedAi";

export type Place = { name: string; distanceKm: number; bearingDeg: number };

export const buyers: Place[] = [
  { name: "Leiria", distanceKm: 4, bearingDeg: 300 },
  { name: "Batalha", distanceKm: 18, bearingDeg: 200 },
  { name: "Pombal", distanceKm: 31, bearingDeg: 20 },
  { name: "Alcobaça", distanceKm: 27, bearingDeg: 265 },
  { name: "Condeixa", distanceKm: 72, bearingDeg: 35 },
  { name: "Marinha Grande", distanceKm: 15, bearingDeg: 255 },
  { name: "Ourém", distanceKm: 35, bearingDeg: 110 },
];

export function buyerNamed(name: string): Place {
  const found = buyers.find((b) => b.name === name);
  if (found === undefined) throw new Error(`Unknown buyer: ${name}`);
  return found;
}

export type Competitor = { id: string; name: string; hq: Place };

export const competitors: Competitor[] = [
  {
    id: "c1",
    name: "Alfa Construções, Lda.",
    hq: { name: "Pombal", distanceKm: 36, bearingDeg: 5 },
  },
  { id: "c2", name: "Obras do Lis, S.A.", hq: { name: "Leiria", distanceKm: 10, bearingDeg: 330 } },
  { id: "c3", name: "Beta Vias, Lda.", hq: { name: "Batalha", distanceKm: 24, bearingDeg: 185 } },
  {
    id: "c4",
    name: "Terras do Alcoa, Lda.",
    hq: { name: "Alcobaça", distanceKm: 31, bearingDeg: 285 },
  },
  {
    id: "c5",
    name: "Cimeira Edifícios, S.A.",
    hq: { name: "Coimbra", distanceKm: 66, bearingDeg: 52 },
  },
];

export type WorkType = "Edifícios" | "Vias de comunicação";

export type AwardRow = {
  buyer: string;
  competitorId: string;
  workType: WorkType;
  contracts: number;
  totalValue: number;
};

const e = "Edifícios" as const;
const v = "Vias de comunicação" as const;
const row = (
  buyer: string,
  competitorId: string,
  workType: WorkType,
  contracts: number,
  totalValue: number,
): AwardRow => ({ buyer, competitorId, workType, contracts, totalValue });

// Fictional awarded contracts, 2022-2026, aggregated by buyer, winner and type of work.
export const awards: AwardRow[] = [
  row("Pombal", "c1", e, 9, 4_100_000),
  row("Pombal", "c1", v, 3, 600_000),
  row("Pombal", "c3", v, 2, 300_000),
  row("Pombal", "c2", e, 1, 500_000),
  row("Leiria", "c2", e, 6, 2_400_000),
  row("Leiria", "c2", v, 2, 400_000),
  row("Leiria", "c1", e, 2, 900_000),
  row("Leiria", "c3", v, 3, 500_000),
  row("Leiria", "c4", e, 1, 200_000),
  row("Batalha", "c3", v, 7, 1_100_000),
  row("Batalha", "c3", e, 1, 200_000),
  row("Batalha", "c2", v, 2, 300_000),
  row("Alcobaça", "c4", e, 5, 1_600_000),
  row("Alcobaça", "c4", v, 4, 700_000),
  row("Alcobaça", "c3", v, 2, 200_000),
  row("Alcobaça", "c2", e, 1, 300_000),
  row("Condeixa", "c5", e, 6, 2_800_000),
  row("Condeixa", "c1", e, 1, 800_000),
  row("Marinha Grande", "c2", e, 3, 1_000_000),
  row("Marinha Grande", "c4", v, 2, 300_000),
  row("Marinha Grande", "c3", v, 2, 350_000),
  row("Ourém", "c1", e, 4, 1_500_000),
  row("Ourém", "c5", e, 1, 400_000),
  row("Ourém", "c1", v, 2, 300_000),
];

export function competitorById(id: string): Competitor {
  const found = competitors.find((c) => c.id === id);
  if (found === undefined) throw new Error(`Unknown competitor: ${id}`);
  return found;
}

export type BuyerSummary = {
  buyer: string;
  contracts: number;
  totalValue: number;
  byCompetitor: { competitorId: string; contracts: number; totalValue: number; share: number }[];
};

export function summarizeBuyer(buyer: string, workType: WorkType | "todos"): BuyerSummary {
  const rows = awards.filter(
    (a) => a.buyer === buyer && (workType === "todos" || a.workType === workType),
  );
  const contracts = rows.reduce((sum, r) => sum + r.contracts, 0);
  const totalValue = rows.reduce((sum, r) => sum + r.totalValue, 0);
  const grouped = new Map<string, { contracts: number; totalValue: number }>();
  for (const r of rows) {
    const current = grouped.get(r.competitorId) ?? { contracts: 0, totalValue: 0 };
    grouped.set(r.competitorId, {
      contracts: current.contracts + r.contracts,
      totalValue: current.totalValue + r.totalValue,
    });
  }
  const byCompetitor = [...grouped.entries()]
    .map(([competitorId, g]) => ({
      competitorId,
      ...g,
      share: contracts === 0 ? 0 : g.contracts / contracts,
    }))
    .toSorted((a, b) => b.contracts - a.contracts);
  return { buyer, contracts, totalValue, byCompetitor };
}

// Demo-only threshold for flagging a high share; the real criteria (M12) are undefined.
export const highShare = 0.5;

export function workTypeOf(procedure: Procedure): WorkType | null {
  if (procedure.requiredLicences.includes("Edifícios")) return "Edifícios";
  if (procedure.requiredLicences.includes("Vias de comunicação")) return "Vias de comunicação";
  return null;
}

// ---------- Price history (M07) ----------

export type Material = { id: string; name: string; unit: string; validityDays: number };

export const materials: Material[] = [
  { id: "aco", name: "Aço A500 (varão)", unit: "€/t", validityDays: 2 },
  { id: "betao", name: "Betão C25/30", unit: "€/m³", validityDays: 30 },
];

export type PricePoint = { month: string; price: number };

export const priceHistory: Record<string, PricePoint[]> = {
  aco: [
    ["2025-11", 640],
    ["2025-12", 655],
    ["2026-01", 690],
    ["2026-02", 720],
    ["2026-03", 705],
    ["2026-04", 760],
    ["2026-05", 815],
    ["2026-06", 790],
    ["2026-07", 770],
    ["2026-08", 810],
    ["2026-09", 845],
    ["2026-10", 830],
  ].map(([month, price]) => ({ month: String(month), price: Number(price) })),
  betao: [
    ["2025-11", 92],
    ["2025-12", 92],
    ["2026-01", 94],
    ["2026-02", 94],
    ["2026-03", 95],
    ["2026-04", 97],
    ["2026-05", 97],
    ["2026-06", 98],
    ["2026-07", 99],
    ["2026-08", 99],
    ["2026-09", 101],
    ["2026-10", 102],
  ].map(([month, price]) => ({ month: String(month), price: Number(price) })),
};

// ---------- Simulated market answers ----------

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const hasAny = (text: string, needles: string[]) => needles.some((n) => text.includes(n));

const companyKeywords: Record<string, string[]> = {
  c1: ["alfa"],
  c2: ["lis"],
  c3: ["beta"],
  c4: ["alcoa", "terras"],
  c5: ["cimeira"],
};

function marketReply(prompt: string): AiReply | null {
  const text = normalize(prompt);

  const material = materials.find(
    (m) =>
      (m.id === "aco" && hasAny(text, ["aco", "ferro", "varao"])) ||
      (m.id === "betao" && hasAny(text, ["betao", "cimento"])),
  );
  if (material !== undefined) {
    const series = priceHistory[material.id] ?? [];
    const first = series[0];
    const last = series.at(-1);
    if (first === undefined || last === undefined) return null;
    const change = Math.round(((last.price - first.price) / first.price) * 100);
    return {
      text: `${material.name}: ${last.price} ${material.unit} em ${last.month}, ${change >= 0 ? "+" : ""}${change}% em 12 meses. A cotação costuma valer ${material.validityDays} dia(s): confirme com o fornecedor antes de a usar na proposta.`,
      changes: [],
      focusIds: [`material:${material.id}`],
    };
  }

  const place = buyers.find((b) => text.includes(normalize(b.name)));
  const competitor = competitors.find((c) =>
    (companyKeywords[c.id] ?? []).some((k) => text.includes(k)),
  );
  const asksMarket = hasAny(text, [
    "concorrent",
    "ganh",
    "venc",
    "quem",
    "domin",
    "concentr",
    "adjudic",
    "contratos",
  ]);

  if (competitor !== undefined && (asksMarket || place === undefined)) {
    const rows = awards.filter((a) => a.competitorId === competitor.id);
    const byBuyer = new Map<string, number>();
    for (const r of rows) byBuyer.set(r.buyer, (byBuyer.get(r.buyer) ?? 0) + r.contracts);
    const ranked = [...byBuyer.entries()].toSorted((a, b) => b[1] - a[1]);
    const total = rows.reduce((s, r) => s + r.contracts, 0);
    const value = rows.reduce((s, r) => s + r.totalValue, 0);
    return {
      text: `${competitor.name} (sede em ${competitor.hq.name}) ganhou ${total} contratos, ${euro.format(value)} no total (dados fictícios, 2022-2026).\nOnde: ${ranked.map(([b, n]) => `${b} (${n})`).join(", ")}.`,
      changes: [],
      focusIds: [`company:${competitor.id}`],
    };
  }

  if (place !== undefined && asksMarket) {
    const summary = summarizeBuyer(place.name, "todos");
    const top = summary.byCompetitor[0];
    if (top === undefined) return null;
    const lines = summary.byCompetitor
      .slice(0, 3)
      .map(
        (c) =>
          `${competitorById(c.competitorId).name}: ${c.contracts} contratos (${Math.round(c.share * 100)}%)`,
      );
    const caution =
      top.share >= highShare
        ? `\nUma empresa concentra ${Math.round(top.share * 100)}% dos contratos. Os dados não explicam porquê: pode merecer análise, mas não indica irregularidade.`
        : "";
    return {
      text: `Em ${place.name}: ${summary.contracts} contratos, ${euro.format(summary.totalValue)} (dados fictícios).\n${lines.join("\n")}${caution}`,
      changes: [],
      focusIds: [`place:${place.name}`],
    };
  }

  if (asksMarket) {
    const totals = competitors
      .map((c) => ({
        c,
        n: awards.filter((a) => a.competitorId === c.id).reduce((s, r) => s + r.contracts, 0),
      }))
      .toSorted((a, b) => b.n - a.n);
    return {
      text: `Concorrentes por contratos ganhos (dados fictícios):\n${totals.map((t) => `${t.c.name}: ${t.n}`).join("\n")}\nPergunte por um município ou por uma empresa.`,
      changes: [],
      focusIds: totals.slice(0, 2).map((t) => `company:${t.c.id}`),
    };
  }

  return null;
}

export function interpretWithMarket(
  db: Db,
  prompt: string,
  contextId: string | null = null,
): AiReply {
  return marketReply(prompt) ?? interpret(db, prompt, contextId);
}

export const vizPrompts = [
  "Quem ganha mais em Pombal?",
  "Onde ganha a Alfa?",
  "Como evoluiu o preço do aço?",
  "Quais os prazos mais urgentes?",
  "Mostra obras até 30 km",
  "Quem são os concorrentes?",
];
