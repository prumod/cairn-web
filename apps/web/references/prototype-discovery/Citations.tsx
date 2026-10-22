// PROTOTYPE: text from the database or from external sources — contest data, the
// notice preview, the agent's messages — can be selected and cited into the chat. Everything
// else (labels, headings, buttons) is static and cannot be selected there.

import { type KeyboardEvent, type ReactNode, useEffect } from "react";

// `note` is what the person wrote about the cited text; it travels with the citation.
export type Citation = { text: string; source: string; contestId: string | null; note: string };

// Marks the text inside as citable. `source` names where the data comes from.
export function Cite({
  source,
  contest,
  as: Tag = "span",
  children,
}: {
  source: string;
  contest?: string;
  as?: "span" | "p" | "dd" | "strong";
  children: ReactNode;
}) {
  return (
    <Tag data-cite={source} data-contest={contest}>
      {children}
    </Tag>
  );
}

// Only the parts of the selection that sit inside citable elements are cited.
function readSelection(): Omit<Citation, "note"> | null {
  const selection = window.getSelection();
  if (selection === null || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const parts: string[] = [];
  const sources = new Set<string>();
  let contestId: string | null = null;
  for (const element of document.querySelectorAll<HTMLElement>("[data-cite]")) {
    if (!range.intersectsNode(element)) continue;
    const part = document.createRange();
    part.selectNodeContents(element);
    if (range.compareBoundaryPoints(Range.START_TO_START, part) > 0) {
      part.setStart(range.startContainer, range.startOffset);
    }
    if (range.compareBoundaryPoints(Range.END_TO_END, part) < 0) {
      part.setEnd(range.endContainer, range.endOffset);
    }
    const text = part.toString().trim();
    if (text === "") continue;
    parts.push(text);
    sources.add(element.dataset.cite ?? "");
    contestId ??= element.dataset.contest ?? null;
  }
  if (parts.length === 0) return null;
  return { text: parts.join(" … "), source: [...sources].join(" / "), contestId };
}

// Watches the page's text selection and reports citable parts with a point above them.
export function SelectionWatcher({
  onSelect,
  onClear,
}: {
  onSelect: (citation: Omit<Citation, "note">, at: { x: number; y: number }) => void;
  onClear: () => void;
}) {
  useEffect(() => {
    const update = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".d-inline-note")) return;
      const citation = readSelection();
      const selection = window.getSelection();
      if (citation === null || selection === null) return;
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      onSelect(citation, { x: rect.left, y: rect.top - 42 });
    };
    const hide = () => {
      if (window.getSelection()?.isCollapsed ?? true) onClear();
    };
    document.addEventListener("mouseup", update);
    document.addEventListener("keyup", update);
    document.addEventListener("selectionchange", hide);
    return () => {
      document.removeEventListener("mouseup", update);
      document.removeEventListener("keyup", update);
      document.removeEventListener("selectionchange", hide);
    };
  }, [onSelect, onClear]);
  return null;
}

// Enter confirms a staged note instead of submitting the chat form around it.
export function confirmOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.currentTarget.blur();
}

export function CitationList({
  citations,
  onRemove,
  onNote,
}: {
  citations: Citation[];
  onRemove?: (index: number) => void;
  onNote?: (index: number, note: string) => void;
}) {
  if (citations.length === 0) return null;
  return (
    <ul className="d-citations" aria-label="Citações">
      {citations.map((c, index) => (
        <li key={`${c.source}-${c.text}`}>
          <blockquote>
            <q>{c.text}</q>
            <small>{c.source}</small>
            {onNote !== undefined ? (
              <input
                type="text"
                aria-label={`Nota sobre «${c.text}»`}
                placeholder="Nota (opcional)"
                value={c.note}
                onChange={(event) => onNote(index, event.target.value)}
                onKeyDown={confirmOnEnter}
              />
            ) : (
              c.note !== "" && <em>{c.note}</em>
            )}
          </blockquote>
          {onRemove !== undefined && (
            <button
              type="button"
              aria-label={`Remover citação «${c.text}»`}
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
