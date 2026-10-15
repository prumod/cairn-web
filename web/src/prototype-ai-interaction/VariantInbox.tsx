// PROTOTYPE (throwaway, issue #64) — Variant E: the person does not prompt. The AI watches
// the data and places explained suggestions in an inbox; each can be accepted or dismissed.

import { useState } from "react";
import { describeChange, procedureById, visibleProcedures } from "./data";
import { Checklist, ProcedureFacts, StatusCell, type VariantProps } from "./shared";
import { type Suggestion, suggestionsFor } from "./simulatedAi";

type Handled = { suggestion: Suggestion; outcome: "aceite" | "dispensada" };

export function VariantInbox({ db, apply }: VariantProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [handled, setHandled] = useState<Handled[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId === null ? null : procedureById(db, selectedId);

  const inbox = suggestionsFor(db).filter((s) => !dismissedIds.includes(s.id));

  const accept = (suggestion: Suggestion) => {
    apply(suggestion.changes, "ia-confirmada");
    // Informational items have no changes, so they would otherwise stay in the inbox.
    if (suggestion.changes.length === 0) setDismissedIds((ids) => [...ids, suggestion.id]);
    setHandled((items) => [{ suggestion, outcome: "aceite" }, ...items]);
  };
  const dismiss = (suggestion: Suggestion) => {
    setDismissedIds((ids) => [...ids, suggestion.id]);
    setHandled((items) => [{ suggestion, outcome: "dispensada" }, ...items]);
  };

  return (
    <div className="split split-e">
      <section className="col" aria-label="Sugestões da IA">
        <h1>E — Sugestões proativas</h1>
        <h2>Caixa de sugestões ({inbox.length})</h2>
        {inbox.length === 0 && <p>Sem sugestões. A IA volta a sugerir quando os dados mudarem.</p>}
        {inbox.map((suggestion) => (
          <article key={suggestion.id} className="card">
            <h3>{suggestion.title}</h3>
            <p>
              <strong>Porquê:</strong> {suggestion.reason}
            </p>
            {suggestion.changes.length > 0 && (
              <>
                <p>Se aceitar:</p>
                <ul>
                  {suggestion.changes.map((c) => (
                    <li key={describeChange(db, c)}>{describeChange(db, c)}</li>
                  ))}
                </ul>
              </>
            )}
            <p>
              <button type="button" onClick={() => accept(suggestion)}>
                {suggestion.changes.length > 0 ? "Aceitar" : "Visto"}
              </button>{" "}
              <button type="button" onClick={() => dismiss(suggestion)}>
                Dispensar
              </button>{" "}
              {suggestion.procedureId !== null && (
                <button type="button" onClick={() => setSelectedId(suggestion.procedureId)}>
                  Ver obra
                </button>
              )}
            </p>
          </article>
        ))}
        {handled.length > 0 && (
          <details>
            <summary>Tratadas ({handled.length})</summary>
            <ul>
              {handled.map(({ suggestion, outcome }, index) => (
                <li key={`${suggestion.id}-${index}`}>
                  {suggestion.title} — {outcome}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section className="col" aria-label="Obras e detalhe">
        <table>
          <caption>Obras no raio de {db.company.radiusKm} km</caption>
          <thead>
            <tr>
              <th scope="col">Obra</th>
              <th scope="col">Prazo</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibleProcedures(db).map((p) => (
              <tr key={p.id} aria-selected={selectedId === p.id}>
                <td>
                  <button type="button" onClick={() => setSelectedId(p.id)}>
                    {p.title}
                  </button>
                </td>
                <td>{p.deadline.slice(0, 10)}</td>
                <td>
                  <StatusCell db={db} procedureId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected !== null && (
          <article>
            <h2>{selected.title}</h2>
            <p>
              Estado: <StatusCell db={db} procedureId={selected.id} />
            </p>
            <ProcedureFacts procedure={selected} />
            <h3>Checklist da proposta</h3>
            <Checklist
              db={db}
              procedure={selected}
              onToggle={(documentId, prepared) =>
                apply(
                  [{ kind: "set-document", procedureId: selected.id, documentId, prepared }],
                  "pessoa",
                )
              }
            />
          </article>
        )}
      </section>
    </div>
  );
}
