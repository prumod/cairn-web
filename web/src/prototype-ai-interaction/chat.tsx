// PROTOTYPE (throwaway, issue #64): shared chatbot column for the three-column variants
// (F, G, H). The conversation and input sit at the centre; each variant fills the sidebars.

import { useEffect, useRef, useState } from "react";
import {
  type Change,
  type ChangeSource,
  type Db,
  type Procedure,
  applyChanges,
  deadlineNote,
  participationOf,
  procedureById,
} from "./data";
import { PromptChips, ProposedChanges, StatusPill } from "./shared";
import { type AiReply, interpret } from "./simulatedAi";

export type ChatMessage = {
  id: number;
  role: "pessoa" | "ia";
  text: string;
  focusIds: string[];
  proposal?: { changes: Change[]; state: "pendente" | "aceite" | "rejeitada" };
};

const intro: ChatMessage = {
  id: 0,
  role: "ia",
  text: "Olá. Peça-me para pesquisar obras, rever requisitos, registar decisões ou acompanhar a checklist. Eu proponho; a decisão é sua.",
  focusIds: [],
};

export function useChat(
  db: Db,
  apply: (changes: Change[], source: ChangeSource) => void,
  contextId: string | null,
  interpretFn: (db: Db, prompt: string, contextId: string | null) => AiReply = interpret,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([intro]);

  const send = (prompt: string) => {
    const reply = interpretFn(db, prompt, contextId);
    setMessages((current) => [
      // A newer request supersedes an unanswered proposal.
      ...current.map((m) =>
        m.proposal?.state === "pendente"
          ? { ...m, proposal: { ...m.proposal, state: "rejeitada" as const } }
          : m,
      ),
      { id: current.length, role: "pessoa", text: prompt, focusIds: [] },
      {
        id: current.length + 1,
        role: "ia",
        text: reply.text,
        focusIds: reply.focusIds,
        ...(reply.changes.length > 0
          ? { proposal: { changes: reply.changes, state: "pendente" as const } }
          : {}),
      },
    ]);
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

  const pending = messages.findLast((m) => m.proposal?.state === "pendente");
  const preview =
    pending?.proposal === undefined ? undefined : applyChanges(db, pending.proposal.changes, null);
  const focusIds =
    messages.findLast((m) => m.role === "ia" && m.focusIds.length > 0)?.focusIds ?? [];

  return { messages, send, resolve, pending, preview, focusIds };
}

export type Chat = ReturnType<typeof useChat>;

export function ProcedureMini({
  db,
  procedure,
  onSelect,
}: {
  db: Db;
  procedure: Procedure;
  onSelect: (procedureId: string) => void;
}) {
  return (
    <button type="button" className="mini" onClick={() => onSelect(procedure.id)}>
      <strong>{procedure.title}</strong>
      <span>
        <StatusPill status={participationOf(db, procedure.id).status} />{" "}
        <small>
          {procedure.place} · {deadlineNote(procedure)}
        </small>
      </span>
    </button>
  );
}

// Focus ids can also name places, companies or materials (visualisation variants).
const minisOf = (db: Db, message: ChatMessage) =>
  message.focusIds.filter((id) => db.procedures.some((p) => p.id === id));

export function ChatColumn({
  db,
  chat,
  prompts,
  selected,
  onClearContext,
  onSelect,
}: {
  db: Db;
  chat: Chat;
  prompts: string[];
  selected: Procedure | null;
  onClearContext: () => void;
  onSelect: (procedureId: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log !== null) log.scrollTop = log.scrollHeight;
  }, [chat.messages.length]);

  const submit = () => {
    if (draft.trim() === "") return;
    chat.send(draft);
    setDraft("");
  };

  return (
    <section className="chat-center" aria-label="Conversa com a IA">
      <ol className="chat-log" ref={logRef}>
        {chat.messages.map((m) => (
          <li key={m.id}>
            <strong>{m.role === "pessoa" ? "Você" : "IA"}</strong>
            <pre className="wrap">{m.text}</pre>
            {minisOf(db, m).length > 0 && minisOf(db, m).length <= 5 && (
              <div className="minis">
                {minisOf(db, m).map((id) => (
                  <ProcedureMini
                    key={id}
                    db={db}
                    procedure={procedureById(db, id)}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
            {m.proposal?.state === "pendente" && (
              <ProposedChanges
                db={db}
                changes={m.proposal.changes}
                onAccept={() => chat.resolve(m.id, true)}
                onReject={() => chat.resolve(m.id, false)}
              />
            )}
            {m.proposal !== undefined && m.proposal.state !== "pendente" && (
              <p>
                <small>Proposta {m.proposal.state}.</small>
              </p>
            )}
          </li>
        ))}
      </ol>
      {chat.messages.length <= 1 && <PromptChips prompts={prompts} onPick={chat.send} />}
      <form
        className="chat-input"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {selected !== null && (
          <p className="composer-note">
            <small>Contexto: {selected.title}</small>{" "}
            <button type="button" onClick={onClearContext}>
              Limpar contexto
            </button>
          </p>
        )}
        <div className="composer-box">
          <textarea
            aria-label="Pedido"
            rows={2}
            value={draft}
            placeholder="Peça uma pesquisa, uma revisão de requisitos ou uma decisão…"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
          />
          <button type="submit">Enviar ➤</button>
        </div>
      </form>
    </section>
  );
}

export const chatPrompts = [
  "Mostra obras até 30 km",
  "Quais os prazos mais urgentes?",
  "Posso concorrer à escola?",
  "Vamos participar na escola",
  "Marca os documentos que já temos no arquivo",
  "O que falta na escola?",
];
