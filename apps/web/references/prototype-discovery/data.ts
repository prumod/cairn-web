// PROTOTYPE: fictional data for discovering works. Not a production data model.
// The reference date is fixed so that "today" is deterministic and has no notices.

export type WorkType = "Edifícios" | "Vias de comunicação" | "Espaços públicos";
export const workTypes: WorkType[] = ["Edifícios", "Vias de comunicação", "Espaços públicos"];

export type Contest = {
  id: string;
  title: string;
  buyer: string;
  place: string;
  distanceKm: number;
  bearingDeg: number;
  publishedOn: string;
  // The Diário da República notice often omits the submission deadline (it sits on the platform).
  deadline: string | null;
  announcedValue: number;
  executionDays: number;
  platform: string;
  workType: WorkType;
  requiredClass: number;
  requiredLicences: string[];
  notice: string[];
};

export type Company = {
  name: string;
  place: string;
  radiusKm: number;
  companyClass: number;
  licences: string[];
  priorityTypes: WorkType[];
};

export const referenceDate = new Date("2026-10-15T09:00:00");
export const today = "2026-10-15";

export const company: Company = {
  name: "Construções Exemplo, Lda. (fictícia)",
  place: "Leiria",
  radiusKm: 50,
  companyClass: 3,
  licences: ["Edifícios", "Vias de comunicação"],
  priorityTypes: ["Edifícios"],
};

const notice = (title: string, buyer: string, extra: string): string[] => [
  `ANÚNCIO DE PROCEDIMENTO (exemplo fictício) — ${buyer}`,
  `Objeto: ${title}.`,
  extra,
  "Critério de adjudicação: preço mais baixo. Consulta das peças do procedimento na plataforma eletrónica indicada.",
];

export const contests: Contest[] = [
  {
    id: "escola",
    title: "Requalificação da Escola Básica de Marrazes",
    buyer: "Município de Leiria (fictício)",
    place: "Leiria",
    distanceKm: 4,
    bearingDeg: 300,
    publishedOn: "2026-10-14",
    deadline: "2026-10-28T17:00:00",
    announcedValue: 412_000,
    executionDays: 180,
    platform: "AcinGov",
    workType: "Edifícios",
    requiredClass: 3,
    requiredLicences: ["Edifícios"],
    notice: notice(
      "Requalificação da Escola Básica de Marrazes",
      "Município de Leiria",
      "Substituição de coberturas, caixilharia e instalações sanitárias.",
    ),
  },
  {
    id: "pavilhao",
    title: "Cobertura do pavilhão desportivo de Leiria",
    buyer: "Município de Leiria (fictício)",
    place: "Leiria",
    distanceKm: 4,
    bearingDeg: 300,
    publishedOn: "2026-10-14",
    deadline: null,
    announcedValue: 540_000,
    executionDays: 120,
    platform: "AcinGov",
    workType: "Edifícios",
    requiredClass: 3,
    requiredLicences: ["Edifícios"],
    notice: notice(
      "Cobertura do pavilhão desportivo de Leiria",
      "Município de Leiria",
      "Nova estrutura metálica e impermeabilização da cobertura.",
    ),
  },
  {
    id: "rua",
    title: "Pavimentação da Rua do Moinho",
    buyer: "Município da Batalha (fictício)",
    place: "Batalha",
    distanceKm: 18,
    bearingDeg: 200,
    publishedOn: "2026-10-14",
    deadline: "2026-10-17T12:00:00",
    announcedValue: 96_000,
    executionDays: 60,
    platform: "Vortal",
    workType: "Vias de comunicação",
    requiredClass: 2,
    requiredLicences: ["Vias de comunicação"],
    notice: notice(
      "Pavimentação da Rua do Moinho",
      "Município da Batalha",
      "Fresagem e repavimentação em betão betuminoso numa extensão de 1,2 km.",
    ),
  },
  {
    id: "largo",
    title: "Requalificação do Largo da Igreja",
    buyer: "Município da Marinha Grande (fictício)",
    place: "Marinha Grande",
    distanceKm: 15,
    bearingDeg: 255,
    publishedOn: "2026-10-13",
    deadline: null,
    announcedValue: 210_000,
    executionDays: 90,
    platform: "Vortal",
    workType: "Espaços públicos",
    requiredClass: 2,
    requiredLicences: ["Edifícios"],
    notice: notice(
      "Requalificação do Largo da Igreja",
      "Município da Marinha Grande",
      "Nova pavimentação, mobiliário urbano e iluminação pública.",
    ),
  },
  {
    id: "muro",
    title: "Muro de suporte na EN 356",
    buyer: "Freguesia de Alcobaça (fictícia)",
    place: "Alcobaça",
    distanceKm: 27,
    bearingDeg: 265,
    publishedOn: "2026-10-12",
    deadline: "2026-10-22T12:00:00",
    announcedValue: 58_000,
    executionDays: 45,
    platform: "Vortal",
    workType: "Vias de comunicação",
    requiredClass: 1,
    requiredLicences: ["Vias de comunicação"],
    notice: notice(
      "Muro de suporte na EN 356",
      "Freguesia de Alcobaça",
      "Muro em betão armado com 80 m de extensão e drenagem.",
    ),
  },
  {
    id: "mercado",
    title: "Reabilitação do Mercado Municipal de Pombal",
    buyer: "Município de Pombal (fictício)",
    place: "Pombal",
    distanceKm: 31,
    bearingDeg: 20,
    publishedOn: "2026-10-13",
    deadline: "2026-11-10T17:00:00",
    announcedValue: 1_250_000,
    executionDays: 365,
    platform: "AcinGov",
    workType: "Edifícios",
    requiredClass: 5,
    requiredLicences: ["Edifícios", "Instalações elétricas"],
    notice: notice(
      "Reabilitação do Mercado Municipal de Pombal",
      "Município de Pombal",
      "Reabilitação estrutural, instalações elétricas e acessibilidades.",
    ),
  },
  {
    id: "cemiterio",
    title: "Ampliação do cemitério de Ourém",
    buyer: "Município de Ourém (fictício)",
    place: "Ourém",
    distanceKm: 35,
    bearingDeg: 110,
    publishedOn: "2026-10-12",
    deadline: null,
    announcedValue: 150_000,
    executionDays: 75,
    platform: "Vortal",
    workType: "Espaços públicos",
    requiredClass: 2,
    requiredLicences: ["Edifícios"],
    notice: notice(
      "Ampliação do cemitério de Ourém",
      "Município de Ourém",
      "Novos talhões, muros de vedação e arruamentos interiores.",
    ),
  },
  {
    id: "saude",
    title: "Ampliação do Centro de Saúde de Condeixa",
    buyer: "ULS de Coimbra (fictícia)",
    place: "Condeixa",
    distanceKm: 72,
    bearingDeg: 35,
    publishedOn: "2026-10-13",
    deadline: "2026-11-03T17:00:00",
    announcedValue: 680_000,
    executionDays: 270,
    platform: "AcinGov",
    workType: "Edifícios",
    requiredClass: 4,
    requiredLicences: ["Edifícios"],
    notice: notice(
      "Ampliação do Centro de Saúde de Condeixa",
      "ULS de Coimbra",
      "Novo piso com consultórios e sala de pequenas cirurgias.",
    ),
  },
];

export const contestById = (id: string): Contest => {
  const contest = contests.find((c) => c.id === id);
  if (contest === undefined) throw new Error(`Unknown contest: ${id}`);
  return contest;
};

export const buyers = [...new Set(contests.map((c) => c.buyer))];

export const places = [...new Set(contests.map((c) => c.place))];

export const publicationDates = [...new Set([today, ...contests.map((c) => c.publishedOn)])]
  .toSorted()
  .toReversed();

export const euro = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "short" });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });

export const daysLeft = (contest: Contest): number | null =>
  contest.deadline === null
    ? null
    : Math.floor((new Date(contest.deadline).getTime() - referenceDate.getTime()) / 86_400_000);

export function deadlineText(contest: Contest): string {
  const days = daysLeft(contest);
  if (contest.deadline === null || days === null) return "na plataforma";
  return `${formatDateTime(contest.deadline)} (${days} dias)`;
}
