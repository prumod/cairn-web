// PROTOTYPE: the right-click menu. What it offers depends on what was clicked — an
// obra (a file), a locality (a folder) or empty space — and it acts on the whole selection.

import { createContext, useContext, useEffect, useRef } from "react";
import { type Point } from "./Notes";

export type MenuTarget =
  | { kind: "obras"; id: string }
  | { kind: "localidades"; place: string }
  | { kind: "vazio" };

export type MenuItem =
  | { label: string; shortcut?: string; disabled?: boolean; onSelect: () => void }
  | "separator";

// Lets any list or map say what was right-clicked and where.
const MenuContext = createContext<(target: MenuTarget, at: Point) => void>(() => {});
export const MenuProvider = MenuContext.Provider;
export const useOpenMenu = () => useContext(MenuContext);

export function ContextMenu({
  at,
  items,
  onClose,
}: {
  at: Point;
  items: MenuItem[];
  onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement;
    const element = box.current;
    box.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    const away = (event: MouseEvent) => {
      if (event.target instanceof Node && box.current?.contains(event.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", away);
    window.addEventListener("blur", onClose);
    window.addEventListener("resize", onClose);
    return () => {
      if (previous instanceof HTMLElement || previous instanceof SVGElement) {
        if (
          previous.isConnected &&
          (document.activeElement === document.body || element?.contains(document.activeElement))
        )
          previous.focus();
      }
      document.removeEventListener("mousedown", away);
      window.removeEventListener("blur", onClose);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  const move = (step: 1 | -1) => {
    const buttons = [
      ...(box.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []),
    ];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[(at + step + buttons.length) % buttons.length]?.focus();
  };

  // Keeps the menu inside the viewport.
  const left = Math.min(at.x, window.innerWidth - 240);
  const top = Math.min(at.y, window.innerHeight - items.length * 32 - 16);

  return (
    <div
      ref={box}
      className="d-context-menu"
      role="menu"
      style={{ left: Math.max(left, 4), top: Math.max(top, 4) }}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
        else if (event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      {items.map((item, index) =>
        item === "separator" ? (
          <hr key={`sep-${index}`} />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            disabled={item.disabled === true}
            onClick={() => {
              onClose();
              item.onSelect();
            }}
          >
            <span>{item.label}</span>
            {item.shortcut !== undefined && <kbd>{item.shortcut}</kbd>}
          </button>
        ),
      )}
    </div>
  );
}
