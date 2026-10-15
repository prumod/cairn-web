// PROTOTYPE (throwaway, issue #64): deterministic keyword matching that stands in
// for an AI model. It only proposes changes; every variant asks the person to confirm.

import {
  type Change,
  type Db,
  type Procedure,
  daysUntilDeadline,
  deadlineNote,
  describeChange,
  euro,
  formatDateTime,
  inRadius,
  looksCompatible,
  missingDocuments,
  participationOf,
  procedureById,
  reviewRequirements,
  statusLabel,
  visibleProcedures,
} from "./data";

export type AiReply = { text: string; changes: Change[]; focusIds: string[] };

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const hasAny = (text: string, words: string[]) => words.some((w) => text.includes(w));

function targetsOf(db: Db, text: string, contextId: string | null): Procedure[] {
  const named = db.procedures.filter((p) => hasAny(text, p.keywords));
  if (named.length > 0) return named;
  return contextId === null ? [] : [procedureById(db, contextId)];
}

export function summarize(db: Db, procedure: Procedure): string {
  const origin = procedure.origin === "convite" ? "Convite (aviso por e-mail simulado)" : "Anúncio";
  return [
    `${procedure.title} — ${procedure.buyer}.`,
    `${origin}. ${procedure.place}, a ${procedure.distanceKm} km.`,
    `Valor anunciado ${euro.format(procedure.announcedValue)} (não é o valor proposto).`,
    `Entrega até ${formatDateTime(procedure.deadline)} (${deadlineNote(procedure)}) em ${procedure.platform}.`,
    `Prazo de execução: ${procedure.executionDays} dias.`,
    `Estado: ${statusLabel[participationOf(db, procedure.id).status]}.`,
  ].join(" ");
}

export function reviewText(db: Db, procedure: Procedure): string {
  const review = reviewRequirements(db.company, procedure);
  const classLine = review.classOk
    ? `Classe exigida ${procedure.requiredClass}, perfil ${db.company.companyClass}: parece cumprir.`
    : `Classe exigida ${procedure.requiredClass}, perfil ${db.company.companyClass}: incompatibilidade aparente.`;
  const licenceLine =
    review.missingLicences.length === 0
      ? "Licenças pedidas presentes no perfil."
      : `Licenças em falta no perfil: ${review.missingLicences.join(", ")}.`;
  return `${classLine} ${licenceLine} Apoio à revisão, não parecer jurídico — a decisão é sua.`;
}

function missingText(db: Db, procedure: Procedure): string {
  const missing = missingDocuments(db, procedure);
  if (missing.length === 0)
    return `${procedure.title}: todos os documentos estão marcados como preparados.`;
  const names = missing.map((d) => `${d.name}${d.mandatory ? "" : " (opcional)"}`);
  return `${procedure.title} — por preparar: ${names.join("; ")}.`;
}

function listText(procedures: Procedure[]): string {
  if (procedures.length === 0) return "Nenhuma obra encontrada com estes critérios.";
  return procedures
    .map((p) => `• ${p.title} (${p.place}, ${p.distanceKm} km, ${deadlineNote(p)})`)
    .join("\n");
}

function statusChange(
  db: Db,
  procedure: Procedure,
  status: Change & { kind: "set-status" },
): AiReply {
  const current = participationOf(db, procedure.id).status;
  if (current === status.status) {
    return {
      text: `${procedure.title} já está em «${statusLabel[current]}».`,
      changes: [],
      focusIds: [procedure.id],
    };
  }
  const notes = [describeChange(db, status) + "."];
  if (
    status.status === "em-preparacao" &&
    !looksCompatible(reviewRequirements(db.company, procedure))
  ) {
    notes.push("Atenção: os requisitos parecem incompatíveis com o perfil.");
  }
  if (procedure.origin === "convite") {
    notes.push(
      "A aceitação ou recusa formal do convite faz-se na plataforma; aqui fica a decisão interna.",
    );
  }
  return { text: notes.join(" "), changes: [status], focusIds: [procedure.id] };
}

function documentChanges(db: Db, procedure: Procedure, text: string): Change[] {
  const missing = missingDocuments(db, procedure);
  const chosen = hasAny(text, ["arquivo", "ja temos", "temos", "reutiliz"])
    ? missing.filter((d) => d.inCompanyArchive)
    : hasAny(text, ["todos", "tudo"])
      ? missing
      : missing.filter((d) => hasAny(text, d.keywords));
  return chosen.map((d) => ({
    kind: "set-document",
    procedureId: procedure.id,
    documentId: d.id,
    prepared: true,
  }));
}

const needTarget: AiReply = {
  text: "Qual obra? Indique, por exemplo, «escola», «rua», «mercado» ou «muro».",
  changes: [],
  focusIds: [],
};

export function interpret(db: Db, prompt: string, contextId: string | null = null): AiReply {
  const text = normalize(prompt);
  const targets = targetsOf(db, text, contextId);
  const target = targets[0];

  const radius = /(\d+)\s*km/.exec(text);
  if (radius?.[1] !== undefined) {
    const radiusKm = Number(radius[1]);
    const preview = { ...db, company: { ...db.company, radiusKm } };
    const found = visibleProcedures(preview);
    const changes: Change[] =
      radiusKm === db.company.radiusKm ? [] : [{ kind: "set-radius", radiusKm }];
    return {
      text: `Obras até ${radiusKm} km:\n${listText(found)}`,
      changes,
      focusIds: found.map((p) => p.id),
    };
  }

  if (hasAny(text, ["posso", "requisit", "habilit", "compativel", "cumpr", "elegiv"])) {
    if (target === undefined) return needTarget;
    return { text: reviewText(db, target), changes: [], focusIds: [target.id] };
  }

  if (hasAny(text, ["nao concorr", "nao particip", "recus", "descart", "ignora"])) {
    if (target === undefined) return needTarget;
    return statusChange(db, target, {
      kind: "set-status",
      procedureId: target.id,
      status: "nao-concorrer",
    });
  }

  if (hasAny(text, ["particip", "concorr", "avanca", "preparar a proposta", "vamos a"])) {
    if (target === undefined) return needTarget;
    return statusChange(db, target, {
      kind: "set-status",
      procedureId: target.id,
      status: "em-preparacao",
    });
  }

  if (hasAny(text, ["analis", "interess", "guarda"])) {
    if (target === undefined) return needTarget;
    return statusChange(db, target, {
      kind: "set-status",
      procedureId: target.id,
      status: "em-analise",
    });
  }

  if (hasAny(text, ["marc", "preparad", "ja temos", "arquivo", "anexa"])) {
    if (target === undefined) return needTarget;
    const changes = documentChanges(db, target, text);
    if (changes.length === 0) {
      return {
        text: "Não encontrei documentos por preparar com essa descrição.",
        changes,
        focusIds: [target.id],
      };
    }
    const lines = changes.map((c) => describeChange(db, c));
    return { text: `Proponho marcar:\n${lines.join("\n")}`, changes, focusIds: [target.id] };
  }

  if (hasAny(text, ["falta", "checklist", "document"])) {
    const scope =
      targets.length > 0
        ? targets
        : visibleProcedures(db).filter((p) => participationOf(db, p.id).status === "em-preparacao");
    if (scope.length === 0)
      return { text: "Nenhuma participação em preparação.", changes: [], focusIds: [] };
    return {
      text: scope.map((p) => missingText(db, p)).join("\n"),
      changes: [],
      focusIds: scope.map((p) => p.id),
    };
  }

  if (hasAny(text, ["prazo", "urgent", "fecha", "quando"])) {
    const found = targets.length > 0 ? targets : visibleProcedures(db);
    return {
      text: `Por prazo de entrega:\n${listText(found)}`,
      changes: [],
      focusIds: found.map((p) => p.id),
    };
  }

  if (target !== undefined && hasAny(text, ["resum", "detalh", "o que e", "fala", "explica"])) {
    return { text: summarize(db, target), changes: [], focusIds: [target.id] };
  }

  if (
    hasAny(text, ["mostr", "encontr", "pesquis", "obras", "lista", "oportunidad", "novas", "hoje"])
  ) {
    const found = visibleProcedures(db);
    return {
      text: `Obras no raio de ${db.company.radiusKm} km de ${db.company.place}:\n${listText(found)}`,
      changes: [],
      focusIds: found.map((p) => p.id),
    };
  }

  if (target !== undefined)
    return { text: summarize(db, target), changes: [], focusIds: [target.id] };

  return {
    text: "Não percebi o pedido (a IA desta demonstração é simulada). Experimente: «mostra obras até 30 km», «posso concorrer à escola?», «participar na escola», «o que falta na escola?».",
    changes: [],
    focusIds: [],
  };
}

// ---------- Agent plans (variant D) ----------

export type StepResult = { detail: string; changes: Change[] };

export type AgentStep = {
  id: string;
  title: string;
  needsApproval: boolean;
  procedureId: string | null;
  // Evaluated when the step is reached, so it sees the changes approved in earlier steps.
  run: (db: Db) => StepResult;
};

export type AgentPlan = { summary: string; steps: AgentStep[] };

function preparationPlan(procedure: Procedure): AgentPlan {
  const id = procedure.id;
  return {
    summary: `Preparar a participação em «${procedure.title}».`,
    steps: [
      {
        id: "consultar",
        title: "Consultar o concurso",
        needsApproval: false,
        procedureId: id,
        run: (db) => ({ detail: summarize(db, procedure), changes: [] }),
      },
      {
        id: "requisitos",
        title: "Rever requisitos",
        needsApproval: false,
        procedureId: id,
        run: (db) => ({ detail: reviewText(db, procedure), changes: [] }),
      },
      {
        id: "decidir",
        title: "Registar decisão: participar",
        needsApproval: true,
        procedureId: id,
        run: (db) => {
          const reply = statusChange(db, procedure, {
            kind: "set-status",
            procedureId: id,
            status: "em-preparacao",
          });
          return { detail: reply.text, changes: reply.changes };
        },
      },
      {
        id: "faltas",
        title: "Identificar documentos em falta",
        needsApproval: false,
        procedureId: id,
        run: (db) => ({ detail: missingText(db, procedure), changes: [] }),
      },
      {
        id: "arquivo",
        title: "Marcar documentos que já existem no arquivo (fictício)",
        needsApproval: true,
        procedureId: id,
        run: (db) => {
          const changes = documentChanges(db, procedure, "arquivo");
          const detail =
            changes.length === 0
              ? "Nada a reutilizar do arquivo."
              : changes.map((c) => describeChange(db, c)).join("\n");
          return { detail, changes };
        },
      },
      {
        id: "resumo",
        title: "Resumir o que falta fazer por si",
        needsApproval: false,
        procedureId: id,
        run: (db) => ({ detail: missingText(db, procedure), changes: [] }),
      },
    ],
  };
}

function triagePlan(db: Db): AgentPlan {
  const fresh = visibleProcedures(db).filter((p) => participationOf(db, p.id).status === "nova");
  return {
    summary: `Triagem de ${fresh.length} oportunidade(s) sem decisão no raio de ${db.company.radiusKm} km.`,
    steps: fresh.map((procedure) => ({
      id: `triagem-${procedure.id}`,
      title: `Triagem: ${procedure.title}`,
      needsApproval: true,
      procedureId: procedure.id,
      run: (current: Db) => {
        const compatible = looksCompatible(reviewRequirements(current.company, procedure));
        const status = compatible ? "em-analise" : "nao-concorrer";
        const reply = statusChange(current, procedure, {
          kind: "set-status",
          procedureId: procedure.id,
          status,
        });
        return {
          detail: `${reviewText(current, procedure)}\nProposta: ${reply.text}`,
          changes: reply.changes,
        };
      },
    })),
  };
}

export function planFor(db: Db, goal: string): AgentPlan {
  const text = normalize(goal);
  if (hasAny(text, ["triagem", "novas", "oportunidades", "rever todas"])) return triagePlan(db);
  const target = targetsOf(db, text, null)[0];
  if (target === undefined) {
    return {
      summary: "Objetivo sem obra identificada.",
      steps: [
        {
          id: "esclarecer",
          title: "Pedir esclarecimento",
          needsApproval: false,
          procedureId: null,
          run: () => ({ detail: needTarget.text, changes: [] }),
        },
      ],
    };
  }
  return preparationPlan(target);
}

// ---------- Proactive suggestions (variant E) ----------

export type Suggestion = {
  id: string;
  procedureId: string | null;
  title: string;
  reason: string;
  changes: Change[];
};

export function suggestionsFor(db: Db): Suggestion[] {
  const suggestions: Suggestion[] = [];
  for (const procedure of db.procedures) {
    const participation = participationOf(db, procedure.id);
    const review = reviewRequirements(db.company, procedure);
    const undecided = participation.status === "nova" || participation.status === "em-analise";

    if (!inRadius(db, procedure)) {
      const radiusKm = Math.ceil(procedure.distanceKm / 5) * 5;
      suggestions.push({
        id: `raio-${procedure.id}-${db.company.radiusKm}`,
        procedureId: procedure.id,
        title: `Há uma obra a ${procedure.distanceKm} km, fora do raio`,
        reason: `«${procedure.title}» (${euro.format(procedure.announcedValue)}) fica fora dos ${db.company.radiusKm} km atuais.`,
        changes: [{ kind: "set-radius", radiusKm }],
      });
      continue;
    }

    if (undecided && daysUntilDeadline(procedure) <= 3) {
      suggestions.push({
        id: `prazo-${procedure.id}`,
        procedureId: procedure.id,
        title: `Prazo próximo: ${procedure.title}`,
        reason: `Entrega até ${formatDateTime(procedure.deadline)} (${deadlineNote(procedure)}) e ainda não há decisão de participar.`,
        changes: [],
      });
    }

    if (undecided && !looksCompatible(review)) {
      suggestions.push({
        id: `incompativel-${procedure.id}`,
        procedureId: procedure.id,
        title: `Não concorrer a «${procedure.title}»?`,
        reason: reviewText(db, procedure),
        changes: [{ kind: "set-status", procedureId: procedure.id, status: "nao-concorrer" }],
      });
    } else if (participation.status === "nova") {
      const origin =
        procedure.origin === "convite"
          ? `Convite recebido a ${procedure.receivedOn} (aviso por e-mail simulado).`
          : `Anúncio publicado a ${procedure.receivedOn}.`;
      suggestions.push({
        id: `analisar-${procedure.id}`,
        procedureId: procedure.id,
        title: `Nova oportunidade compatível: ${procedure.title}`,
        reason: `${origin} A ${procedure.distanceKm} km; requisitos parecem compatíveis com o perfil.`,
        changes: [{ kind: "set-status", procedureId: procedure.id, status: "em-analise" }],
      });
    }

    if (participation.status === "em-preparacao") {
      const archive = documentChanges(db, procedure, "arquivo");
      if (archive.length > 0) {
        suggestions.push({
          id: `arquivo-${procedure.id}`,
          procedureId: procedure.id,
          title: `Reutilizar ${archive.length} documento(s) do arquivo`,
          reason: `Existem versões no arquivo da empresa (fictício) para ${procedure.title}.`,
          changes: archive,
        });
      }
    }
  }
  return suggestions;
}
