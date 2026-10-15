// PROTOTYPE (throwaway, issue #64) — Variant I: sortable table with inline bars as the main
// view, chatbot on the right. Answers "what needs my attention first?" from the Now data.

import { useState } from "react";
import {
  type Procedure,
  daysUntilDeadline,
  deadlineNote,
  euro,
  formatDateTime,
  inRadius,
  procedureById,
} from "./data";
import { ChatColumn, useChat } from "./chat";
import { interpretWithMarket, vizPrompts } from "./market";
import { TermHint } from "./terms";
import { ProcedureFacts, StatusCell, type VariantProps } from "./shared";

type SortKey = "title" | "place" | "announcedValue" | "days" | "distanceKm";

const columns: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "title", label: "Obra", numeric: false },
  { key: "place", label: "Local", numeric: false },
  { key: "announcedValue", label: "Valor anunciado", numeric: true },
  { key: "days", label: "Dias até ao prazo", numeric: true },
  { key: "distanceKm", label: "Distância", numeric: true },
];

const sortValue = (p: Procedure, key: SortKey): string | number =>
  key === "days" ? daysUntilDeadline(p) : p[key];

export function VariantVizTable({ db, apply }: VariantProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "days", dir: 1 });
  const [onlyInRadius, setOnlyInRadius] = useState(false);
  const chat = useChat(db, apply, selectedId, interpretWithMarket);
  const view = chat.preview ?? db;

  const rows = db.procedures
    .filter((p) => !onlyInRadius || inRadius(view, p))
    .toSorted((a, b) => {
      const x = sortValue(a, sort.key);
      const y = sortValue(b, sort.key);
      const order =
        typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return order * sort.dir;
    });

  const maxValue = Math.max(...db.procedures.map((p) => p.announcedValue));
  const selected = selectedId === null ? null : procedureById(db, selectedId);

  const toggleSort = (key: SortKey) =>
    setSort((current) => ({ key, dir: current.key === key && current.dir === 1 ? -1 : 1 }));

  return (
    <div className="viz-layout">
      <section className="col viz-main" aria-label="Tabela de concursos">
        <h2>
          Concursos
          <TermHint area="listing" />
        </h2>
        <p className="viz-controls">
          <label>
            <input
              type="checkbox"
              checked={onlyInRadius}
              onChange={(event) => setOnlyInRadius(event.target.checked)}
            />{" "}
            Só dentro do raio ({view.company.radiusKm} km)
          </label>
          <TermHint area="map" />
          <small>Clique no título de uma coluna (⇅) para ordenar.</small>
        </p>
        <table className="viz-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={c.numeric ? "num" : undefined}
                  aria-sort={
                    sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"
                  }
                >
                  <button type="button" onClick={() => toggleSort(c.key)}>
                    {c.label}
                    <span aria-hidden="true" className="sort-icon">
                      {sort.key === c.key ? (sort.dir === 1 ? "▲" : "▼") : "⇅"}
                    </span>
                  </button>
                  <TermHint
                    area={
                      c.key === "announcedValue"
                        ? "value"
                        : c.key === "days"
                          ? "deadline"
                          : c.key === "distanceKm"
                            ? "map"
                            : "listing"
                    }
                  />
                </th>
              ))}
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const days = daysUntilDeadline(p);
              const outside = !inRadius(view, p);
              return (
                <tr
                  key={p.id}
                  data-selected={selectedId === p.id}
                  data-focus={chat.focusIds.includes(p.id)}
                  data-outside={outside}
                  onClick={() => setSelectedId(p.id)}
                >
                  <td>
                    <strong>{p.title}</strong>
                    <small>{p.buyer}</small>
                  </td>
                  <td>
                    {p.place}
                    {outside && <small>fora do raio</small>}
                  </td>
                  <td className="num">
                    <div className="bar-cell">
                      <span
                        className="bar"
                        style={{ width: `${(p.announcedValue / maxValue) * 100}%` }}
                      />
                      <span>{euro.format(p.announcedValue)}</span>
                    </div>
                  </td>
                  <td className="num">
                    <div className="bar-cell">
                      <span
                        className="bar"
                        data-urgent={days <= 3}
                        style={{ width: `${Math.max(4, Math.min(100, (days / 30) * 100))}%` }}
                      />
                      <span>{deadlineNote(p)}</span>
                    </div>
                  </td>
                  <td className="num">{p.distanceKm} km</td>
                  <td>
                    <StatusCell
                      db={db}
                      {...(chat.preview === undefined ? {} : { preview: chat.preview })}
                      procedureId={p.id}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {selected !== null && (
          <section className="viz-detail">
            <h3>{selected.title}</h3>
            <p>
              <small>Prazo: {formatDateTime(selected.deadline)}</small>
            </p>
            <ProcedureFacts procedure={selected} />
          </section>
        )}
      </section>

      <ChatColumn
        db={db}
        chat={chat}
        prompts={vizPrompts}
        selected={selected}
        onClearContext={() => setSelectedId(null)}
        onSelect={setSelectedId}
      />
    </div>
  );
}
