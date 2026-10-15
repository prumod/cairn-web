// PROTOTYPE (throwaway, issue #64) — Variant H: chatbot at the centre; left sidebar is the
// pipeline grouped by participation state; right sidebar is the map plus the deadlines.

import { useState } from "react";
import {
  type ParticipationStatus,
  deadlineNote,
  participationOf,
  procedureById,
  statusLabel,
  visibleProcedures,
} from "./data";
import { ChatColumn, chatPrompts, useChat } from "./chat";
import { TermHint } from "./terms";
import { OpportunityMap, StatusPill, type VariantProps } from "./shared";

const columns: ParticipationStatus[] = ["nova", "em-analise", "em-preparacao", "nao-concorrer"];

export function VariantChatBoard({ db, apply }: VariantProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId === null ? null : procedureById(db, selectedId);
  const chat = useChat(db, apply, selectedId);
  const shown = visibleProcedures(chat.preview ?? db);

  return (
    <div className="chat-layout">
      <aside className="col side" aria-label="Pipeline">
        <h2>
          Pipeline
          <TermHint area="states" />
          <TermHint area="listing" />
        </h2>
        {columns.map((status) => {
          const items = shown.filter((p) => participationOf(db, p.id).status === status);
          return (
            <section key={status}>
              <h3>
                {statusLabel[status]} ({items.length})
              </h3>
              {items.length === 0 ? (
                <p>
                  <small>—</small>
                </p>
              ) : (
                <ul className="side-list">
                  {items.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        aria-pressed={selectedId === p.id}
                        onClick={() => setSelectedId(p.id)}
                      >
                        <strong>{p.title}</strong>
                        <small>{p.place}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </aside>

      <ChatColumn
        db={db}
        chat={chat}
        prompts={chatPrompts}
        selected={selected}
        onClearContext={() => setSelectedId(null)}
        onSelect={setSelectedId}
      />

      <aside className="col side" aria-label="Mapa e prazos">
        <h2>Mapa</h2>
        <OpportunityMap
          db={db}
          {...(chat.preview === undefined ? {} : { preview: chat.preview })}
          selectedId={selectedId}
          highlightIds={chat.focusIds}
          onSelect={setSelectedId}
        />
        <h3>
          Prazos
          <TermHint area="deadline" />
        </h3>
        <ol className="deadline-list">
          {shown.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setSelectedId(p.id)}>
                {p.deadline.slice(0, 10)} · {p.place}
              </button>{" "}
              <span className="deadline" data-urgent={deadlineNote(p).startsWith("próximo")}>
                {deadlineNote(p)}
              </span>{" "}
              <StatusPill status={participationOf(chat.preview ?? db, p.id).status} />
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
