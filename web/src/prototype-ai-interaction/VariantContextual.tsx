// PROTOTYPE (throwaway, issue #64) — Variant B: no global chat. The AI lives on the
// objects: a map pin, a list row or a checklist line opens an inline prompt about that object.

import { type SubmitEvent, useState } from "react";
import { type Db, procedureById, visibleProcedures } from "./data";
import {
  Checklist,
  OpportunityMap,
  ProcedureFacts,
  PromptChips,
  ProposedChanges,
  StatusCell,
  type VariantProps,
} from "./shared";
import { mapSize, positionOf } from "./mapKit";
import { type AiReply, interpret } from "./simulatedAi";
import { TermHint } from "./terms";

type AskTarget =
  | { kind: "obra"; procedureId: string; anchor: "mapa" | "lista" }
  | { kind: "documento"; procedureId: string; documentId: string };

function InlineAsk({
  db,
  apply,
  label,
  procedureId,
  quickPrompts,
  onClose,
}: VariantProps & {
  label: string;
  procedureId: string;
  quickPrompts: string[];
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<AiReply | null>(null);

  const ask = (prompt: string) => {
    setReply(interpret(db, prompt, procedureId));
    setDraft("");
  };
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (draft.trim() !== "") ask(draft);
  };

  return (
    <div className="inline-ask" role="dialog" aria-label={`Perguntar à IA sobre ${label}`}>
      <p>
        <small>✦ IA sobre: {label}</small>{" "}
        <button type="button" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </p>
      <PromptChips prompts={quickPrompts} onPick={ask} />
      <form onSubmit={onSubmit}>
        <input
          aria-label="Pedido sobre este objeto"
          value={draft}
          placeholder="Pergunte ou peça uma alteração…"
          onChange={(event) => setDraft(event.target.value)}
        />{" "}
        <button type="submit">Enviar ➤</button>
      </form>
      {reply !== null && (
        <>
          <pre className="wrap">{reply.text}</pre>
          {reply.changes.length > 0 && (
            <ProposedChanges
              db={db}
              changes={reply.changes}
              onAccept={() => {
                apply(reply.changes, "ia-confirmada");
                setReply({ ...reply, changes: [], text: `${reply.text}\n✓ Aplicado.` });
              }}
              onReject={() =>
                setReply({ ...reply, changes: [], text: `${reply.text}\n✗ Rejeitado.` })
              }
            />
          )}
        </>
      )}
    </div>
  );
}

const popoverWidth = 300;

const procedurePrompts = ["Resumir", "Posso concorrer?", "Participar", "Não concorrer"];

function askLabel(db: Db, target: AskTarget): string {
  const procedure = procedureById(db, target.procedureId);
  if (target.kind === "obra") return procedure.title;
  const document = procedure.documents.find((d) => d.id === target.documentId);
  return `${document?.name ?? target.documentId} (${procedure.place})`;
}

export function VariantContextual({ db, apply }: VariantProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [askTarget, setAskTarget] = useState<AskTarget | null>(null);
  const selected = selectedId === null ? null : procedureById(db, selectedId);

  const openAsk = (target: AskTarget) => {
    setSelectedId(target.procedureId);
    setAskTarget(target);
  };
  const isAsking = (target: AskTarget) => JSON.stringify(target) === JSON.stringify(askTarget);

  const renderAsk = (target: AskTarget, quickPrompts: string[]) => (
    <InlineAsk
      key={JSON.stringify(target)}
      db={db}
      apply={apply}
      label={askLabel(db, target)}
      procedureId={target.procedureId}
      quickPrompts={quickPrompts}
      onClose={() => setAskTarget(null)}
    />
  );

  const mapTarget = askTarget?.kind === "obra" && askTarget.anchor === "mapa" ? askTarget : null;
  const mapPin = mapTarget === null ? null : positionOf(procedureById(db, mapTarget.procedureId));

  return (
    <div className="split split-b">
      <section className="col" aria-label="Mapa">
        <h1>B — IA contextual nos objetos</h1>
        <p>
          <small>Clique num marcador para perguntar à IA sobre essa obra.</small>
        </p>
        <OpportunityMap
          db={db}
          selectedId={selectedId}
          onSelect={(procedureId) => openAsk({ kind: "obra", procedureId, anchor: "mapa" })}
          overlay={
            mapTarget !== null &&
            mapPin !== null && (
              // Geometry only: anchors the prompt next to the clicked pin, kept inside the map.
              <div
                className="map-popover"
                style={{
                  left: Math.min(mapPin.x + 12, mapSize - popoverWidth),
                  top: Math.min(mapPin.y + 12, mapSize / 2),
                }}
              >
                {renderAsk(mapTarget, procedurePrompts)}
              </div>
            )
          }
        />
      </section>

      <section className="col" aria-label="Lista e dossier">
        <table>
          <caption>Obras no raio de {db.company.radiusKm} km</caption>
          <thead>
            <tr>
              <th scope="col">
                Obra
                <TermHint area="listing" />
              </th>
              <th scope="col">
                Prazo
                <TermHint area="deadline" />
              </th>
              <th scope="col">Estado</th>
              <th scope="col">IA</th>
            </tr>
          </thead>
          {visibleProcedures(db).map((p) => {
            const target: AskTarget = { kind: "obra", procedureId: p.id, anchor: "lista" };
            return (
              <tbody key={p.id}>
                <tr aria-selected={selectedId === p.id}>
                  <td>
                    <button type="button" onClick={() => setSelectedId(p.id)}>
                      {p.title}
                    </button>
                  </td>
                  <td>{p.deadline.slice(0, 10)}</td>
                  <td>
                    <StatusCell db={db} procedureId={p.id} />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openAsk(target)}
                      aria-label={`Perguntar à IA sobre ${p.title}`}
                    >
                      ✦
                    </button>
                  </td>
                </tr>
                {isAsking(target) && (
                  <tr>
                    <td colSpan={4}>{renderAsk(target, procedurePrompts)}</td>
                  </tr>
                )}
              </tbody>
            );
          })}
        </table>

        {selected === null ? (
          <p>Selecione uma obra para ver o dossier.</p>
        ) : (
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
              renderExtra={(documentId) => {
                const target: AskTarget = {
                  kind: "documento",
                  procedureId: selected.id,
                  documentId,
                };
                const document = selected.documents.find((d) => d.id === documentId);
                return (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={() => openAsk(target)}
                      aria-label={`Perguntar à IA sobre ${document?.name}`}
                    >
                      ✦
                    </button>
                    {isAsking(target) &&
                      renderAsk(target, [
                        `Marcar ${document?.name ?? ""} como preparado`,
                        "O que falta?",
                      ])}
                  </>
                );
              }}
            />
          </article>
        )}
      </section>
    </div>
  );
}
