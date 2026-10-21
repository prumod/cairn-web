// PROTOTYPE: every selection — cited text, ticked obras, a drag on the map — offers
// a note right where it happened. A button appears; clicking it turns it into a small form in
// the same place. Saving only stages the note in the chat; nothing is sent.

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type Citation } from "./Citations";
import { contestById } from "./data";

export type Point = { x: number; y: number };

// A note about selected obras, staged in the chat next to the citations.
// A note about localities lists their obras too, as copying a folder takes what is inside it.
// Obras are listed by name, localities by name. `obras` are the selected ones; `ids` are staged.
export type UnitNote = { ids: string[]; places: string[]; obras: string[]; note: string };

export type Anchor = Point &
  (
    | { kind: "citacao"; citation: Omit<Citation, "note"> }
    | { kind: "obras"; ids: string[] }
    | { kind: "localidades"; places: string[]; obras: string[]; ids: string[] }
  );

// Lets any control that selects obras say what it just added and where.
const PickContext = createContext<(ids: string[], at: Point) => void>(() => {});
export const PickProvider = PickContext.Provider;
export const usePick = () => useContext(PickContext);

// The point beside a control, for anchoring the note button to it.
export const besideElement = (element: Element): Point => {
  const rect = element.getBoundingClientRect();
  return { x: rect.right + 8, y: rect.top - 6 };
};

// The longest run of whole words that fits in `max` characters; a single long word is cut.
const fitWords = (name: string, max: number): string => {
  if (name.length <= max) return name;
  let fitted = "";
  for (const word of name.split(" ")) {
    const next = fitted === "" ? word : `${fitted} ${word}`;
    if (next.length > max) break;
    fitted = next;
  }
  return fitted === "" ? name.slice(0, max) : fitted;
};

type UnitList = { key: "obras" | "localidades"; label: string; items: string[] };

// The obras and the localities of a note, each one only when it has units.
function unitLists(places: string[], obras: string[]): UnitList[] {
  const lists: UnitList[] = [
    { key: "obras", label: "Obras", items: obras.map((id) => contestById(id).title) },
    { key: "localidades", label: "Localidades", items: places },
  ];
  return lists.filter((list) => list.items.length > 0);
}

// Closed, a list shows its count. Labelled when the note mixes localities and obras.
const countText = (list: UnitList, mixed: boolean): string => {
  const count = list.items.length;
  if (mixed) return `${list.label}: ${count} selecionadas`;
  const one = list.key === "obras" ? "obra" : "localidade";
  const many = list.key === "obras" ? "obras" : "localidades";
  return `${count} ${count === 1 ? one : many}`;
};

// Opened, a list shows its first and last names, cut to fifteen characters each.
const namesText = (items: string[]): string =>
  items.length > 1
    ? `${fitWords(items[0] ?? "", 15)}, ..., ${fitWords(items[items.length - 1] ?? "", 15)}`
    : items.join("");

export function unitLines(places: string[], obras: string[]): string[] {
  const lists = unitLists(places, obras);
  return lists.map((list) => countText(list, lists.length > 1));
}

// The lines of a note. Each count is a button that opens the names of its list when clicked;
// clicking again closes it.
export function UnitLines({ places, obras }: { places: string[]; obras: string[] }) {
  const [open, setOpen] = useState<string[]>([]);
  const lists = unitLists(places, obras);
  const mixed = lists.length > 1;
  return (
    <>
      {lists.map((list) => {
        const expanded = open.includes(list.key);
        const names = namesText(list.items);
        return (
          <button
            key={list.key}
            type="button"
            className="d-count-line"
            aria-expanded={expanded}
            onClick={() =>
              setOpen((o) =>
                o.includes(list.key) ? o.filter((k) => k !== list.key) : [...o, list.key],
              )
            }
          >
            {expanded ? (mixed ? `${list.label}: ${names}` : names) : countText(list, mixed)}
          </button>
        );
      })}
    </>
  );
}

// The average centre of every visible element that shows one of the obras (map pins, rows,
// cards mark theirs with data-units), so the button sits as close as it can to all of them.
function centreOf(ids: string[]): Point | null {
  const wanted = new Set(ids);
  const centres = [...document.querySelectorAll("[data-units]")]
    .filter((el) => (el.getAttribute("data-units") ?? "").split(" ").some((id) => wanted.has(id)))
    .map((el) => el.getBoundingClientRect())
    .filter(
      (r) =>
        r.width > 0 &&
        r.bottom > 0 &&
        r.right > 0 &&
        r.top < window.innerHeight &&
        r.left < window.innerWidth,
    )
    .map((r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 }));
  if (centres.length === 0) return null;
  return {
    x: centres.reduce((sum, p) => sum + p.x, 0) / centres.length,
    y: centres.reduce((sum, p) => sum + p.y, 0) / centres.length,
  };
}

// Keeps the note inside the viewport, as left/top for a fixed element.
const clamp = ({ x, y }: Point, width: number, height: number) => ({
  left: Math.min(Math.max(x, 8), window.innerWidth - width - 8),
  top: Math.min(Math.max(y, 8), window.innerHeight - height - 8),
});

export function InlineNote({
  anchor,
  startEditing = false,
  onEditing,
  onSave,
  onClose,
}: {
  anchor: Anchor;
  // Opens the form straight away instead of the button.
  startEditing?: boolean;
  onEditing: () => void;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(startEditing);
  const [note, setNote] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  // Obras centre the note on themselves and keep it there while the page scrolls; a citation
  // keeps the point beside the selected text.
  useLayoutEffect(() => {
    const place = () => {
      if (box.current === null) return;
      const { width, height } = box.current.getBoundingClientRect();
      const centre = anchor.kind === "citacao" ? null : centreOf(anchor.ids);
      const at = centre === null ? anchor : { x: centre.x - width / 2, y: centre.y - height / 2 };
      setPosition(clamp(at, width, height));
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [anchor, editing]);

  // A hidden element cannot take focus, so wait until the form has a position.
  const placed = position !== null;
  useEffect(() => {
    if (editing && placed) input.current?.focus();
  }, [editing, placed]);

  // A press anywhere else dismisses the button; an open form stays until saved or cancelled.
  useEffect(() => {
    if (editing) return;
    const away = (event: MouseEvent) => {
      if (event.target instanceof Node && box.current?.contains(event.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [editing, onClose]);

  useEffect(() => {
    const previous = document.activeElement;
    const element = box.current;
    return () => {
      if (previous instanceof HTMLElement || previous instanceof SVGElement) {
        if (
          previous.isConnected &&
          (document.activeElement === document.body || element?.contains(document.activeElement))
        )
          previous.focus();
      }
    };
  }, []);

  const isCitation = anchor.kind === "citacao";
  const subject = anchor.kind === "localidades" ? "localidades" : "obras";
  const preview: ReactNode = isCitation ? (
    <>
      <q>{anchor.citation.text}</q>
      <small>{anchor.citation.source}</small>
    </>
  ) : (
    <UnitLines
      places={anchor.kind === "localidades" ? anchor.places : []}
      obras={anchor.kind === "localidades" ? anchor.obras : anchor.ids}
    />
  );

  return (
    <div
      ref={box}
      className="d-inline-note"
      data-editing={editing}
      style={position ?? { visibility: "hidden" }}
    >
      {!editing ? (
        <button
          type="button"
          // Keep a text selection alive while the button is pressed.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            onEditing();
            setEditing(true);
            if (isCitation) window.getSelection()?.removeAllRanges();
          }}
        >
          {isCitation ? "❝ Citar" : "✎ Comentar"}
        </button>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(note.trim());
          }}
        >
          <blockquote>{preview}</blockquote>
          <input
            ref={input}
            type="text"
            aria-label={isCitation ? "Nota sobre a citação" : `Nota sobre ${subject} selecionadas`}
            placeholder={
              isCitation
                ? "O que quer dizer sobre isto?"
                : `O que quer dizer sobre estas ${subject}?`
            }
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
            }}
          />
          <div className="d-inline-note-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      )}
    </div>
  );
}
