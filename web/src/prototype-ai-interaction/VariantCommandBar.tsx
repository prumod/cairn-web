// PROTOTYPE (throwaway, issue #64) — Variant C: a conventional app with manual controls,
// plus a Ctrl+K command bar. The bar previews the interpreted action live; Enter confirms it.

import { type SubmitEvent, useEffect, useRef, useState } from "react";
import {
  type ParticipationStatus,
  describeChange,
  procedureById,
  statusLabel,
  visibleProcedures,
} from "./data";
import { Checklist, ProcedureFacts, StatusCell, type VariantProps } from "./shared";
import { type AiReply, interpret } from "./simulatedAi";

const examples = [
  "participar na escola",
  "posso concorrer ao mercado?",
  "não concorrer ao mercado",
  "marca o deucp da escola",
  "mostra obras até 30 km",
  "prazos",
];

const manualStatuses: ParticipationStatus[] = ["em-analise", "em-preparacao", "nao-concorrer"];

export function VariantCommandBar({ db, apply }: VariantProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<AiReply | null>(null);
  const selected = selectedId === null ? null : procedureById(db, selectedId);

  const preview = query.trim().length >= 3 ? interpret(db, query, selectedId) : null;
  const normalizedQuery = query.toLowerCase();
  const navigation = db.procedures.filter(
    (p) =>
      query.trim() !== "" &&
      (p.title.toLowerCase().includes(normalizedQuery) ||
        p.place.toLowerCase().includes(normalizedQuery)),
  );

  const open = () => {
    setQuery("");
    setAnswer(null);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (preview === null) return;
    if (preview.changes.length > 0) {
      apply(preview.changes, "ia-confirmada");
      const [focus] = preview.focusIds;
      if (focus !== undefined) setSelectedId(focus);
      close();
      return;
    }
    // Read-only answers stay in the bar instead of closing it.
    setAnswer(preview);
    setQuery("");
  };

  return (
    <div className="split split-c">
      <section className="col" aria-label="Lista de obras">
        <h1>C — Barra de comandos</h1>
        <p>
          <button type="button" onClick={open}>
            ✦ Pedir à IA… (Ctrl+K)
          </button>
        </p>
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
      </section>

      <section className="col" aria-label="Detalhe">
        {selected === null ? (
          <p>Selecione uma obra, ou prima Ctrl+K e escreva o que quer fazer.</p>
        ) : (
          <article>
            <h2>{selected.title}</h2>
            <p>
              Estado: <StatusCell db={db} procedureId={selected.id} />
            </p>
            <p>
              {manualStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    apply([{ kind: "set-status", procedureId: selected.id, status }], "pessoa")
                  }
                >
                  {statusLabel[status]}
                </button>
              ))}
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

      <dialog ref={dialogRef} className="command-bar" aria-label="Barra de comandos da IA">
        <form onSubmit={onSubmit}>
          <input
            aria-label="Comando em linguagem natural"
            autoFocus
            size={50}
            value={query}
            placeholder="Escreva o que quer fazer…"
            onChange={(event) => setQuery(event.target.value)}
          />{" "}
          <button type="button" onClick={close}>
            Esc
          </button>
        </form>
        {selected !== null && (
          <p>
            <small>Contexto: {selected.title}</small>
          </p>
        )}

        {preview !== null && (
          <section aria-live="polite">
            <h2>Interpretação</h2>
            {preview.changes.length > 0 ? (
              <>
                <p>Ao premir Enter, a IA vai:</p>
                <ul>
                  {preview.changes.map((c) => (
                    <li key={describeChange(db, c)}>{describeChange(db, c)}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Pergunta sem alterações. Enter mostra a resposta.</p>
            )}
          </section>
        )}

        {navigation.length > 0 && (
          <section>
            <h2>Abrir</h2>
            <ul>
              {navigation.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(p.id);
                      close();
                    }}
                  >
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {answer !== null && (
          <section>
            <h2>Resposta</h2>
            <pre className="wrap">{answer.text}</pre>
          </section>
        )}

        {query === "" && answer === null && (
          <section>
            <h2>Exemplos</h2>
            <ul>
              {examples.map((example) => (
                <li key={example}>
                  <button type="button" onClick={() => setQuery(example)}>
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </dialog>
    </div>
  );
}
