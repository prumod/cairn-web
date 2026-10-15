// PROTOTYPE (throwaway, issue #64) — Variant J: proportional-symbol map. Dots are open
// tenders (area ∝ announced value, colour = our decision); rings are contracts already
// won by other companies (area ∝ number of contracts). Chatbot on the right.

import { useState } from "react";
import { euro, inRadius, procedureById } from "./data";
import { ChatColumn, useChat } from "./chat";
import {
  type WorkType,
  awards,
  buyers,
  competitorById,
  interpretWithMarket,
  summarizeBuyer,
  vizPrompts,
  workTypeOf,
} from "./market";
import { StatusPill, type VariantProps } from "./shared";
import {
  CompanyMarker,
  MapBackdrop,
  MapLegend,
  RadiusRing,
  legendIcons,
  mapSize,
  positionOf,
} from "./mapKit";

import { TermHint } from "./terms";

type Layer = "abertos" | "ganhos" | "ambos";

const compactEuro = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 2,
});
// Leiria, Marinha Grande, Alcobaça and Batalha sit within ~50 px of each other, so their
// labels get fixed offsets (relative to the symbol); a leader line links far-off ones.
const crowdedRingLabels: Record<string, { dx: number; dy: number }> = {
  "Marinha Grande": { dx: -12, dy: 62 },
  // Leiria's ring is half covered by Marinha Grande's on the west: put its count lower right.
  Leiria: { dx: 18, dy: 26 },
  // Batalha's count goes east so Marinha Grande's leader line does not cross it.
  Batalha: { dx: 24, dy: 6 },
};
const crowdedTenderLabels: Record<
  string,
  { dx: number; dy: number; anchor: "start" | "middle" | "end" }
> = {
  Leiria: { dx: 18, dy: -26, anchor: "start" },
  Alcobaça: { dx: 0, dy: -30, anchor: "middle" },
  Batalha: { dx: 12, dy: 20, anchor: "start" },
};
const ringLabel = (name: string) => crowdedRingLabels[name];
function ringLabelProps(name: string, x: number, y: number, r: number) {
  const custom = crowdedRingLabels[name];
  if (custom !== undefined)
    return {
      x: x + custom.dx,
      y: y + custom.dy,
      textAnchor: custom.dx > 0 ? ("start" as const) : ("end" as const),
    };
  // Count sits just left of the ring on the western side, right of it on the eastern side.
  return x < mapSize / 2
    ? { x: x - r - 4, y: y + 4, textAnchor: "end" as const }
    : { x: x + r * 0.75, y: y - r * 0.75, textAnchor: "start" as const };
}
function tenderLabelProps(place: string, x: number, y: number) {
  const custom = crowdedTenderLabels[place];
  return custom === undefined
    ? { x: x + 12, y: y + 18 }
    : { x: x + custom.dx, y: y + custom.dy, textAnchor: custom.anchor };
}
const dotRadius = (value: number) => 4 + Math.sqrt(value / 1_000_000) * 9;
const ringRadius = (contracts: number) => 5 + Math.sqrt(contracts) * 4.5;
const statusLegend = [
  { status: "nova", label: "sem decisão" },
  { status: "em-analise", label: "em análise" },
  { status: "em-preparacao", label: "em preparação" },
] as const;

export function VariantVizSymbols({ db, apply }: VariantProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [layer, setLayer] = useState<Layer>("ambos");
  const [workType, setWorkType] = useState<WorkType | "todos">("todos");
  const chat = useChat(db, apply, selectedId, interpretWithMarket);
  const view = chat.preview ?? db;
  const highlighted = chat.focusIds
    .filter((id) => id.startsWith("place:"))
    .map((id) => id.slice(6));
  const highlightedCompanies = chat.focusIds
    .filter((id) => id.startsWith("company:"))
    .map((id) => id.slice(8));

  const procedures = db.procedures.filter(
    (p) => workType === "todos" || workTypeOf(p) === workType,
  );
  const tenderPlaces = new Set(layer === "ganhos" ? [] : procedures.map((p) => p.place));
  const placeSummary = place === null ? null : summarizeBuyer(place, workType);

  return (
    <div className="viz-layout">
      <section className="col viz-main" aria-label="Mapa de símbolos proporcionais">
        <h2>
          Mapa
          <TermHint area="map" />
          <TermHint area="listing" />
        </h2>
        <p className="viz-controls">
          <label>
            Camada{" "}
            <select value={layer} onChange={(event) => setLayer(event.target.value as Layer)}>
              <option value="ambos">Concursos abertos + contratos ganhos</option>
              <option value="abertos">Só concursos abertos</option>
              <option value="ganhos">Só contratos ganhos por concorrentes</option>
            </select>
          </label>
          <label>
            Tipo de obra{" "}
            <select
              value={workType}
              onChange={(event) => setWorkType(event.target.value as WorkType | "todos")}
            >
              <option value="todos">Todos</option>
              <option value="Edifícios">Edifícios</option>
              <option value="Vias de comunicação">Vias de comunicação</option>
            </select>
          </label>
        </p>
        <div className="map-wrap viz-map">
          <svg viewBox={`0 0 ${mapSize} ${mapSize}`} role="group" aria-label="Mapa ilustrativo">
            <MapBackdrop labelTowns={["Coimbra"]} />
            <RadiusRing km={view.company.radiusKm} />
            <CompanyMarker place={view.company.place} label={false} />
            {layer !== "abertos" &&
              buyers.map((b) => {
                const summary = summarizeBuyer(b.name, workType);
                if (summary.contracts === 0) return null;
                const { x, y } = positionOf(b);
                const focus = highlighted.includes(b.name) || place === b.name;
                return (
                  <g
                    key={`award-${b.name}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${b.name}: ${summary.contracts} contratos ganhos por concorrentes`}
                    aria-pressed={place === b.name}
                    onClick={() => setPlace(b.name)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setPlace(b.name);
                    }}
                  >
                    <circle
                      className="award-ring"
                      cx={x}
                      cy={y}
                      r={ringRadius(summary.contracts)}
                      strokeWidth={focus ? 4 : 2}
                    />
                    {(ringLabel(b.name)?.dy ?? 0) > 40 && (
                      <line
                        className="map-leader"
                        x1={x}
                        y1={y + ringRadius(summary.contracts)}
                        x2={x + (ringLabel(b.name)?.dx ?? 0)}
                        y2={y + (ringLabel(b.name)?.dy ?? 0) - 10}
                      />
                    )}
                    <text
                      {...ringLabelProps(b.name, x, y, ringRadius(summary.contracts))}
                      className="map-label ring-count"
                    >
                      {summary.contracts}
                      {tenderPlaces.has(b.name) ? "" : ` · ${b.name}`}
                    </text>
                  </g>
                );
              })}
            {layer !== "ganhos" &&
              procedures.map((p) => {
                const { x, y } = positionOf(p);
                const outside = !inRadius(view, p);
                const focus = chat.focusIds.includes(p.id);
                return (
                  <g
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${p.title}, ${euro.format(p.announcedValue)}`}
                    aria-pressed={selectedId === p.id}
                    onClick={() => setSelectedId(p.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setSelectedId(p.id);
                    }}
                  >
                    <circle
                      className="tender-dot"
                      data-status={view.participations[p.id]?.status}
                      data-outside={outside}
                      cx={x}
                      cy={y}
                      r={dotRadius(p.announcedValue)}
                      strokeWidth={focus || selectedId === p.id ? 4 : 1.5}
                    />
                    <text
                      {...tenderLabelProps(p.place, x, y)}
                      className={selectedId === p.id ? "map-label selected" : "map-label"}
                    >
                      {p.place} · {compactEuro.format(p.announcedValue)}
                      {focus ? " ★" : ""}
                    </text>
                  </g>
                );
              })}
          </svg>
          <MapLegend
            items={[
              { icon: legendIcons.company, label: "A sua empresa" },
              ...statusLegend.map((s) => ({
                icon: <circle cx="0" cy="-8" r="7" className="tender-dot" data-status={s.status} />,
                label: `Concurso aberto: ${s.label}`,
              })),
              ...[100_000, 1_000_000].map((value) => ({
                icon: <circle cx="0" cy="-8" r={dotRadius(value) * 0.75} className="tender-dot" />,
                label: `Tamanho = valor anunciado (${compactEuro.format(value)})`,
              })),
              {
                icon: <circle cx="0" cy="-8" r="9" className="award-ring" strokeWidth="2" />,
                label: "Contratos ganhos por outras empresas; o número é a contagem (fictício)",
              },
              { icon: legendIcons.radius, label: "Raio de pesquisa" },
            ]}
            after={<TermHint area="awards" />}
          />
        </div>

        {selectedId !== null && (
          <section className="viz-detail">
            <h3>{procedureById(db, selectedId).title}</h3>
            <p>
              {euro.format(procedureById(db, selectedId).announcedValue)}
              <TermHint area="value" /> ·{" "}
              <StatusPill status={view.participations[selectedId]?.status ?? "nova"} />
            </p>
          </section>
        )}

        {placeSummary !== null && (
          <section className="viz-detail">
            <h3>
              Contratos ganhos em {place} <small>(fictício, 2022-2026)</small>
            </h3>
            <table className="viz-table compact">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Contratos</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {placeSummary.byCompetitor.map((c) => (
                  <tr
                    key={c.competitorId}
                    data-focus={highlightedCompanies.includes(c.competitorId)}
                  >
                    <td>{competitorById(c.competitorId).name}</td>
                    <td>
                      {c.contracts} ({Math.round(c.share * 100)}%)
                    </td>
                    <td>{euro.format(c.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              <small>
                {awards.filter((a) => a.buyer === place).length} registos agregados por empresa e
                tipo de obra.
              </small>
            </p>
          </section>
        )}
      </section>

      <ChatColumn
        db={db}
        chat={chat}
        prompts={vizPrompts}
        selected={selectedId === null ? null : procedureById(db, selectedId)}
        onClearContext={() => setSelectedId(null)}
        onSelect={setSelectedId}
      />
    </div>
  );
}
