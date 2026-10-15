// PROTOTYPE (throwaway, issue #64) — Variant F: chatbot at the centre; left sidebar is a
// work list (navigation); right sidebar is the dossier of the selected work.

import { useState } from "react";
import { procedureById, statusLabel, visibleProcedures } from "./data";
import { ChatColumn, chatPrompts, useChat } from "./chat";
import { Checklist, ProcedureFacts, StatusCell, StatusPill, type VariantProps } from "./shared";
import { participationOf } from "./data";

export function VariantChatNav({ db, apply }: VariantProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId === null ? null : procedureById(db, selectedId);
  const chat = useChat(db, apply, selectedId);
  const preview = chat.preview;

  return (
    <div className="chat-layout">
      <aside className="col side" aria-label="Obras">
        <h2>Obras</h2>
        <ul className="side-list">
          {visibleProcedures(db).map((p) => (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={selectedId === p.id}
                onClick={() => setSelectedId(p.id)}
              >
                <strong>{p.title}</strong>
                <span>
                  <StatusPill status={participationOf(db, p.id).status} /> <small>{p.place}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p>
          <small>
            Dentro do raio de {db.company.radiusKm} km de {db.company.place}.
          </small>
        </p>
      </aside>

      <ChatColumn
        db={db}
        chat={chat}
        prompts={chatPrompts}
        selected={selected}
        onClearContext={() => setSelectedId(null)}
        onSelect={setSelectedId}
      />

      <aside className="col side" aria-label="Dossier">
        {selected === null ? (
          <>
            <h2>Dossier</h2>
            <p>Selecione uma obra à esquerda, ou clique num cartão na conversa.</p>
          </>
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
            <p>
              <small>Estados possíveis: {Object.values(statusLabel).join(" · ")}</small>
            </p>
          </article>
        )}
      </aside>
    </div>
  );
}
