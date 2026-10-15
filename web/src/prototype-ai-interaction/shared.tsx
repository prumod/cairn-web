// PROTOTYPE (throwaway, issue #64): small building blocks reused by the variants.
// Layout belongs to each variant; only facts, map, checklist and change previews are shared.

import { type ReactNode, useEffect } from "react";
import {
  CompanyMarker,
  MapBackdrop,
  MapLegend,
  MapPin,
  RadiusRing,
  legendIcons,
  mapSize,
  positionOf,
} from "./mapKit";
import { TermHint, TermsReview } from "./terms";
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
      <dd>
        {procedure.buyer}
        <TermHint area="buyer" />
      </dd>
      <dt>Origem</dt>
      <dd>
        {procedure.origin === "convite"
          ? `Convite (${procedure.receivedOn})`
          : `Anúncio (${procedure.receivedOn})`}
        <TermHint area="origin" />
      </dd>
      <dt>Localização da obra</dt>
      <dd>
        {procedure.place}, a {procedure.distanceKm} km
        <TermHint area="map" />
      </dd>
      <dt>Valor anunciado</dt>
      <dd>
        {euro.format(procedure.announcedValue)}
        <TermHint area="value" />
      </dd>
      <dt>Prazo de submissão</dt>
      <dd>
        {formatDateTime(procedure.deadline)}{" "}
        <span className="deadline" data-urgent={daysUntilDeadline(procedure) <= 3}>
          {deadlineNote(procedure)}
        </span>
        <TermHint area="deadline" />
      </dd>
      <dt>Prazo de execução</dt>
      <dd>
        {procedure.executionDays} dias
        <TermHint area="execution" />
      </dd>
      <dt>Plataforma</dt>
      <dd>
        {procedure.platform}
        <TermHint area="platform" />
      </dd>
      <dt>Requisitos (ilustrativos)</dt>
      <dd>
        Classe {procedure.requiredClass}; {procedure.requiredLicences.join(", ")}
        <TermHint area="requirements" />
      </dd>
    </dl>
  );
}

const statusIcon: Record<ParticipationStatus, string> = {
  nova: "○",
  "em-analise": "◐",
  "em-preparacao": "✓",
  "nao-concorrer": "✕",
};

export function StatusPill({ status }: { status: ParticipationStatus }) {
  return (
    <span className="pill" data-status={status}>
      <span aria-hidden="true">{statusIcon[status]}</span> {statusLabel[status]}
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
  if (before === after)
    return (
      <>
        <StatusPill status={after} />
        <TermHint area="states" />
      </>
    );
  return (
    <span className="pill-change">
      <del>
        <StatusPill status={before} />
      </del>{" "}
      <ins>
        <StatusPill status={after} />
      </ins>
      <TermHint area="states" />
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
    <>
      <TermHint area="documents" />
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
    </>
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
      <legend>
        Alterações propostas pela IA
        <TermHint
          area={
            changes.some((c) => c.kind === "set-status")
              ? "decision"
              : changes.some((c) => c.kind === "set-document")
                ? "documents"
                : "map"
          }
        />
      </legend>
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
  const radiusKm = db.company.radiusKm;
  const previewKm = (preview ?? db).company.radiusKm;
  return (
    <div className="map-wrap">
      <svg
        width={mapSize}
        height={mapSize}
        viewBox={`0 0 ${mapSize} ${mapSize}`}
        role="group"
        aria-label={`Mapa ilustrativo: raio de ${radiusKm} km à volta de ${db.company.place}`}
      >
        <MapBackdrop labelTowns={["Ourém", "Coimbra"]} />
        <RadiusRing km={radiusKm} />
        {previewKm !== radiusKm && <RadiusRing km={previewKm} proposed />}
        <CompanyMarker place={db.company.place} />
        {db.procedures.map((p) => {
          const { x, y } = positionOf(p);
          const outside = !inRadius(preview ?? db, p);
          const highlighted = highlightIds.includes(p.id);
          const selected = selectedId === p.id;
          return (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`${p.title}${outside ? " (fora do raio)" : ""}`}
              aria-pressed={selected}
              onClick={() => onSelect(p.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onSelect(p.id);
              }}
            >
              <MapPin
                x={x}
                y={y}
                tone={outside ? "outside" : "inside"}
                selected={selected}
                highlighted={highlighted}
              />
              <text x={x + 11} y={y - 12} className={selected ? "map-label selected" : "map-label"}>
                {p.place}
                {highlighted ? " ★" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      {overlay}
      <MapLegend
        items={[
          { icon: legendIcons.company, label: "A sua empresa" },
          { icon: legendIcons.pinInside, label: "Obra dentro do raio" },
          { icon: legendIcons.pinOutside, label: "Obra fora do raio" },
          { icon: legendIcons.highlighted, label: "Destacada pela IA (★)" },
          { icon: legendIcons.radius, label: "Raio de pesquisa atual" },
          ...(previewKm !== radiusKm
            ? [{ icon: legendIcons.radiusProposed, label: "Raio proposto pela IA" }]
            : []),
        ]}
        after={<TermHint area="map" />}
      />
    </div>
  );
}

export function StatePanel({
  db,
  onReset,
  variant,
  variantId,
}: {
  db: Db;
  onReset: () => void;
  variant: string;
  variantId: string;
}) {
  return (
    <aside className="proto-state" aria-label="Estado dos dados da demonstração">
      <p>
        <strong>Demonstração.</strong> Dados fictícios; a IA é simulada; nada é enviado.
      </p>
      <button type="button" onClick={onReset}>
        Reiniciar demonstração
      </button>
      <TermsReview variant={variant} id={variantId} />
      <h2>Base de dados (simulada)</h2>
      <p>
        {db.company.name}
        <br />
        Classe {db.company.companyClass}; {db.company.licences.join(", ")}
        <br />
        Raio de pesquisa: <strong>{db.company.radiusKm} km</strong>
        <TermHint area="profile" />
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Obra</th>
            <th scope="col">
              Estado
              <TermHint area="states" />
            </th>
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
      <button type="button" onClick={() => step(-1)}>
        ← Anterior
      </button>
      <span aria-live="polite">
        {currentInfo?.key} ({currentInfo?.name})
      </span>
      <button type="button" onClick={() => step(1)}>
        Seguinte →
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
      <span className="chips-label">Sugestões (clique para pedir):</span>
      {prompts.map((prompt) => (
        <button key={prompt} type="button" onClick={() => onPick(prompt)}>
          {prompt}
        </button>
      ))}
    </p>
  );
}

// The main AI input: a non-modal bar at the horizontal centre of the screen. It never
// dims or covers the app; the content above reserves room for it.
export function CenterComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  prompts,
  onPrompt,
  note,
  above,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  prompts: string[];
  onPrompt: (prompt: string) => void;
  note?: ReactNode;
  above?: ReactNode;
  label: string;
}) {
  return (
    <div className="composer">
      <div className="composer-inner">
        {above || <PromptChips prompts={prompts} onPick={onPrompt} />}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (value.trim() !== "") onSubmit();
          }}
        >
          {note}
          <div className="composer-box">
            <textarea
              aria-label={label}
              rows={1}
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button type="submit">Enviar ➤</button>
          </div>
        </form>
      </div>
    </div>
  );
}
