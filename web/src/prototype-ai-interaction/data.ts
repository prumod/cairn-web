// PROTOTYPE (throwaway, issue #64): fictional data and an in-memory "database"
// shared by every AI interaction variant. Not a production data model.

export type ParticipationStatus = "nova" | "em-analise" | "em-preparacao" | "nao-concorrer";

export const statusLabel: Record<ParticipationStatus, string> = {
  nova: "Sem decisão",
  "em-analise": "Em análise",
  "em-preparacao": "Em preparação",
  "nao-concorrer": "Não concorrer",
};

export type ProposalDocument = {
  id: string;
  name: string;
  mandatory: boolean;
  // Fictional: the company already has a reusable version from earlier procedures.
  inCompanyArchive: boolean;
  keywords: string[];
};

export type Procedure = {
  id: string;
  title: string;
  buyer: string;
  place: string;
  origin: "anuncio" | "convite";
  receivedOn: string;
  deadline: string;
  announcedValue: number;
  executionDays: number;
  platform: string;
  distanceKm: number;
  bearingDeg: number;
  requiredClass: number;
  requiredLicences: string[];
  documents: ProposalDocument[];
  keywords: string[];
};

export type Company = {
  name: string;
  place: string;
  radiusKm: number;
  companyClass: number;
  licences: string[];
};

export type Participation = {
  status: ParticipationStatus;
  preparedDocumentIds: string[];
};

export type Change =
  | { kind: "set-status"; procedureId: string; status: ParticipationStatus }
  | { kind: "set-document"; procedureId: string; documentId: string; prepared: boolean }
  | { kind: "set-radius"; radiusKm: number };

export type ChangeSource = "pessoa" | "ia-confirmada";

export type LogEntry = { seq: number; source: ChangeSource; description: string };

export type Db = {
  company: Company;
  procedures: Procedure[];
  participations: Record<string, Participation>;
  log: LogEntry[];
};

export type DbAction =
  | { type: "apply"; changes: Change[]; source: ChangeSource }
  | { type: "reset" };

// Deterministic demo clock; deadlines are compared with this, never with the real date.
export const referenceDate = new Date("2026-10-15T09:00:00");

const doc = (
  id: string,
  name: string,
  mandatory: boolean,
  inCompanyArchive: boolean,
  keywords: string[],
): ProposalDocument => ({ id, name, mandatory, inCompanyArchive, keywords });

const commonDocuments = [
  doc("deucp", "DEUCP", true, true, ["deucp"]),
  doc("anexo-i", "Declaração do anexo I", true, true, ["anexo", "declaracao"]),
  doc("lpu", "Lista de preços unitários", true, false, ["lista", "precos", "lpu"]),
];

const procedures: Procedure[] = [
  {
    id: "escola",
    title: "Requalificação da Escola Básica de Marrazes",
    buyer: "Município de Leiria (fictício)",
    place: "Leiria",
    origin: "anuncio",
    receivedOn: "2026-10-14",
    deadline: "2026-10-28T17:00:00",
    announcedValue: 412_000,
    executionDays: 180,
    platform: "AcinGov",
    distanceKm: 4,
    bearingDeg: 300,
    requiredClass: 3,
    requiredLicences: ["Edifícios"],
    documents: [
      ...commonDocuments,
      doc("memoria", "Memória descritiva e justificativa", true, false, ["memoria"]),
      doc("plano", "Plano de trabalhos", false, false, ["plano"]),
    ],
    keywords: ["escola", "marrazes"],
  },
  {
    id: "rua",
    title: "Pavimentação da Rua do Moinho",
    buyer: "Município da Batalha (fictício)",
    place: "Batalha",
    origin: "anuncio",
    receivedOn: "2026-10-14",
    deadline: "2026-10-17T12:00:00",
    announcedValue: 96_000,
    executionDays: 60,
    platform: "Vortal",
    distanceKm: 18,
    bearingDeg: 200,
    requiredClass: 2,
    requiredLicences: ["Vias de comunicação"],
    documents: [...commonDocuments],
    keywords: ["rua", "moinho", "pavimentacao", "batalha"],
  },
  {
    id: "mercado",
    title: "Reabilitação do Mercado Municipal de Pombal",
    buyer: "Município de Pombal (fictício)",
    place: "Pombal",
    origin: "anuncio",
    receivedOn: "2026-10-13",
    deadline: "2026-11-10T17:00:00",
    announcedValue: 1_250_000,
    executionDays: 365,
    platform: "AcinGov",
    distanceKm: 31,
    bearingDeg: 20,
    requiredClass: 5,
    requiredLicences: ["Edifícios", "Instalações elétricas"],
    documents: [
      ...commonDocuments,
      doc("memoria", "Memória descritiva e justificativa", true, false, ["memoria"]),
    ],
    keywords: ["mercado", "pombal"],
  },
  {
    id: "muro",
    title: "Muro de suporte na EN 356",
    buyer: "Freguesia de Alcobaça (fictícia)",
    place: "Alcobaça",
    origin: "convite",
    receivedOn: "2026-10-12",
    deadline: "2026-10-22T12:00:00",
    announcedValue: 58_000,
    executionDays: 45,
    platform: "Vortal",
    distanceKm: 27,
    bearingDeg: 265,
    requiredClass: 1,
    requiredLicences: ["Vias de comunicação"],
    documents: [...commonDocuments],
    keywords: ["muro", "convite", "356", "alcobaca"],
  },
  {
    id: "saude",
    title: "Ampliação do Centro de Saúde de Condeixa",
    buyer: "ULS de Coimbra (fictícia)",
    place: "Condeixa",
    origin: "anuncio",
    receivedOn: "2026-10-13",
    deadline: "2026-11-03T17:00:00",
    announcedValue: 680_000,
    executionDays: 270,
    platform: "AcinGov",
    distanceKm: 72,
    bearingDeg: 35,
    requiredClass: 4,
    requiredLicences: ["Edifícios"],
    documents: [
      ...commonDocuments,
      doc("memoria", "Memória descritiva e justificativa", true, false, ["memoria"]),
    ],
    keywords: ["saude", "condeixa", "centro"],
  },
];

export function createInitialDb(): Db {
  return {
    company: {
      name: "Construções Exemplo, Lda. (fictícia)",
      place: "Leiria",
      radiusKm: 50,
      companyClass: 3,
      licences: ["Edifícios", "Vias de comunicação"],
    },
    procedures,
    participations: Object.fromEntries(
      procedures.map((p) => [p.id, { status: "nova", preparedDocumentIds: [] }]),
    ),
    log: [],
  };
}

export function participationOf(db: Db, procedureId: string): Participation {
  const participation = db.participations[procedureId];
  if (participation === undefined) throw new Error(`Unknown procedure: ${procedureId}`);
  return participation;
}

export function procedureById(db: Db, procedureId: string): Procedure {
  const procedure = db.procedures.find((p) => p.id === procedureId);
  if (procedure === undefined) throw new Error(`Unknown procedure: ${procedureId}`);
  return procedure;
}

export function describeChange(db: Db, change: Change): string {
  switch (change.kind) {
    case "set-radius":
      return `Raio de pesquisa: ${db.company.radiusKm} km → ${change.radiusKm} km`;
    case "set-status": {
      const before = statusLabel[participationOf(db, change.procedureId).status];
      const title = procedureById(db, change.procedureId).title;
      return `${title}: ${before} → ${statusLabel[change.status]}`;
    }
    case "set-document": {
      const procedure = procedureById(db, change.procedureId);
      const document = procedure.documents.find((d) => d.id === change.documentId);
      const state = change.prepared ? "preparado" : "por preparar";
      return `${procedure.title} — ${document?.name ?? change.documentId}: ${state}`;
    }
  }
}

export function applyChanges(db: Db, changes: Change[], source: ChangeSource | null): Db {
  let next = db;
  for (const change of changes) {
    const entry: LogEntry | null =
      source === null
        ? null
        : { seq: next.log.length + 1, source, description: describeChange(next, change) };
    next = applyOne(next, change);
    if (entry !== null) next = { ...next, log: [...next.log, entry] };
  }
  return next;
}

function applyOne(db: Db, change: Change): Db {
  switch (change.kind) {
    case "set-radius":
      return { ...db, company: { ...db.company, radiusKm: change.radiusKm } };
    case "set-status": {
      const participation = participationOf(db, change.procedureId);
      return {
        ...db,
        participations: {
          ...db.participations,
          [change.procedureId]: { ...participation, status: change.status },
        },
      };
    }
    case "set-document": {
      const participation = participationOf(db, change.procedureId);
      const others = participation.preparedDocumentIds.filter((id) => id !== change.documentId);
      return {
        ...db,
        participations: {
          ...db.participations,
          [change.procedureId]: {
            ...participation,
            preparedDocumentIds: change.prepared ? [...others, change.documentId] : others,
          },
        },
      };
    }
  }
}

export function dbReducer(db: Db, action: DbAction): Db {
  return action.type === "reset"
    ? createInitialDb()
    : applyChanges(db, action.changes, action.source);
}

export function inRadius(db: Db, procedure: Procedure): boolean {
  return procedure.distanceKm <= db.company.radiusKm;
}

export function daysUntilDeadline(procedure: Procedure): number {
  const ms = new Date(procedure.deadline).getTime() - referenceDate.getTime();
  return Math.floor(ms / 86_400_000);
}

// Demo-only threshold; the real «próximo do prazo» rule is still undefined.
export function deadlineNote(procedure: Procedure): string {
  const days = daysUntilDeadline(procedure);
  if (days < 0) return "prazo ultrapassado";
  if (days <= 3) return `próximo do prazo: ${days} dia(s)`;
  return `${days} dias`;
}

export type RequirementReview = { classOk: boolean; missingLicences: string[] };

export function reviewRequirements(company: Company, procedure: Procedure): RequirementReview {
  return {
    classOk: company.companyClass >= procedure.requiredClass,
    missingLicences: procedure.requiredLicences.filter((l) => !company.licences.includes(l)),
  };
}

export function looksCompatible(review: RequirementReview): boolean {
  return review.classOk && review.missingLicences.length === 0;
}

export function missingDocuments(db: Db, procedure: Procedure): ProposalDocument[] {
  const prepared = participationOf(db, procedure.id).preparedDocumentIds;
  return procedure.documents.filter((d) => !prepared.includes(d.id));
}

export function visibleProcedures(db: Db): Procedure[] {
  return db.procedures
    .filter((p) => inRadius(db, p))
    .toSorted((a, b) => a.deadline.localeCompare(b.deadline));
}

export const euro = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}
