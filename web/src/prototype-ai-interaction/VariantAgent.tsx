// PROTOTYPE (throwaway, issue #64) — Variant D: the person states a goal; the agent shows
// a plan and runs it step by step, pausing at approval points. An autonomy setting lets
// document changes run unattended, but participation decisions always wait for a person.

import { type SubmitEvent, useEffect, useRef, useState } from "react";
import { applyChanges, procedureById } from "./data";
import {
  Checklist,
  ProcedureFacts,
  PromptChips,
  ProposedChanges,
  StatusCell,
  type VariantProps,
} from "./shared";
import { type AgentPlan, type StepResult, planFor } from "./simulatedAi";

type StepStatus = "pendente" | "aguarda aprovação" | "feito" | "ignorado";
type StepState = { status: StepStatus; result?: StepResult };

const goals = [
  "Prepara a participação na escola",
  "Faz a triagem das oportunidades novas",
  "Prepara a participação no mercado",
];

const stepDelayMs = 700;

export function VariantAgent({ db, apply }: VariantProps) {
  const [draft, setDraft] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [states, setStates] = useState<StepState[]>([]);
  const [cursor, setCursor] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoApproveDocuments, setAutoApproveDocuments] = useState(false);

  const setStepState = (index: number, state: StepState) =>
    setStates((current) => current.map((s, i) => (i === index ? state : s)));

  // The timer reads the latest data through a ref so that data updates do not cancel it.
  const dbRef = useRef(db);
  useEffect(() => {
    dbRef.current = db;
  });

  const cursorStatus = states[cursor]?.status;
  useEffect(() => {
    if (!running || plan === null) return;
    const step = plan.steps[cursor];
    if (step === undefined) {
      setRunning(false);
      return;
    }
    if (cursorStatus !== "pendente") return;
    const timer = setTimeout(() => {
      const result = step.run(dbRef.current);
      const decidesParticipation = result.changes.some((c) => c.kind === "set-status");
      const mayAutoApprove = autoApproveDocuments && !decidesParticipation;
      if (step.needsApproval && result.changes.length > 0 && !mayAutoApprove) {
        setStepState(cursor, { status: "aguarda aprovação", result });
        return;
      }
      if (result.changes.length > 0) apply(result.changes, "ia-confirmada");
      setStepState(cursor, { status: "feito", result });
      setCursor(cursor + 1);
    }, stepDelayMs);
    return () => clearTimeout(timer);
  }, [running, plan, cursor, cursorStatus, apply, autoApproveDocuments]);

  const displayStatus = (index: number): string => {
    const status = states[index]?.status ?? "pendente";
    return running && index === cursor && status === "pendente" ? "a executar…" : status;
  };

  const start = (goal: string) => {
    const next = planFor(db, goal);
    setPlan(next);
    setStates(next.steps.map(() => ({ status: "pendente" })));
    setCursor(0);
    setRunning(true);
    setDraft("");
  };

  const resolve = (approve: boolean) => {
    const state = states[cursor];
    if (state?.result === undefined) return;
    if (approve) apply(state.result.changes, "ia-confirmada");
    setStepState(cursor, { status: approve ? "feito" : "ignorado", result: state.result });
    setCursor(cursor + 1);
  };

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (draft.trim() !== "") start(draft);
  };

  const current = plan?.steps[cursor];
  const waiting =
    states[cursor]?.status === "aguarda aprovação" ? states[cursor]?.result : undefined;
  const preview = waiting === undefined ? undefined : applyChanges(db, waiting.changes, null);
  const focusId =
    current?.procedureId ??
    plan?.steps.findLast((s) => s.procedureId !== null)?.procedureId ??
    null;
  const focus = focusId === null ? null : procedureById(db, focusId);

  return (
    <div className="split split-d">
      <section className="col" aria-label="Objetivo e plano">
        <h1>D — Agente com plano</h1>
        <form onSubmit={onSubmit}>
          <label>
            Objetivo
            <br />
            <textarea
              rows={2}
              cols={32}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <br />
          <button type="submit">Planear e executar</button>
        </form>
        <PromptChips prompts={goals} onPick={start} />
        <label>
          <input
            type="checkbox"
            checked={autoApproveDocuments}
            onChange={(event) => setAutoApproveDocuments(event.target.checked)}
          />{" "}
          Aprovar automaticamente alterações à checklist (decisões de participar pedem sempre
          aprovação)
        </label>

        {plan !== null && (
          <>
            <h2>Plano</h2>
            <p>{plan.summary}</p>
            <ol>
              {plan.steps.map((step, index) => (
                <li key={step.id} aria-current={index === cursor && running ? "step" : undefined}>
                  {step.title}
                  {step.needsApproval ? " (requer aprovação)" : ""} —{" "}
                  <em>{displayStatus(index)}</em>
                </li>
              ))}
            </ol>
            {running ? (
              <button type="button" onClick={() => setRunning(false)}>
                Parar agente
              </button>
            ) : (
              cursor < plan.steps.length && (
                <button type="button" onClick={() => setRunning(true)}>
                  Retomar
                </button>
              )
            )}
            {cursor >= plan.steps.length && <p>Plano concluído.</p>}
          </>
        )}
      </section>

      <section className="col" aria-label="Área de trabalho do agente">
        {waiting !== undefined && current !== undefined && (
          <>
            <h2>Aprovação necessária: {current.title}</h2>
            <pre className="wrap">{waiting.detail}</pre>
            <ProposedChanges
              db={db}
              changes={waiting.changes}
              onAccept={() => resolve(true)}
              onReject={() => resolve(false)}
            />
          </>
        )}
        {focus === null ? (
          <p>Indique um objetivo. O agente mostra aqui a obra em que está a trabalhar.</p>
        ) : (
          <article>
            <h2>{focus.title}</h2>
            <p>
              Estado:{" "}
              <StatusCell
                db={db}
                {...(preview === undefined ? {} : { preview })}
                procedureId={focus.id}
              />
            </p>
            <ProcedureFacts procedure={focus} />
            <h3>Checklist da proposta</h3>
            <Checklist db={db} {...(preview === undefined ? {} : { preview })} procedure={focus} />
          </article>
        )}
      </section>

      <section className="col" aria-label="Registo de atividade do agente">
        <h2>Atividade</h2>
        {plan === null ? (
          <p>Sem atividade.</p>
        ) : (
          <ol>
            {plan.steps.map((step, index) => {
              const state = states[index];
              if (state === undefined || state.status === "pendente") return null;
              return (
                <li key={step.id}>
                  <strong>{step.title}</strong> — {state.status}
                  {state.result !== undefined && <pre className="wrap">{state.result.detail}</pre>}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
