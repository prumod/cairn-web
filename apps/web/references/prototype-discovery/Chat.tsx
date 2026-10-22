// PROTOTYPE: the conversation with the agent. Every tool call is a readable line;
// clicking a line restores that view. Where the results appear depends on the options.

import { useEffect, useRef, useState } from "react";
import { type AgentReply, type ToolStep, interpret, suggestedPrompts } from "./agent";
import { type Citation, CitationList, Cite, confirmOnEnter } from "./Citations";
import { useConfirm } from "./Confirm";
import { contestById, euro } from "./data";
import { MiniMap } from "./MapView";
import { type UnitNote, UnitLines, unitLines } from "./Notes";
import { CompareTable } from "./Panels";
import type { Settings } from "./settings";
import type { View } from "./view";

type Applied = "aplicada" | "pendente" | "rejeitada";

export type Message = {
  id: number;
  role: "pessoa" | "agente";
  text: string;
  steps: ToolStep[];
  citations?: Citation[];
  // Obras the person had staged when sending.
  units?: string[];
  unitNotes?: UnitNote[];
  state?: Applied;
};

const intro: Message = {
  id: 0,
  role: "agente",
  text: "Olá. Peça-me para filtrar obras, mostrar concursos no mapa, abrir um concurso ou comparar vários.",
  steps: [],
};

type HistoryEntry = { before: View; after: View };

export function useAgentChat(
  view: View,
  setView: (update: (view: View) => View) => void,
  settings: Settings,
) {
  const [messages, setMessages] = useState<Message[]>([intro]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const adopt = (after: View) => ({ ...after, selected: view.selected });

  const commit = (after: View) => {
    const next = adopt(after);
    setHistory((h) => [...h, { before: view, after: next }]);
    setView(() => next);
  };

  // Everything staged in the chat leaves together: the typed text, the commented obras and the
  // cited texts with their notes. Obras only selected on screen stay out until a note stages them.
  // The notes are the person's words too, so the agent reads them.
  const send = (typed: string, citations: Citation[] = [], unitNotes: UnitNote[] = []) => {
    const prompt = [typed, ...citations.map((c) => c.note), ...unitNotes.map((n) => n.note)]
      .filter((t) => t !== "")
      .join(". ");
    const staged = [...new Set(unitNotes.flatMap((n) => n.ids))];
    // Contests behind the cited text join the staged obras as context.
    const cited = citations.flatMap((c) => (c.contestId === null ? [] : [c.contestId]));
    const base = { ...view, selected: [...new Set([...staged, ...cited])] };
    const reply: AgentReply = interpret(prompt, base);
    const first = citations[0];
    const picked = staged.length;
    const text =
      reply.steps.length === 0 && (first !== undefined || picked > 0)
        ? `Recebi ${citations.length} ${citations.length === 1 ? "citação" : "citações"} e ${picked} ${picked === 1 ? "obra selecionada" : "obras selecionadas"}. Diga o que quer fazer com elas, por exemplo «abre este concurso» ou «compara estas obras».`
        : reply.text;
    const final = reply.steps.at(-1)?.after;
    const changesScreen = final !== undefined;
    const state: Applied | undefined = !changesScreen
      ? undefined
      : settings.actions === "proposta"
        ? "pendente"
        : "aplicada";
    if (final !== undefined && state === "aplicada") commit(final);
    setMessages((current) => [
      ...current.map((m) => (m.state === "pendente" ? { ...m, state: "rejeitada" as const } : m)),
      {
        id: current.length,
        role: "pessoa",
        text: typed,
        steps: [],
        ...(citations.length > 0 ? { citations } : {}),
        ...(staged.length > 0 ? { units: staged } : {}),
        ...(unitNotes.length > 0 ? { unitNotes } : {}),
      },
      {
        id: current.length + 1,
        role: "agente",
        text,
        steps: reply.steps,
        ...(state === undefined ? {} : { state }),
      },
    ]);
  };

  const resolve = (messageId: number, accept: boolean) => {
    const message = messages.find((m) => m.id === messageId);
    const final = message?.steps.at(-1)?.after;
    if (accept && final !== undefined) commit(final);
    setMessages((current) =>
      current.map((m) =>
        m.id === messageId
          ? { ...m, state: accept ? ("aplicada" as const) : ("rejeitada" as const) }
          : m,
      ),
    );
  };

  const restore = (step: ToolStep) => setView(() => adopt(step.after));

  const undo = () => {
    const last = history.at(-1);
    if (last === undefined) return;
    setHistory((h) => h.slice(0, -1));
    setView((v) => ({ ...last.before, selected: v.selected }));
  };

  return { messages, send, resolve, restore, undo, canUndo: history.length > 0 };
}

export type AgentChat = ReturnType<typeof useAgentChat>;

function Results({
  steps,
  settings,
  onOpen,
}: {
  steps: ToolStep[];
  settings: Settings;
  onOpen: (id: string) => void;
}) {
  const last = steps.at(-1);
  if (last === undefined || !settings.resultsInChat) return null;
  const compare = steps.find((s) => s.call.tool === "comparar");
  return (
    <div className="d-chat-results">
      {compare !== undefined && <CompareTable ids={compare.ids} />}
      {compare === undefined && last.ids.length > 0 && (
        <>
          <MiniMap ids={last.ids} />
          {last.ids.length <= 5 && (
            <ul className="d-chat-cards">
              {last.ids.map((id) => {
                const c = contestById(id);
                return (
                  <li key={id}>
                    <button type="button" onClick={() => onOpen(id)}>
                      <strong>{c.title}</strong>
                      <span>
                        {c.place} · {euro.format(c.announcedValue)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

// Sent obras grouped by locality, so a selection that spans several lists stays readable.
function UnitGroups({ ids, onOpen }: { ids: string[]; onOpen: (id: string) => void }) {
  const places = [...new Set(ids.map((id) => contestById(id).place))];
  return (
    <ul className="d-units" aria-label="Obras selecionadas">
      {places.map((place) => (
        <li key={place}>
          <strong>{place}</strong>
          <ul>
            {ids
              .filter((id) => contestById(id).place === place)
              .map((id) => (
                <li key={id}>
                  <button type="button" title="Abrir concurso" onClick={() => onOpen(id)}>
                    {contestById(id).title}
                  </button>
                </li>
              ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function UnitNoteList({
  notes,
  onUncomment,
  onRemove,
  onNote,
}: {
  notes: UnitNote[];
  // Takes the note back and selects again what it was about.
  onUncomment?: (index: number) => void;
  onRemove?: (index: number) => void;
  onNote?: (index: number, note: string) => void;
}) {
  if (notes.length === 0) return null;
  return (
    <ul className="d-citations" aria-label="Notas sobre obras">
      {notes.map((n, index) => (
        // Keyed by position so editing the note keeps the input focused.
        <li key={index}>
          <blockquote>
            <UnitLines places={n.places} obras={n.obras} />
            {onNote !== undefined ? (
              <input
                type="text"
                aria-label={`Nota sobre ${unitLines(n.places, n.obras).join(" · ")}`}
                placeholder="Nota"
                value={n.note}
                onChange={(event) => onNote(index, event.target.value)}
                onKeyDown={confirmOnEnter}
              />
            ) : (
              <em>{n.note}</em>
            )}
          </blockquote>
          {onUncomment !== undefined && (
            <button
              type="button"
              aria-label={`Descomentar ${unitLines(n.places, n.obras).join(" · ")}`}
              title="Descomentar"
              onClick={() => onUncomment(index)}
            >
              ↩
            </button>
          )}
          {onRemove !== undefined && (
            <button
              type="button"
              aria-label={`Apagar nota «${n.note}»`}
              title="Apagar"
              onClick={() => onRemove(index)}
            >
              ✕
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ChatPanel({
  chat,
  settings,
  onOpen,
  citations,
  onRemoveCitation,
  onNoteCitation,
  onClearCitations,
  unitNotes,
  onUncommentUnitNote,
  onRemoveUnitNote,
  onNoteUnitNote,
  onClearUnitNotes,
}: {
  chat: AgentChat;
  settings: Settings;
  onOpen: (id: string) => void;
  citations: Citation[];
  onRemoveCitation: (index: number) => void;
  onNoteCitation: (index: number, note: string) => void;
  onClearCitations: () => void;
  unitNotes: UnitNote[];
  onUncommentUnitNote: (index: number) => void;
  onRemoveUnitNote: (index: number) => void;
  onNoteUnitNote: (index: number, note: string) => void;
  onClearUnitNotes: () => void;
}) {
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const log = logRef.current;
    if (log !== null) log.scrollTop = log.scrollHeight;
  }, [chat.messages.length]);

  const ask = useConfirm();
  const submit = () => {
    if (draft.trim() === "" && citations.length === 0 && unitNotes.length === 0) return;
    chat.send(draft.trim(), citations, unitNotes);
    onClearCitations();
    onClearUnitNotes();
    setDraft("");
  };

  return (
    <section className="d-chat" aria-label="Conversa com o agente">
      <header>
        <h2>Agente</h2>
        {chat.canUndo && (
          <button type="button" onClick={chat.undo}>
            ↶ Voltar
          </button>
        )}
      </header>
      <ol className="d-chat-log" ref={logRef}>
        {chat.messages.map((m) => (
          <li key={m.id} data-role={m.role}>
            <strong>{m.role === "pessoa" ? "Você" : "Agente"}</strong>
            {m.role === "agente" ? (
              <Cite as="p" source="Mensagem do agente">
                {m.text}
              </Cite>
            ) : (
              m.text !== "" && <p>{m.text}</p>
            )}
            {m.units !== undefined && <UnitGroups ids={m.units} onOpen={onOpen} />}
            {m.unitNotes !== undefined && <UnitNoteList notes={m.unitNotes} />}
            {m.citations !== undefined && <CitationList citations={m.citations} />}
            {m.steps.length > 0 && (
              <ul className="d-tools" aria-label="Ferramentas usadas">
                {m.steps.map((step, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      title="Repor esta vista"
                      onClick={() => chat.restore(step)}
                    >
                      ⚙ {step.line}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Results steps={m.steps} settings={settings} onOpen={onOpen} />
            {m.state === "pendente" && (
              <p className="d-proposal">
                <button type="button" onClick={() => chat.resolve(m.id, true)}>
                  Aplicar no mapa
                </button>{" "}
                <button type="button" onClick={() => chat.resolve(m.id, false)}>
                  Rejeitar
                </button>
              </p>
            )}
            {m.state === "rejeitada" && (
              <p>
                <small>Proposta rejeitada.</small>
              </p>
            )}
          </li>
        ))}
      </ol>
      {chat.messages.length <= 1 && (
        <ul className="chips d-prompts" aria-label="Sugestões">
          {suggestedPrompts.map((p) => (
            <li key={p}>
              <button type="button" onClick={() => chat.send(p)}>
                {p}
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="d-composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {(citations.length > 0 || unitNotes.length > 0) && (
          <section className="d-staged" aria-label="Para enviar">
            <header>
              <strong>Para enviar com o pedido</strong>
              <small>nada é enviado até carregar em Enviar</small>
            </header>
            <UnitNoteList
              notes={unitNotes}
              onUncomment={onUncommentUnitNote}
              onRemove={onRemoveUnitNote}
              onNote={onNoteUnitNote}
            />
            <CitationList
              citations={citations}
              onRemove={onRemoveCitation}
              onNote={onNoteCitation}
            />
            <button
              type="button"
              onClick={() =>
                // Always asks: it discards every staged comment and citation.
                ask(1, {
                  effort: "escrito",
                  message: `Vai apagar ${[
                    unitNotes.length > 0
                      ? `${unitNotes.length} ${unitNotes.length === 1 ? "comentário" : "comentários"}`
                      : "",
                    citations.length > 0
                      ? `${citations.length} ${citations.length === 1 ? "citação" : "citações"}`
                      : "",
                  ]
                    .filter((part) => part !== "")
                    .join(" e ")}. Nada disto foi enviado.`,
                  action: "Limpar tudo",
                  run: () => {
                    onClearCitations();
                    onClearUnitNotes();
                  },
                })
              }
            >
              Limpar tudo
            </button>
          </section>
        )}
        <textarea
          aria-label="Pedido"
          rows={2}
          value={draft}
          placeholder={
            citations.length > 0 || unitNotes.length > 0
              ? "Diga o que fazer com a seleção…"
              : "Peça ao agente…"
          }
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button type="submit">Enviar ➤</button>
      </form>
    </section>
  );
}
