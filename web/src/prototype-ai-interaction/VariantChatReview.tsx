// PROTOTYPE (throwaway, issue #64) — Variant G: chatbot at the centre; left sidebar is a
// library of ready-made requests; right sidebar is a review panel that previews every
// proposed change across all works and keeps the log of applied changes.

import { useState } from "react";
import { procedureById, visibleProcedures } from "./data";
import { ChatColumn, chatPrompts, useChat } from "./chat";
import { TermHint } from "./terms";
import { ProposedChanges, StatusCell, type VariantProps } from "./shared";

const library: { group: string; prompts: string[] }[] = [
  {
    group: "Pesquisar",
    prompts: ["Mostra obras até 30 km", "Mostra obras até 75 km", "Quais os prazos mais urgentes?"],
  },
  {
    group: "Decidir",
    prompts: [
      "Posso concorrer à escola?",
      "Vamos participar na escola",
      "Não concorrer ao mercado",
    ],
  },
  {
    group: "Preparar",
    prompts: ["O que falta na escola?", "Marca os documentos que já temos no arquivo"],
  },
];

export function VariantChatReview({ db, apply }: VariantProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId === null ? null : procedureById(db, selectedId);
  const chat = useChat(db, apply, selectedId);
  const proposal = chat.pending?.proposal;

  return (
    <div className="chat-layout">
      <aside className="col side" aria-label="Biblioteca de pedidos">
        <h2>Pedidos prontos</h2>
        {library.map((entry) => (
          <section key={entry.group}>
            <h3>
              {entry.group}
              <TermHint
                area={
                  entry.group === "Pesquisar"
                    ? "map"
                    : entry.group === "Decidir"
                      ? "requirements"
                      : "documents"
                }
              />
            </h3>
            <ul className="side-list">
              {entry.prompts.map((prompt) => (
                <li key={prompt}>
                  <button type="button" onClick={() => chat.send(prompt)}>
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </aside>

      <ChatColumn
        db={db}
        chat={chat}
        prompts={chatPrompts}
        selected={selected}
        onClearContext={() => setSelectedId(null)}
        onSelect={setSelectedId}
      />

      <aside className="col side" aria-label="Revisão das alterações">
        <h2>Revisão</h2>
        {proposal !== undefined && chat.pending !== undefined ? (
          <ProposedChanges
            db={db}
            changes={proposal.changes}
            onAccept={() => chat.resolve(chat.pending?.id ?? 0, true)}
            onReject={() => chat.resolve(chat.pending?.id ?? 0, false)}
          />
        ) : (
          <p>
            <small>
              Sem propostas pendentes. As alterações da IA aparecem aqui antes de serem aplicadas.
            </small>
          </p>
        )}
        <table>
          <caption>
            Efeito nas obras
            <TermHint area="listing" />
          </caption>
          <tbody>
            {visibleProcedures(chat.preview ?? db).map((p) => (
              <tr key={p.id}>
                <td>
                  <button type="button" onClick={() => setSelectedId(p.id)}>
                    {p.place}
                  </button>
                </td>
                <td>
                  <StatusCell
                    db={db}
                    {...(chat.preview === undefined ? {} : { preview: chat.preview })}
                    procedureId={p.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {chat.preview !== undefined && chat.preview.company.radiusKm !== db.company.radiusKm && (
          <p>
            Raio: <del>{db.company.radiusKm} km</del> <ins>{chat.preview.company.radiusKm} km</ins>
          </p>
        )}
        <h3>Alterações aplicadas</h3>
        {db.log.length === 0 ? (
          <p>
            <small>Nenhuma.</small>
          </p>
        ) : (
          <ol className="applied">
            {db.log.toReversed().map((entry) => (
              <li key={entry.seq}>
                <small>[{entry.source === "pessoa" ? "pessoa" : "IA, confirmada"}]</small>{" "}
                {entry.description}
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
