// PROTOTYPE (throwaway, issue #64): small building blocks reused by the variants.
// Layout belongs to each variant; only facts, map, checklist and change previews are shared.

import { type ReactNode, useEffect } from "react";
import {
  type Change,
  type ChangeSource,
  type Db,
  type ParticipationStatus,
  type Procedure,
  daysUntilDeadline,
  deadlineNote,
  describeChange,
  euro,
  formatDateTime,
  inRadius,
  participationOf,
  statusLabel,
} from "./data";

export type VariantProps = {
  db: Db;
  apply: (changes: Change[], source: ChangeSource) => void;
};

export function Diffed({ before, after }: { before: string; after: string }) {
  if (before === after) return <>{after}</>;
  return (
    <>
      <del>{before}</del> <ins>{after}</ins> <small>(proposto)</small>
    </>
  );
}

export function ProcedureFacts({ procedure }: { procedure: Procedure }) {
  return (
    <dl className="facts">
      <dt>Entidade adjudicante</dt>
      <dd>{procedure.buyer}</dd>
      <dt>Origem</dt>
      <dd>
        {procedure.origin === "convite"
          ? `Convite (${procedure.receivedOn})`
          : `Anúncio (${procedure.receivedOn})`}
      </dd>
      <dt>Localização da obra</dt>
      <dd>
        {procedure.place}, a {procedure.distanceKm} km
      </dd>
      <dt>Valor anunciado</dt>
      <dd>{euro.format(procedure.announcedValue)}</dd>
      <dt>Prazo de submissão</dt>
      <dd>
        {formatDateTime(procedure.deadline)}{" "}
        <span className="deadline" data-urgent={daysUntilDeadline(procedure) <= 3}>
          {deadlineNote(procedure)}
        </span>
      </dd>
      <dt>Prazo de execução</dt>
      <dd>{procedure.executionDays} dias</dd>
      <dt>Plataforma</dt>
      <dd>{procedure.platform}</dd>
      <dt>Requisitos (ilustrativos)</dt>
      <dd>
        Classe {procedure.requiredClass}; {procedure.requiredLicences.join(", ")}
      </dd>
    </dl>
  );
}

export function StatusPill({ status }: { status: ParticipationStatus }) {
  return (
    <span className="pill" data-status={status}>
      {statusLabel[status]}
    </span>
  );
}

export function StatusCell({
  db,
  preview,
  procedureId,
}: {
  db: Db;
  preview?: Db;
  procedureId: string;
}) {
  const before = participationOf(db, procedureId).status;
  const after = participationOf(preview ?? db, procedureId).status;
  if (before === after) return <StatusPill status={after} />;
  return (
    <span className="pill-change">
      <del>
        <StatusPill status={before} />
      </del>{" "}
      <ins>
        <StatusPill status={after} />
      </ins>
    </span>
  );
}

export function Checklist({
  db,
  preview,
  procedure,
  onToggle,
  renderExtra,
}: {
  db: Db;
  preview?: Db;
  procedure: Procedure;
  onToggle?: (documentId: string, prepared: boolean) => void;
  renderExtra?: (documentId: string) => ReactNode;
}) {
  const prepared = participationOf(db, procedure.id).preparedDocumentIds;
  const previewPrepared = participationOf(preview ?? db, procedure.id).preparedDocumentIds;
  return (
    <ul className="checklist">
      {procedure.documents.map((d) => {
        const isPrepared = prepared.includes(d.id);
        const willBePrepared = previewPrepared.includes(d.id);
        return (
          <li key={d.id}>
            <label>
              <input
                type="checkbox"
                checked={isPrepared}
                disabled={onToggle === undefined}
                onChange={(event) => onToggle?.(d.id, event.target.checked)}
              />{" "}
              {d.name} {d.mandatory ? "(obrigatório)" : "(opcional)"}
            </label>{" "}
            {isPrepared !== willBePrepared && (
              <ins>→ {willBePrepared ? "preparado" : "por preparar"} (proposto)</ins>
            )}
            {renderExtra?.(d.id)}
          </li>
        );
      })}
    </ul>
  );
}

export function ProposedChanges({
  db,
  changes,
  onAccept,
  onReject,
}: {
  db: Db;
  changes: Change[];
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <fieldset>
      <legend>Alterações propostas pela IA</legend>
      <ul>
        {changes.map((c) => (
          <li key={describeChange(db, c)}>{describeChange(db, c)}</li>
        ))}
      </ul>
      <button type="button" onClick={onAccept}>
        Aceitar
      </button>{" "}
      <button type="button" onClick={onReject}>
        Rejeitar
      </button>
    </fieldset>
  );
}

export const mapSize = 420;
const kmToPx = 2.6;

export function pinPosition(procedure: Procedure): { x: number; y: number } {
  const angle = (procedure.bearingDeg * Math.PI) / 180;
  return {
    x: mapSize / 2 + procedure.distanceKm * kmToPx * Math.sin(angle),
    y: mapSize / 2 - procedure.distanceKm * kmToPx * Math.cos(angle),
  };
}

export function OpportunityMap({
  db,
  preview,
  selectedId,
  highlightIds = [],
  onSelect,
  overlay,
}: {
  db: Db;
  preview?: Db;
  selectedId: string | null;
  highlightIds?: string[];
  onSelect: (procedureId: string) => void;
  overlay?: ReactNode;
}) {
  const center = mapSize / 2;
  const radius = db.company.radiusKm * kmToPx;
  const previewRadius = (preview ?? db).company.radiusKm * kmToPx;
  return (
    <div className="map-wrap">
      <svg
        width={mapSize}
        height={mapSize}
        viewBox={`0 0 ${mapSize} ${mapSize}`}
        role="group"
        aria-label={`Mapa ilustrativo: raio de ${db.company.radiusKm} km à volta de ${db.company.place}`}
      >
        <rect x="0" y="0" width={mapSize} height={mapSize} fill="none" stroke="currentColor" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        {previewRadius !== radius && (
          <circle
            cx={center}
            cy={center}
            r={previewRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
        <rect x={center - 5} y={center - 5} width="10" height="10" fill="currentColor" />
        <text x={center - 30} y={center + 20} fontSize="11">
          {db.company.place} (empresa)
        </text>
        {db.procedures.map((p) => {
          const { x, y } = pinPosition(p);
          const outside = !inRadius(preview ?? db, p);
          const highlighted = highlightIds.includes(p.id);
          return (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`${p.title}${outside ? " (fora do raio)" : ""}`}
              aria-pressed={selectedId === p.id}
              onClick={() => onSelect(p.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onSelect(p.id);
              }}
            >
              <circle
                cx={x}
                cy={y}
                r={selectedId === p.id ? 9 : 6}
                fill={outside ? "none" : "currentColor"}
                stroke="currentColor"
                strokeWidth={highlighted ? 4 : 1}
              />
              <text x={x + 10} y={y + 4} fontSize="11">
                {p.place}
                {highlighted ? " ★" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      {overlay}
      <p>
        <small>
          ■ empresa · ● dentro do raio · ○ fora do raio · ★ destacado pela IA · tracejado = raio
          atual
          {previewRadius !== radius ? " · linha grossa = raio proposto" : ""}
        </small>
      </p>
    </div>
  );
}

export function StatePanel({ db, onReset }: { db: Db; onReset: () => void }) {
  return (
    <aside className="proto-state" aria-label="Estado dos dados da demonstração">
      <p>
        <strong>Demonstração.</strong> Dados fictícios; a IA é simulada; nada é enviado.
      </p>
      <button type="button" onClick={onReset}>
        Reiniciar demonstração
      </button>
      <h2>Base de dados (simulada)</h2>
      <p>
        {db.company.name}
        <br />
        Classe {db.company.companyClass}; {db.company.licences.join(", ")}
        <br />
        Raio de pesquisa: <strong>{db.company.radiusKm} km</strong>
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Obra</th>
            <th scope="col">Estado</th>
            <th scope="col">Docs</th>
          </tr>
        </thead>
        <tbody>
          {db.procedures.map((p) => {
            const participation = participationOf(db, p.id);
            return (
              <tr key={p.id}>
                <td>{p.place}</td>
                <td>
                  <StatusPill status={participation.status} />
                </td>
                <td>
                  {participation.preparedDocumentIds.length}/{p.documents.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h2>Registo de alterações</h2>
      {db.log.length === 0 ? (
        <p>Sem alterações.</p>
      ) : (
        <ol reversed>
          {db.log.toReversed().map((entry) => (
            <li key={entry.seq}>
              <small>[{entry.source === "pessoa" ? "pessoa" : "IA, confirmada"}]</small>{" "}
              {entry.description}
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

export type VariantInfo = { key: string; name: string };

export function VariantSwitcher({
  variants,
  current,
  onChange,
}: {
  variants: VariantInfo[];
  current: string;
  onChange: (key: string) => void;
}) {
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const step = (delta: number) => {
    const next = variants[(index + delta + variants.length) % variants.length];
    if (next !== undefined) onChange(next.key);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable], dialog[open]")) return;
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const currentInfo = variants[index];
  return (
    <nav className="switcher" aria-label="Variantes do protótipo">
      <button type="button" onClick={() => step(-1)} aria-label="Variante anterior">
        ←
      </button>
      <span aria-live="polite">
        {currentInfo?.key} ({currentInfo?.name})
      </span>
      <button type="button" onClick={() => step(1)} aria-label="Variante seguinte">
        →
      </button>
    </nav>
  );
}

export function PromptChips({
  prompts,
  onPick,
}: {
  prompts: string[];
  onPick: (prompt: string) => void;
}) {
  return (
    <p className="chips">
      {prompts.map((prompt) => (
        <button key={prompt} type="button" onClick={() => onPick(prompt)}>
          {prompt}
        </button>
      ))}
    </p>
  );
}
