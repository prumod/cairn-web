// PROTOTYPE: the Opções panel, where the person chooses how the agent behaves.

import { useEffect, useRef, useState } from "react";
import type { Settings } from "./settings";

export function OptionsPanel({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="d-options" ref={box}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="d-options-panel"
        onClick={() => setOpen((o) => !o)}
      >
        ⚙ Opções
      </button>
      {open && (
        <section id="d-options-panel" className="d-options-panel" aria-label="Opções">
          <fieldset>
            <legend>Resultados do agente</legend>
            <label>
              <input
                type="checkbox"
                checked={settings.resultsInChat}
                onChange={(event) => onChange({ ...settings, resultsInChat: event.target.checked })}
              />
              No chat
            </label>
            <small>
              {settings.resultsInChat
                ? "Os resultados aparecem no mapa e no chat."
                : "Os resultados aparecem só no mapa."}
            </small>
          </fieldset>
          <fieldset>
            <legend>Ações do agente</legend>
            <label>
              <input
                type="radio"
                name="d-actions"
                checked={settings.actions === "imediato"}
                onChange={() => onChange({ ...settings, actions: "imediato" })}
              />
              Imediatas
            </label>
            <label>
              <input
                type="radio"
                name="d-actions"
                checked={settings.actions === "proposta"}
                onChange={() => onChange({ ...settings, actions: "proposta" })}
              />
              Com proposta
            </label>
            <small>
              {settings.actions === "imediato"
                ? "O agente altera o mapa logo."
                : "O agente propõe e só altera o mapa depois de aceitar."}
            </small>
          </fieldset>
        </section>
      )}
    </div>
  );
}
