// PROTOTYPE: an action that throws away a large selection or comment asks first.
// A small one runs straight away.

import { createContext, useContext, useEffect, useRef } from "react";

// What was invested in the units decides how soon discarding them asks for confirmation: the
// more effort, the lower the limit. From this many units on, the action asks first.
export type Effort = "selecao" | "comentario" | "escrito";
export const confirmThresholds: Record<Effort, number> = {
  // Only selected: cheap to select again.
  selecao: 10,
  // Selected and grouped in a comment, with no words written yet.
  comentario: 3,
  // Selected and commented with written words: always asks.
  escrito: 1,
};

export type ConfirmRequest = {
  effort?: Effort;
  message: string;
  action: string;
  run: () => void;
};

type Ask = (units: number, request: ConfirmRequest) => void;

const ConfirmContext = createContext<Ask>((_, request) => request.run());
export const ConfirmProvider = ConfirmContext.Provider;
export const useConfirm = () => useContext(ConfirmContext);

// "7 obras", "6 localidades", or both.
export function unitsText(places: number, obras: number): string {
  const parts = [
    places > 0 ? `${places} ${places === 1 ? "localidade" : "localidades"}` : "",
    obras > 0 ? `${obras} ${obras === 1 ? "obra" : "obras"}` : "",
  ].filter((part) => part !== "");
  return parts.join(" e ");
}

// Cancelling is the safe default: it has the focus, and Esc or a click outside closes the dialog.
export function ConfirmDialog({
  request,
  onClose,
}: {
  request: ConfirmRequest;
  onClose: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = box.current;
    if (dialog === null) return;
    const previous = document.activeElement;
    dialog.showModal();
    return () => {
      if (previous instanceof HTMLElement || previous instanceof SVGElement) {
        if (previous.isConnected) previous.focus();
      }
    };
  }, []);
  return (
    <dialog
      ref={box}
      className="d-confirm"
      aria-labelledby="d-confirm-title"
      aria-describedby="d-confirm-message"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <h2 id="d-confirm-title">Tem a certeza?</h2>
      <p id="d-confirm-message">{request.message}</p>
      <div className="d-confirm-actions">
        <button type="button" autoFocus onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="d-danger"
          onClick={() => {
            onClose();
            request.run();
          }}
        >
          {request.action}
        </button>
      </div>
    </dialog>
  );
}
