// PROTOTYPE: a deterministic stand-in for an AI agent with tools. It turns a
// Portuguese request into tool calls. A real agent would let a model choose the calls; the
// tools and their results would stay the same. No call changes contest data.

import {
  type Contest,
  type WorkType,
  buyers,
  company,
  contestById,
  euro,
  places as allPlaces,
  publicationDates,
  today,
} from "./data";
import { type Filters, type View, defaultFilters, describeFilters, visibleContests } from "./view";

export type ToolCall =
  | { tool: "filtrar"; args: Partial<Filters> & { limpar?: boolean } }
  // An empty list means every locality.
  | { tool: "filtrar_localidades"; args: { places: string[] } }
  | { tool: "pesquisar_anuncios"; args: { date: string } }
  | { tool: "mostrar_concursos"; args: { ids: string[] } }
  | { tool: "abrir_concurso"; args: { id: string } }
  | { tool: "comparar"; args: { ids: string[] } };

export type ToolStep = {
  call: ToolCall;
  line: string;
  // The view after this call, derived from the view before it.
  after: View;
  // Contests this step is about, for cards and the mini map in the chat.
  ids: string[];
};

export type AgentReply = { text: string; steps: ToolStep[] };

export const suggestedPrompts = [
  "Mostra obras até 30 km",
  "Mostra obras em Leiria e Pombal",
  "Quais os 2 prazos mais urgentes?",
  "Só edifícios publicados ontem",
  "Compara a escola com o mercado",
  "Abre o muro de Alcobaça",
  "Obras publicadas hoje",
];

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const names: { id: string; words: RegExp }[] = [
  { id: "escola", words: /\bescola|marrazes/ },
  { id: "pavilhao", words: /pavilhao/ },
  { id: "rua", words: /\brua\b|moinho|pavimentacao da rua/ },
  { id: "largo", words: /\blargo|igreja/ },
  { id: "muro", words: /\bmuro|en 356/ },
  { id: "mercado", words: /mercado/ },
  { id: "cemiterio", words: /cemiterio/ },
  { id: "saude", words: /saude|condeixa/ },
];

const countWords: Record<string, number> = { um: 1, dois: 2, duas: 2, tres: 3, quatro: 4 };

const shortTitle = (c: Contest) =>
  c.title.replace(/^(Requalificação|Reabilitação|Ampliação) d[aeo]s? /, "");
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function monthDay(text: string): string | null {
  if (/\bhoje\b/.test(text)) return today;
  if (/\bontem\b/.test(text)) return "2026-10-14";
  const day = /(?:dia\s+)?\b(1[0-5]|0?[0-9])\s+de\s+outubro|\bdia\s+(1[0-5])\b/.exec(text);
  const number = day?.[1] ?? day?.[2];
  if (number === undefined) return null;
  const iso = `2026-10-${number.padStart(2, "0")}`;
  return publicationDates.includes(iso) ? iso : null;
}

function filterArgs(text: string): ToolCall["args"] & Partial<Filters> {
  const args: Partial<Filters> = {};
  const km = /(\d+)\s*km/.exec(text);
  if (km?.[1] !== undefined) args.maxKm = Math.min(Number(km[1]), company.radiusKm);
  const types: WorkType[] = [];
  if (/edifici/.test(text)) types.push("Edifícios");
  if (/\bvias?\b|estrada|pavimenta/.test(text) && !/pavilhao/.test(text))
    types.push("Vias de comunicação");
  if (/espaco|urban/.test(text)) types.push("Espaços públicos");
  if (types.length > 0) args.workTypes = types;
  const above = /(?:acima de|mais de|pelo menos)\s*(\d+)\s*(?:mil|k)/.exec(text);
  const below = /(?:abaixo de|menos de|ate|no maximo)\s*(\d+)\s*(?:mil|k)\b/.exec(text);
  if (above?.[1] !== undefined) args.minValue = Number(above[1]) * 1000;
  if (below?.[1] !== undefined) args.maxValue = Number(below[1]) * 1000;
  if (/entidade|municipio|freguesia|camara/.test(text)) {
    const buyer = buyers.find((b) => normalize(b).includes(normalize(places(text) ?? "~")));
    if (buyer !== undefined) args.buyer = buyer;
  }
  return args;
}

function places(text: string): string | null {
  for (const place of [
    "marinha grande",
    "leiria",
    "batalha",
    "alcobaca",
    "pombal",
    "ourem",
    "condeixa",
  ]) {
    if (text.includes(place)) return place;
  }
  return null;
}

function topCount(text: string): number {
  const digit = /\b(\d)\b/.exec(text.replace(/\d+\s*km/g, ""));
  if (digit?.[1] !== undefined) return Number(digit[1]);
  for (const [word, n] of Object.entries(countWords))
    if (new RegExp(`\\b${word}\\b`).test(text)) return n;
  return 3;
}

// Applies one tool call to a view and describes it.
export function runTool(view: View, call: ToolCall): ToolStep {
  switch (call.tool) {
    case "filtrar": {
      const { limpar, ...patch } = call.args;
      const filters = { ...(limpar === true ? defaultFilters : view.filters), ...patch };
      const after = { ...view, filters, highlighted: [], compare: null };
      const ids = visibleContests(after).map((c) => c.id);
      const label =
        limpar === true && Object.keys(patch).length === 0
          ? "sem filtros"
          : describeFilters(filters);
      return {
        call,
        after,
        ids,
        line: `filtrar · ${label} → ${plural(ids.length, "concurso", "concursos")}`,
      };
    }
    case "filtrar_localidades": {
      const { places } = call.args;
      const after = {
        ...view,
        filters: { ...view.filters, localities: places },
        picked: [],
        highlighted: [],
        open: null,
      };
      const ids = visibleContests(after).map((c) => c.id);
      const label = places.length === 0 ? "todas" : places.join(", ");
      return {
        call,
        after,
        ids,
        line: `filtrar localidades · ${label} → ${plural(ids.length, "concurso", "concursos")}`,
      };
    }
    case "pesquisar_anuncios": {
      const filters = { ...view.filters, publishedOn: call.args.date };
      const after = { ...view, filters, highlighted: [], compare: null };
      const ids = visibleContests(after).map((c) => c.id);
      return {
        call,
        after,
        ids,
        line: `pesquisar anúncios · ${call.args.date} → ${plural(ids.length, "concurso", "concursos")}`,
      };
    }
    case "mostrar_concursos": {
      const after = { ...view, highlighted: call.args.ids, open: null };
      return {
        call,
        after,
        ids: call.args.ids,
        line: `mostrar nas obras · ${plural(call.args.ids.length, "concurso", "concursos")}`,
      };
    }
    case "abrir_concurso": {
      const contest = contestById(call.args.id);
      const localities = view.filters.localities.includes(contest.place)
        ? view.filters.localities
        : [...view.filters.localities, contest.place];
      const after = {
        ...view,
        filters: { ...view.filters, localities },
        open: contest.id,
        compare: null,
      };
      return { call, after, ids: [contest.id], line: `abrir concurso · ${shortTitle(contest)}` };
    }
    case "comparar": {
      const after = { ...view, compare: call.args.ids, open: null, highlighted: call.args.ids };
      return {
        call,
        after,
        ids: call.args.ids,
        line: `comparar · ${call.args.ids.map((id) => shortTitle(contestById(id))).join(" × ")}`,
      };
    }
  }
}

export function interpret(prompt: string, view: View): AgentReply {
  const text = normalize(prompt);
  const calls: ToolCall[] = [];
  const notes: string[] = [];

  const reset = /limpa|remove|tira|repoe|sem filtros/.test(text) && /filtro|tudo|inicio/.test(text);
  const args = filterArgs(text);
  const asked = /(\d+)\s*km/.exec(text);
  if (asked?.[1] !== undefined && Number(asked[1]) > company.radiusKm) {
    notes.push(`O raio da empresa é de ${company.radiusKm} km; não pesquiso para além dele.`);
  }
  if (reset || Object.keys(args).length > 0)
    calls.push({ tool: "filtrar", args: { ...args, limpar: reset } });

  // Localities are a filter of their own: named with a locality word, or cleared.
  const localityWord = /localidade|\bem\b|\bso\b|\bapenas\b/.test(text);
  const clearPlaces =
    /(todas|todos) (as |os )?localidades|sem localidades?|limpa\w* (as )?localidades/.test(text);
  const mentioned = allPlaces.filter((p) => text.includes(normalize(p)));
  if (clearPlaces || (mentioned.length > 0 && localityWord))
    calls.push({ tool: "filtrar_localidades", args: { places: clearPlaces ? [] : mentioned } });

  const date = monthDay(text);
  if (date !== null) calls.push({ tool: "pesquisar_anuncios", args: { date } });

  const named = names.filter((n) => n.words.test(text)).map((n) => n.id);
  const wantsOpen = /\babr[ae]|\babrir|detalhe|consult|\bver\b/.test(text);
  const wantsCompare = /compar|diferenc|\bvs\b/.test(text);
  const wantsRank = /urgent|prazo|proxim[oa]s? do fim|car[ao]s|maiores|valor mais|valios/.test(
    text,
  );

  let working = view;
  const stepsSoFar: ToolStep[] = [];
  const run = (call: ToolCall) => {
    const step = runTool(working, call);
    working = step.after;
    stepsSoFar.push(step);
  };
  for (const call of calls) run(call);

  if (wantsRank) {
    const pool = visibleContests(working);
    const byValue = /car[ao]s|maiores|valor mais|valios/.test(text);
    const ranked = byValue
      ? pool.toSorted((a, b) => b.announcedValue - a.announcedValue)
      : pool
          .filter((c) => c.deadline !== null)
          .toSorted((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""));
    const ids = ranked.slice(0, topCount(text)).map((c) => c.id);
    if (ids.length > 0) run({ tool: "mostrar_concursos", args: { ids } });
    else notes.push("Nenhum concurso visível tem essa informação.");
  } else if (named.length > 0 && !wantsCompare && !wantsOpen) {
    run({ tool: "mostrar_concursos", args: { ids: named } });
  }

  if (wantsCompare) {
    // Contests the person ticked or cited come first, then the ones named in the request.
    const given = [...new Set([...view.selected, ...named])];
    const pool =
      given.length >= 2
        ? given
        : working.highlighted.length >= 2
          ? working.highlighted
          : visibleContests(working)
              .slice(0, 2)
              .map((c) => c.id);
    if (pool.length >= 2) run({ tool: "comparar", args: { ids: pool.slice(0, 3) } });
    else notes.push("Preciso de pelo menos dois concursos para comparar.");
  } else if (wantsOpen) {
    const id =
      named[0] ??
      view.selected[0] ??
      (working.highlighted.length === 1 ? working.highlighted[0] : undefined);
    if (id !== undefined) run({ tool: "abrir_concurso", args: { id } });
    else notes.push("Diga qual concurso quer abrir, ou selecione um na lista.");
  }

  if (stepsSoFar.length === 0) {
    return {
      steps: [],
      text: `${notes.join(" ")} Posso filtrar por distância, localidade, tipo de obra, valor, entidade e data de publicação, mostrar concursos nas obras, abrir um concurso ou compará-los. Experimente um dos pedidos sugeridos.`.trim(),
    };
  }
  return { steps: stepsSoFar, text: replyText(stepsSoFar, notes) };
}

function replyText(steps: ToolStep[], notes: string[]): string {
  const last = steps[steps.length - 1];
  if (last === undefined) return notes.join(" ");
  const parts: string[] = [];
  switch (last.call.tool) {
    case "abrir_concurso": {
      const c = contestById(last.call.args.id);
      parts.push(
        `${c.title}: ${euro.format(c.announcedValue)}, ${c.executionDays} dias de execução, plataforma ${c.platform}.`,
      );
      break;
    }
    case "comparar": {
      const list = last.ids.map((id) => contestById(id));
      const dearest = list.toSorted((a, b) => b.announcedValue - a.announcedValue)[0];
      parts.push(
        `Comparei ${list.length} concursos. O de maior valor anunciado é «${dearest?.title ?? ""}».`,
      );
      break;
    }
    default: {
      if (last.ids.length === 0) {
        parts.push(
          steps.some((s) => s.call.tool === "pesquisar_anuncios")
            ? "Não há anúncios de obras nessa data."
            : "Nenhum concurso corresponde a estes filtros. Peça-me para limpar ou alargar os filtros.",
        );
      } else {
        parts.push(
          `${plural(last.ids.length, "concurso", "concursos")}: ${last.ids.map((id) => shortTitle(contestById(id))).join("; ")}.`,
        );
      }
    }
  }
  return [...parts, ...notes].join(" ");
}
