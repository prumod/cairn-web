// PROTOTYPE (throwaway, issue #64) — Variant A: chat on the left, a live canvas on the
// right. AI proposals render on the canvas as <del>/<ins> diffs until accepted or rejected.

import { useEffect, useRef, useState } from "react";
import { type Change, applyChanges, procedureById, visibleProcedures } from "./data";
import {
  Checklist,
  OpportunityMap,
  ProcedureFacts,
  CenterComposer,
  PromptChips,
  ProposedChanges,
  StatusCell,
  type VariantProps,
} from "./shared";
import { interpret } from "./simulatedAi";

type Message = {
  id: number;
  role: "pessoa" | "ia";
  text: string;
  proposal?: { changes: Change[]; state: "pendente" | "aceite" | "rejeitada" };
};

type CanvasView = "lista" | "mapa" | "dossier";

const prompts = [
  "Mostra obras até 30 km",
  "Quais os prazos mais urgentes?",
  "Posso concorrer à escola?",
  "Vamos participar na escola",
  "Marca os documentos que já temos no arquivo",
  "O que falta na escola?",
];

export function VariantChatCanvas({ db, apply }: VariantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ia",
      text: "Olá. Peça-me para pesquisar obras, rever requisitos, registar decisões ou acompanhar a checklist. Eu proponho; a decisão é sua.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<CanvasView>("lista");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log !== null) log.scrollTop = log.scrollHeight;
  }, [messages.length]);

  const pending = messages.findLast((m) => m.proposal?.state === "pendente");
  const preview =
    pending?.proposal === undefined ? undefined : applyChanges(db, pending.proposal.changes, null);
  const canvasDb = preview ?? db;
  const selected = selectedId === null ? null : procedureById(db, selectedId);

  const send = (prompt: string) => {
    const reply = interpret(db, prompt, selectedId);
    setMessages((current) => [
      // A newer request supersedes an unanswered proposal.
      ...current.map((m) =>
        m.proposal?.state === "pendente"
          ? { ...m, proposal: { ...m.proposal, state: "rejeitada" as const } }
          : m,
      ),
      { id: current.length, role: "pessoa", text: prompt },
      {
        id: current.length + 1,
        role: "ia",
        text: reply.text,
        ...(reply.changes.length > 0
          ? { proposal: { changes: reply.changes, state: "pendente" as const } }
          : {}),
      },
    ]);
    setReplyOpen(true);
    setHighlightIds(reply.focusIds);
    const [onlyFocus] = reply.focusIds;
    if (reply.focusIds.length === 1 && onlyFocus !== undefined) {
      setSelectedId(onlyFocus);
      setView("dossier");
    } else if (reply.focusIds.length > 1) {
      setView(reply.changes.some((c) => c.kind === "set-radius") ? "mapa" : "lista");
    }
    setDraft("");
  };

  const resolve = (messageId: number, accept: boolean) => {
    const message = messages.find((m) => m.id === messageId);
    if (message?.proposal === undefined) return;
    if (accept) apply(message.proposal.changes, "ia-confirmada");
    setMessages((current) =>
      current.map((m) =>
        m.id === messageId && m.proposal !== undefined
          ? { ...m, proposal: { ...m.proposal, state: accept ? "aceite" : "rejeitada" } }
          : m,
      ),
    );
  };

  const select = (procedureId: string) => {
    setSelectedId(procedureId);
    setView("dossier");
  };

  const last = messages.at(-1);
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <div className="split split-a">
      <section className="col canvas-full" aria-label="Canvas">
        <nav aria-label="Vistas do canvas">
          {(["lista", "mapa", "dossier"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
              {v === "lista" ? "Lista" : v === "mapa" ? "Mapa" : "Dossier"}
            </button>
          ))}
          {preview !== undefined && (
            <p>
              <mark>A pré-visualizar uma proposta da IA — aceite ou rejeite abaixo.</mark>
            </p>
          )}
        </nav>

        {view === "lista" && (
          <table>
            <caption>
              Obras no raio de{" "}
              {preview !== undefined && preview.company.radiusKm !== db.company.radiusKm ? (
                <>
                  <del>{db.company.radiusKm}</del> <ins>{preview.company.radiusKm}</ins>
                </>
              ) : (
                db.company.radiusKm
              )}{" "}
              km
            </caption>
            <thead>
              <tr>
                <th scope="col">Obra</th>
                <th scope="col">Local</th>
                <th scope="col">Prazo</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibleProcedures(canvasDb).map((p) => (
                <tr key={p.id}>
                  <td>
                    {highlightIds.includes(p.id) && "★ "}
                    <button type="button" onClick={() => select(p.id)}>
                      {p.title}
                    </button>
                  </td>
                  <td>
                    {p.place} ({p.distanceKm} km)
                  </td>
                  <td>{p.deadline.slice(0, 10)}</td>
                  <td>
                    <StatusCell
                      db={db}
                      {...(preview === undefined ? {} : { preview })}
                      procedureId={p.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === "mapa" && (
          <OpportunityMap
            db={db}
            {...(preview === undefined ? {} : { preview })}
            selectedId={selectedId}
            highlightIds={highlightIds}
            onSelect={select}
          />
        )}

        {view === "dossier" &&
          (selected === null ? (
            <p>Selecione uma obra na lista ou no mapa, ou peça à IA.</p>
          ) : (
            <article>
              <h2>{selected.title}</h2>
              <p>
                Estado:{" "}
                <StatusCell
                  db={db}
                  {...(preview === undefined ? {} : { preview })}
                  procedureId={selected.id}
                />
              </p>
              <ProcedureFacts procedure={selected} />
              <h3>Checklist da proposta</h3>
              <Checklist
                db={db}
                {...(preview === undefined ? {} : { preview })}
                procedure={selected}
                onToggle={(documentId, prepared) =>
                  apply(
                    [{ kind: "set-document", procedureId: selected.id, documentId, prepared }],
                    "pessoa",
                  )
                }
              />
            </article>
          ))}
      </section>
      <CenterComposer
        label="Pedido"
        placeholder="Peça uma pesquisa, uma revisão de requisitos ou uma decisão…"
        value={draft}
        onChange={setDraft}
        onSubmit={() => send(draft)}
        prompts={prompts}
        onPrompt={send}
        note={
          selected !== null && (
            <p className="composer-note">
              <small>Contexto: {selected.title}</small>{" "}
              <button type="button" onClick={() => setSelectedId(null)}>
                Limpar contexto
              </button>
            </p>
          )
        }
        above={
          last !== undefined &&
          replyOpen && (
            <div className="composer-reply">
              <button
                type="button"
                className="reply-close"
                aria-label="Fechar resposta"
                onClick={() => setReplyOpen(false)}
              >
                ×
              </button>
              <strong>IA</strong>
              <pre className="wrap">{last.text}</pre>
              {last.proposal?.state === "pendente" && (
                <ProposedChanges
                  db={db}
                  changes={last.proposal.changes}
                  onAccept={() => resolve(last.id, true)}
                  onReject={() => resolve(last.id, false)}
                />
              )}
              {last.proposal !== undefined && last.proposal.state !== "pendente" && (
                <p>
                  <small>Proposta {last.proposal.state}.</small>
                </p>
              )}
              <details>
                <summary>Histórico ({messages.length})</summary>
                <ol className="chat-log" ref={logRef}>
                  {messages.map((m) => (
                    <li key={m.id}>
                      <strong>{m.role === "pessoa" ? "Você" : "IA"}:</strong>
                      <pre className="wrap">{m.text}</pre>
                    </li>
                  ))}
                </ol>
              </details>
              <PromptChips prompts={prompts} onPick={send} />
            </div>
          )
        }
      />
    </div>
  );
}
