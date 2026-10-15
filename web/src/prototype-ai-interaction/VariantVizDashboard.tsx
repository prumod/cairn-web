// PROTOTYPE (throwaway, issue #64) — Variant K: small dashboard of bars and a line chart,
// chatbot on the right. Bars come from the Now data; the price line stands in for M07.

import { useEffect, useState } from "react";
import {
  type ParticipationStatus,
  daysUntilDeadline,
  euro,
  inRadius,
  participationOf,
  procedureById,
  statusLabel,
} from "./data";
import { ChatColumn, useChat } from "./chat";
import { interpretWithMarket, materials, priceHistory, vizPrompts } from "./market";
import type { VariantProps } from "./shared";
import { TermHint } from "./terms";

const statuses: ParticipationStatus[] = ["nova", "em-analise", "em-preparacao", "nao-concorrer"];

// "2025-11" → "nov 2025": month names read more naturally than numeric pairs.
const monthNames = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
function monthLabel(month: string) {
  const [year, number] = month.split("-");
  return `${monthNames[Number(number) - 1] ?? number} ${year}`;
}

// Spreadsheet-style line chart: round-number gridlines, axis titles, every point readable.
function LineChart({
  materialId,
  validityDays,
  unit,
}: {
  materialId: string;
  validityDays: number;
  unit: string;
}) {
  const series = priceHistory[materialId] ?? [];
  const width = 560;
  const height = 230;
  const pad = { left: 56, right: 40, top: 28, bottom: 34 };
  const prices = series.map((p) => p.price);
  const step =
    [10, 20, 25, 50, 100, 200].find((s) => (Math.max(...prices) - Math.min(...prices)) / s <= 5) ??
    500;
  const lo = Math.floor(Math.min(...prices) / step) * step;
  const hi = Math.ceil(Math.max(...prices) / step) * step;
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
  const x = (i: number) =>
    pad.left + (i / Math.max(1, series.length - 1)) * (width - pad.left - pad.right);
  const y = (price: number) =>
    pad.top + (1 - (price - lo) / Math.max(1, hi - lo)) * (height - pad.top - pad.bottom);
  const path = series.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.price)}`).join(" ");
  const last = series.at(-1);
  return (
    <figure className="line-figure">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Histórico de preço, ${unit}`}
        className="line-chart"
      >
        <text x={pad.left - 8} y={pad.top - 12} textAnchor="end" className="axis-title">
          {unit}
        </text>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} className="grid" />
            <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end">
              {tick}
            </text>
          </g>
        ))}
        <line x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} className="axis" />
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={height - pad.bottom}
          y2={height - pad.bottom}
          className="axis"
        />
        <path d={path} fill="none" className="series" />
        {series.map((p, i) => (
          <g key={p.month}>
            <circle cx={x(i)} cy={y(p.price)} r={i === series.length - 1 ? 6 : 4} className="dot">
              <title>
                {monthLabel(p.month)}: {p.price} {unit}
              </title>
            </circle>
            {i % 2 === 0 && (
              <text x={x(i)} y={height - pad.bottom + 20} textAnchor="middle">
                {monthLabel(p.month)}
              </text>
            )}
          </g>
        ))}
        {last !== undefined && (
          <text
            x={x(series.length - 1)}
            y={y(last.price) + 22}
            textAnchor="middle"
            className="last-value"
          >
            {last.price}
          </text>
        )}
      </svg>
      {last !== undefined && (
        <figcaption>
          Último valor:{" "}
          <strong>
            {last.price} {unit}
          </strong>{" "}
          ({monthLabel(last.month)}). Uma cotação deste material costuma valer {validityDays}{" "}
          dia(s).
        </figcaption>
      )}
    </figure>
  );
}

export function VariantVizDashboard({ db, apply }: VariantProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [materialId, setMaterialId] = useState("aco");
  const chat = useChat(db, apply, selectedId, interpretWithMarket);
  const view = chat.preview ?? db;
  const focusedMaterial = chat.focusIds.find((id) => id.startsWith("material:"));
  useEffect(() => {
    if (focusedMaterial !== undefined) setMaterialId(focusedMaterial.slice(9));
  }, [focusedMaterial]);
  const material = materials.find((m) => m.id === materialId) ?? materials[0];
  const inside = db.procedures.filter((p) => inRadius(view, p));
  const byStatus = statuses.map((s) => ({
    status: s,
    count: inside.filter((p) => participationOf(view, p.id).status === s).length,
    value: inside
      .filter((p) => participationOf(view, p.id).status === s)
      .reduce((sum, p) => sum + p.announcedValue, 0),
  }));
  const maxStatusValue = Math.max(1, ...byStatus.map((s) => s.value));
  const nextDeadline = inside.toSorted((a, b) => a.deadline.localeCompare(b.deadline))[0];

  return (
    <div className="viz-layout">
      <section className="col viz-main" aria-label="Painel">
        <h2>Painel</h2>
        <dl className="kpis">
          <div>
            <dt>
              Obras no raio
              <TermHint area="listing" />
            </dt>
            <dd>{inside.length}</dd>
          </div>
          <div>
            <dt>
              Valor anunciado
              <TermHint area="value" />
            </dt>
            <dd>{euro.format(inside.reduce((s, p) => s + p.announcedValue, 0))}</dd>
          </div>
          <div>
            <dt>Sem decisão</dt>
            <dd>{byStatus[0]?.count ?? 0}</dd>
          </div>
          <div>
            <dt>Próximo prazo</dt>
            <dd>{nextDeadline === undefined ? "—" : `${daysUntilDeadline(nextDeadline)} dias`}</dd>
          </div>
        </dl>

        <h3>
          Valor anunciado por estado
          <TermHint area="states" />
        </h3>
        <ul className="hbars">
          {byStatus.map((s) => (
            <li key={s.status}>
              <span>{statusLabel[s.status]}</span>
              <span className="track">
                <span className="fill" style={{ width: `${(s.value / maxStatusValue) * 100}%` }} />
              </span>
              <span>
                {euro.format(s.value)} ({s.count} {s.count === 1 ? "obra" : "obras"})
              </span>
            </li>
          ))}
        </ul>

        <h3>
          Dias até ao prazo, por obra
          <TermHint area="deadline" />
        </h3>
        <ul className="hbars">
          {inside
            .toSorted((a, b) => daysUntilDeadline(a) - daysUntilDeadline(b))
            .map((p) => {
              const days = daysUntilDeadline(p);
              return (
                <li key={p.id} data-focus={chat.focusIds.includes(p.id)}>
                  <button type="button" onClick={() => setSelectedId(p.id)}>
                    {p.place}
                  </button>
                  <span className="track">
                    <span
                      className="fill"
                      data-urgent={days <= 3}
                      style={{ width: `${Math.max(3, Math.min(100, (days / 30) * 100))}%` }}
                    />
                  </span>
                  <span>{days} dias</span>
                </li>
              );
            })}
          <li className="hbars-axis" aria-hidden="true">
            <span />
            <span className="ticks">
              <span>0</span>
              <span>10</span>
              <span>20</span>
              <span>30 dias</span>
            </span>
            <span />
          </li>
        </ul>

        <h3>
          Histórico de preço <small>(fictício; ilustra M07)</small>
        </h3>
        <p className="viz-controls">
          {materials.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={material?.id === m.id}
              onClick={() => setMaterialId(m.id)}
            >
              {m.name}
            </button>
          ))}
        </p>
        {material !== undefined && (
          <LineChart
            materialId={material.id}
            validityDays={material.validityDays}
            unit={material.unit}
          />
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
