// PROTOTYPE (throwaway, issue #64) — Variant L: arc map from buyer (municipality) to the
// companies that won its contracts, with a concentration table. Stands in for M03 and M12,
// which need awarded-contract data the Now model does not have. Fictional data throughout.

import { useState } from "react";
import { euro } from "./data";
import { ChatColumn, useChat } from "./chat";
import {
  type WorkType,
  awards,
  buyerNamed,
  buyers,
  competitorById,
  competitors,
  highShare,
  interpretWithMarket,
  summarizeBuyer,
  vizPrompts,
} from "./market";
import type { VariantProps } from "./shared";
import {
  CompanyMarker,
  MapBackdrop,
  MapLegend,
  labelBeside,
  legendIcons,
  mapSize,
  positionOf,
} from "./mapKit";

import { TermHint } from "./terms";

const arcWidth = (contracts: number) => 1.5 + contracts * 0.9;

function arcPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Bend the curve sideways in proportion to its length, so arcs do not overlap their chord.
  const cx = mx - dy * 0.25;
  const cy = my + dx * 0.25;
  return `M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`;
}

export function VariantVizArcs({ db, apply }: VariantProps) {
  const [buyer, setBuyer] = useState<string | null>(null);
  const [workType, setWorkType] = useState<WorkType | "todos">("todos");
  const chat = useChat(db, apply, null, interpretWithMarket);
  const focusedPlace = chat.focusIds.find((id) => id.startsWith("place:"))?.slice(6);
  const focusedCompany = chat.focusIds.find((id) => id.startsWith("company:"))?.slice(8);
  const activeBuyer = buyer ?? focusedPlace ?? null;

  // Arcs: buyer → winning company, one per (buyer, company) pair.
  const pairs = new Map<string, { buyer: string; competitorId: string; contracts: number }>();
  for (const a of awards) {
    if (workType !== "todos" && a.workType !== workType) continue;
    const key = `${a.buyer}|${a.competitorId}`;
    const current = pairs.get(key);
    pairs.set(key, {
      buyer: a.buyer,
      competitorId: a.competitorId,
      contracts: (current?.contracts ?? 0) + a.contracts,
    });
  }
  const visible = [...pairs.values()].filter(
    (p) => activeBuyer === null || p.buyer === activeBuyer,
  );

  const summary = activeBuyer === null ? null : summarizeBuyer(activeBuyer, workType);
  const top = summary?.byCompetitor[0];

  return (
    <div className="viz-layout">
      <section className="col viz-main" aria-label="Mapa de ligações">
        <h2>
          Quem ganha onde
          <TermHint area="awards" />
        </h2>
        <p className="viz-note">
          <strong>Ideia a validar (M03 / M12).</strong> Mostra contratos já adjudicados, que o
          modelo atual não tem. Dados fictícios.
        </p>
        <p className="viz-controls">
          <label>
            Município{" "}
            <select value={buyer ?? ""} onChange={(event) => setBuyer(event.target.value || null)}>
              <option value="">Todos</option>
              {buyers.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
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
          <svg
            viewBox={`0 0 ${mapSize} ${mapSize}`}
            role="group"
            aria-label="Arcos município → empresa vencedora"
          >
            <defs>
              <marker
                id="arc-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerUnits="userSpaceOnUse"
                markerWidth="9"
                markerHeight="9"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 Z" className="arc-head" />
              </marker>
            </defs>
            <MapBackdrop />
            <CompanyMarker place="Leiria" label={false} />
            {visible.map((p) => {
              const from = positionOf(buyerNamed(p.buyer));
              const to = positionOf(competitorById(p.competitorId).hq);
              const dim = focusedCompany !== undefined && p.competitorId !== focusedCompany;
              return (
                <path
                  key={`${p.buyer}|${p.competitorId}`}
                  d={arcPath(from, to)}
                  className="arc"
                  data-dim={dim}
                  strokeWidth={arcWidth(p.contracts)}
                  markerEnd="url(#arc-arrow)"
                >
                  <title>
                    {p.buyer} → {competitorById(p.competitorId).name}: {p.contracts} contratos
                  </title>
                </path>
              );
            })}
            {buyers.map((b) => {
              const { x, y } = positionOf(b);
              return (
                <g
                  key={b.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`Município de ${b.name}`}
                  aria-pressed={activeBuyer === b.name}
                  onClick={() => setBuyer(activeBuyer === b.name ? null : b.name)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ")
                      setBuyer(activeBuyer === b.name ? null : b.name);
                  }}
                >
                  <circle cx={x} cy={y} r={activeBuyer === b.name ? 9 : 6} className="buyer-dot" />
                  <text
                    x={x + 10}
                    y={y + 4}
                    className={activeBuyer === b.name ? "map-label selected" : "map-label"}
                  >
                    {b.name}
                  </text>
                </g>
              );
            })}
            {competitors.map((c) => {
              const { x, y } = positionOf(c.hq);
              const focus = focusedCompany === c.id;
              return (
                <g key={c.id}>
                  <path
                    d={`M${x - 7},${y + 6} L${x - 7},${y - 3} L${x},${y - 9} L${x + 7},${y - 3} L${x + 7},${y + 6} Z`}
                    className="company-dot"
                    strokeWidth={focus ? 4 : 1.5}
                  />
                  <text {...labelBeside(x, y)} className="map-label company">
                    {c.name.replace(/,? (Lda|S\.A)\.$/, "")}
                    {focus ? " ★" : ""}
                    <title>{c.name}</title>
                  </text>
                </g>
              );
            })}
          </svg>
          <MapLegend
            items={[
              {
                icon: <circle cx="0" cy="-8" r="6" className="buyer-dot" />,
                label: "Município que lançou os concursos",
              },
              {
                icon: <path d="M-7,2 L-7,-7 L0,-13 L7,-7 L7,2 Z" className="company-dot" />,
                label: "Sede da empresa que ganhou",
              },
              ...[1, 4].map((contracts) => ({
                icon: (
                  <line
                    x1="-12"
                    y1="-8"
                    x2="12"
                    y2="-8"
                    className="arc"
                    strokeWidth={arcWidth(contracts)}
                  />
                ),
                label: `Seta município → empresa: ${contracts} contrato${contracts === 1 ? "" : "s"}`,
              })),
              { icon: legendIcons.company, label: "A sua empresa" },
            ]}
          />
        </div>

        {summary !== null && activeBuyer !== null && (
          <section className="viz-detail">
            <h3>
              Quem ganha em {activeBuyer}{" "}
              <small>
                {summary.contracts} contratos · {euro.format(summary.totalValue)}
              </small>
            </h3>
            <table className="viz-table compact">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Contratos</th>
                  <th>Quota</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {summary.byCompetitor.map((c) => (
                  <tr key={c.competitorId} data-focus={focusedCompany === c.competitorId}>
                    <td>{competitorById(c.competitorId).name}</td>
                    <td>{c.contracts}</td>
                    <td>
                      <div className="bar-cell">
                        <span className="bar" style={{ width: `${c.share * 100}%` }} />
                        <span>{Math.round(c.share * 100)}%</span>
                      </div>
                    </td>
                    <td>{euro.format(c.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {top !== undefined && top.share >= highShare && (
              <p className="viz-note">
                Uma empresa concentra {Math.round(top.share * 100)}% dos contratos. Estes dados não
                explicam porquê; pode merecer análise, mas não indica irregularidade.
              </p>
            )}
          </section>
        )}
      </section>

      <ChatColumn
        db={db}
        chat={chat}
        prompts={vizPrompts}
        selected={null}
        onClearContext={() => undefined}
        onSelect={() => undefined}
      />
    </div>
  );
}
