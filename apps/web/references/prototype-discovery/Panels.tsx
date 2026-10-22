// PROTOTYPE: the person's own controls — filters (N14), the localities' works,
// the contest view (N04) and the comparison.

import {
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type Contest,
  type WorkType,
  buyers,
  company,
  contestById,
  deadlineText,
  euro,
  formatDate,
  places,
  publicationDates,
  today,
  workTypes,
} from "./data";
import { Cite } from "./Citations";
import { unitsText, useConfirm } from "./Confirm";
import { useOpenMenu } from "./ContextMenu";
import { besideElement, usePick } from "./Notes";
import { type Locality } from "./MapView";
import {
  type Filters,
  type View,
  defaultFilters,
  hasActiveFilters,
  isPriority,
  placesLabel,
  selectionState,
  toggleGroup,
  visibleContests,
  withPlaces,
  withSelected,
} from "./view";

type SetView = (update: (view: View) => View) => void;

const valueRanges = [
  { id: "todos", label: "Qualquer valor", min: null, max: null },
  { id: "ate100", label: "Até 100 mil €", min: null, max: 100_000 },
  { id: "100a500", label: "100 a 500 mil €", min: 100_000, max: 500_000 },
  { id: "mais500", label: "Mais de 500 mil €", min: 500_000, max: null },
] as const;

export function Profile() {
  return (
    <p className="d-profile">
      <strong>{company.name}</strong> · {company.place} · raio {company.radiusKm} km · classe{" "}
      {company.companyClass} · prioridade: {company.priorityTypes.join(", ")}
    </p>
  );
}

export function FilterBar({ view, setView }: { view: View; setView: SetView }) {
  const set = (patch: Partial<Filters>) =>
    setView((v) => ({ ...v, filters: { ...v.filters, ...patch }, highlighted: [], compare: null }));
  const range =
    valueRanges.find((r) => r.min === view.filters.minValue && r.max === view.filters.maxValue)
      ?.id ?? "todos";
  const total = visibleContests(view).length;
  return (
    <form className="d-filters" aria-label="Filtros" onSubmit={(e) => e.preventDefault()}>
      <label>
        Distância
        <select value={view.filters.maxKm} onChange={(e) => set({ maxKm: Number(e.target.value) })}>
          {[20, 30, 50].map((km) => (
            <option key={km} value={km}>
              até {km} km
            </option>
          ))}
        </select>
      </label>
      <label>
        Publicação
        <select
          value={view.filters.publishedOn ?? ""}
          onChange={(e) => set({ publishedOn: e.target.value === "" ? null : e.target.value })}
        >
          <option value="">Todas as datas</option>
          {publicationDates.map((d) => (
            <option key={d} value={d}>
              {d === today ? "Hoje" : formatDate(d)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Valor
        <select
          value={range}
          onChange={(e) => {
            const r = valueRanges.find((x) => x.id === e.target.value);
            if (r !== undefined) set({ minValue: r.min, maxValue: r.max });
          }}
        >
          {valueRanges.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Entidade
        <select
          value={view.filters.buyer ?? ""}
          onChange={(e) => set({ buyer: e.target.value === "" ? null : e.target.value })}
        >
          <option value="">Todas</option>
          {buyers.map((b) => (
            <option key={b} value={b}>
              {b.replace(" (fictício)", "").replace(" (fictícia)", "")}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Tipo de obra</legend>
        {workTypes.map((type: WorkType) => (
          <button
            key={type}
            type="button"
            aria-pressed={view.filters.workTypes.includes(type)}
            onClick={() =>
              set({
                workTypes: view.filters.workTypes.includes(type)
                  ? view.filters.workTypes.filter((t) => t !== type)
                  : [...view.filters.workTypes, type],
              })
            }
          >
            {type}
          </button>
        ))}
      </fieldset>
      <SelectGroup
        ids={visibleContests(view).map((c) => c.id)}
        view={view}
        setView={setView}
        label="Selecionar todos"
        listPlaces
      />
      <p className="d-filter-count" role="status">
        {total} {total === 1 ? "obra" : "obras"}
        {(hasActiveFilters(view.filters) || view.highlighted.length > 0) && (
          <>
            {" "}
            <button type="button" onClick={() => set({ ...defaultFilters })}>
              Limpar filtros
            </button>
          </>
        )}
      </p>
    </form>
  );
}

// The Localidade filter as a plain list of checkboxes: Selecionar todos, then one checkbox per
// locality. It always keeps at least one locality checked.
export function LocalityChecks({
  checked,
  onChange,
}: {
  checked: string[];
  onChange: (next: string[]) => void;
}) {
  const all = checked.length === places.length;
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (box.current !== null) box.current.indeterminate = !all;
  }, [all]);
  return (
    <fieldset className="d-locality-list">
      <legend>Localidade</legend>
      <label className="d-select-all">
        <input ref={box} type="checkbox" checked={all} onChange={() => onChange(places)} />
        Selecionar todos
      </label>
      {places.map((place) => {
        const on = checked.includes(place);
        return (
          <label key={place}>
            <input
              type="checkbox"
              checked={on}
              disabled={on && checked.length === 1}
              onChange={() =>
                onChange(on ? checked.filter((p) => p !== place) : [...checked, place])
              }
            />
            {place}
          </label>
        );
      })}
    </fieldset>
  );
}

// One checkbox that selects every unit of a list; it shows "some" when only part is selected.
function SelectGroup({
  ids,
  view,
  setView,
  label,
  listPlaces = false,
}: {
  ids: string[];
  view: View;
  setView: SetView;
  label: string;
  // Selecting also lists the localities of these obras.
  listPlaces?: boolean;
}) {
  const state = selectionState(view.selected, ids);
  const box = useRef<HTMLInputElement>(null);
  const pick = usePick();
  const ask = useConfirm();
  useEffect(() => {
    if (box.current !== null) box.current.indeterminate = state === "some";
  }, [state]);
  return (
    <label className="d-select-all">
      <input
        ref={box}
        type="checkbox"
        disabled={ids.length === 0}
        checked={state === "all"}
        onChange={(event) => {
          const added = ids.filter((id) => !view.selected.includes(id));
          const apply = () =>
            setView((v) => ({
              ...withSelected(v, toggleGroup(v.selected, ids)),
              filters: {
                ...v.filters,
                localities:
                  listPlaces && state !== "all"
                    ? withPlaces(v.filters.localities, ids)
                    : v.filters.localities,
              },
            }));
          if (state === "all") {
            ask(ids.length, {
              message: `Vai desselecionar ${unitsText(0, ids.length)}.`,
              action: "Desselecionar",
              run: apply,
            });
            return;
          }
          apply();
          if (added.length > 0) pick(added, besideElement(event.currentTarget));
        }}
      />{" "}
      {label}
    </label>
  );
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

// One obra's checkbox; ticking it offers a note beside the box.
function UnitCheckbox({
  contest,
  view,
  setView,
  label,
}: {
  contest: Contest;
  view: View;
  setView: SetView;
  label?: string;
}) {
  const pick = usePick();
  const checked = view.selected.includes(contest.id);
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(event) => {
        setView((v) => withSelected(v, toggle(v.selected, contest.id)));
        lastPicked = contest.id;
        if (!checked) pick([contest.id], besideElement(event.currentTarget));
      }}
    />
  );
}

// Where the last Shift range starts (prototype: one anchor for every list).
let lastPicked: string | null = null;

// The note button of a plain click waits out the double-click window, so it never pops up while
// the person is still double-clicking to open. A double click cancels it.
const doubleClickMs = 400;
let pendingNote: ReturnType<typeof setTimeout> | undefined;

const interactive = "td:first-child, button, input, a, label, select";

// Mouse gestures on a row or card, as in a file explorer. Click selects only it; Ctrl/⌘ + click
// toggles it; Shift + click selects the range from the anchor (Ctrl + Shift adds the range).
// Double-click opens it and leaves it selected.
function useRowGestures(
  list: Contest[],
  view: View,
  setView: SetView,
): (contest: Contest) => {
  onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onDoubleClick: (event: MouseEvent<HTMLElement>) => void;
  onContextMenu: (event: MouseEvent<HTMLElement>) => void;
} {
  const pick = usePick();
  const openMenu = useOpenMenu();
  return (contest) => {
    const id = contest.id;
    const select = (
      selected: string[],
      row: Element,
      options: { wait?: boolean; keepAnchor?: boolean } = {},
    ) => {
      const added = selected.filter((x) => !view.selected.includes(x));
      setView((v) => withSelected(v, selected));
      if (options.keepAnchor !== true) lastPicked = id;
      clearTimeout(pendingNote);
      if (added.length === 0) return;
      const at = besideElement(row);
      if (options.wait === true) pendingNote = setTimeout(() => pick(added, at), doubleClickMs);
      else pick(added, at);
    };
    const open = () => setView((v) => ({ ...v, open: id }));
    const onControl = (event: MouseEvent<HTMLElement>) =>
      !(event.target instanceof Element) || event.target.closest(interactive) !== null;
    return {
      // A double click or Shift would otherwise select text; dragging still can, for citing.
      onMouseDown: (event) => {
        if (event.detail > 1 || event.shiftKey) event.preventDefault();
      },
      onClick: (event) => {
        if (onControl(event)) return;
        const row = event.currentTarget;
        row.focus();
        const additive = event.ctrlKey || event.metaKey;
        if (event.shiftKey) {
          const ids = list.map((c) => c.id);
          const from = ids.indexOf(lastPicked ?? "");
          const to = ids.indexOf(id);
          const range = from < 0 ? [id] : ids.slice(Math.min(from, to), Math.max(from, to) + 1);
          select(additive ? [...new Set([...view.selected, ...range])] : range, row, {
            keepAnchor: from >= 0,
          });
          return;
        }
        if (additive) {
          select(toggle(view.selected, id), row);
          return;
        }
        // A drag selecting citable text must not also select the row.
        const text = window.getSelection();
        if (text && !text.isCollapsed && text.containsNode(row, true)) return;
        select([id], row, { wait: true });
      },
      // Opening leaves the obra selected, whatever the first click did.
      onDoubleClick: (event) => {
        if (onControl(event)) return;
        clearTimeout(pendingNote);
        if (!view.selected.includes(id)) setView((v) => withSelected(v, [id]));
        open();
      },
      // As in Windows: a right click on an unselected obra selects only it; on a selected one the
      // menu acts on the whole selection.
      onContextMenu: (event) => {
        event.preventDefault();
        clearTimeout(pendingNote);
        openMenu({ kind: "obras", id }, { x: event.clientX, y: event.clientY });
      },
    };
  };
}

function ContestRow({
  contest,
  view,
  setView,
  gestures,
  preview,
  place,
}: {
  contest: Contest;
  view: View;
  setView: SetView;
  gestures: ReturnType<ReturnType<typeof useRowGestures>>;
  preview: boolean;
  // Shown only when the list spans several localities.
  place?: string | undefined;
}) {
  return (
    <tr
      tabIndex={0}
      className="d-contest-row"
      data-units={contest.id}
      data-selected={view.selected.includes(contest.id)}
      data-drag-preview={preview}
      data-open={view.open === contest.id}
      {...gestures}
    >
      <td>
        <UnitCheckbox
          contest={contest}
          view={view}
          setView={setView}
          label={`Usar «${contest.title}» na conversa`}
        />
      </td>
      <td>
        <Cite source={`${contest.title} · Obra`} contest={contest.id}>
          {contest.title}
        </Cite>{" "}
        <button type="button" onClick={() => setView((v) => ({ ...v, open: contest.id }))}>
          Abrir
        </button>
        {isPriority(contest) && <small> ★ prioridade</small>}
        {place !== undefined && <small> · {place}</small>}
      </td>
      <td>
        <Cite source={`${contest.title} · Tipo`} contest={contest.id}>
          {contest.workType}
        </Cite>
      </td>
      <td>
        <Cite source={`${contest.title} · Valor anunciado`} contest={contest.id}>
          {euro.format(contest.announcedValue)}
        </Cite>
      </td>
      <td>
        <Cite source={`${contest.title} · Entrega de propostas`} contest={contest.id}>
          {contest.deadline === null ? "na plataforma" : formatDate(contest.deadline)}
        </Cite>
      </td>
    </tr>
  );
}

// The works of every picked locality together, or the ones the agent framed on the map.
export function worksToList(
  view: View,
  locs: Locality[],
): { title: string; list: Contest[]; places: number } {
  // What the agent showed replaces the table until a filter or a reset clears it.
  if (view.highlighted.length > 0) {
    const list = view.highlighted.map((id) => contestById(id));
    return {
      title: "Mostrados pelo agente",
      list,
      places: new Set(list.map((c) => c.place)).size,
    };
  }
  // Every locality filter is already applied to the shown obras.
  const list = locs.flatMap((l) => l.shown);
  const named = view.filters.localities;
  return {
    places: new Set(list.map((c) => c.place)).size,
    title: named.length > 0 ? `Obras em ${placesLabel(named)}` : "Obras",
    list,
  };
}

// A marquee starts on empty space or row padding; citable text keeps its native drag selection.
function useListDrag(view: View, setView: SetView, surface: RefObject<HTMLElement | null>) {
  const pick = usePick();
  const ask = useConfirm();
  const gesture = useRef<{
    x: number;
    y: number;
    currentX: number;
    currentY: number;
    selected: string[];
    mode: "replace" | "add" | "toggle";
    moved: boolean;
    pointerId: number;
  } | null>(null);
  const suppressClick = useRef(false);
  const scrollFrame = useRef<number | null>(null);
  const pointerY = useRef(0);
  const [rectangle, setRectangle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [preview, setPreview] = useState<string[]>([]);

  const updatePreview = () => {
    const g = gesture.current;
    if (!g?.moved) return [];
    const left = Math.min(g.x, g.currentX);
    const top = Math.min(g.y, g.currentY);
    const right = Math.max(g.x, g.currentX);
    const bottom = Math.max(g.y, g.currentY);
    const caught = [...(surface.current?.querySelectorAll<HTMLElement>(".d-contest-row") ?? [])]
      .filter((row) => {
        const r = row.getBoundingClientRect();
        return (
          r.right + window.scrollX > left &&
          r.left + window.scrollX < right &&
          r.bottom + window.scrollY > top &&
          r.top + window.scrollY < bottom
        );
      })
      .map((row) => row.dataset.units!);
    setRectangle({
      left: left - window.scrollX,
      top: top - window.scrollY,
      width: right - left,
      height: bottom - top,
    });
    setPreview(caught);
    return caught;
  };
  const cancel = () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = null;
    const g = gesture.current;
    if (g?.moved) {
      suppressClick.current = true;
      if (surface.current?.hasPointerCapture(g.pointerId))
        surface.current.releasePointerCapture(g.pointerId);
    }
    gesture.current = null;
    setRectangle(null);
    setPreview([]);
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gesture.current) {
        event.preventDefault();
        event.stopPropagation();
        cancel();
      }
    };
    document.addEventListener("keydown", key, true);
    window.addEventListener("blur", cancel);
    return () => {
      document.removeEventListener("keydown", key, true);
      window.removeEventListener("blur", cancel);
      gesture.current = null;
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  const scrollAtEdge = () => {
    const g = gesture.current;
    if (!g?.moved) return;
    const step = pointerY.current < 36 ? -12 : pointerY.current > window.innerHeight - 36 ? 12 : 0;
    if (step !== 0) {
      const before = window.scrollY;
      window.scrollBy(0, step);
      g.currentY += window.scrollY - before;
      updatePreview();
    }
    scrollFrame.current = requestAnimationFrame(scrollAtEdge);
  };

  const move = (event: ReactPointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g) return;
    g.currentX = event.pageX;
    g.currentY = event.pageY;
    pointerY.current = event.clientY;
    if (!g.moved && Math.hypot(g.currentX - g.x, g.currentY - g.y) <= 6) return;
    if (!g.moved) {
      clearTimeout(pendingNote);
      g.moved = true;
      surface.current?.setPointerCapture(event.pointerId);
      scrollFrame.current = requestAnimationFrame(scrollAtEdge);
      window.getSelection()?.removeAllRanges();
    }
    event.preventDefault();
    updatePreview();
  };
  return {
    rectangle,
    preview,
    handlers: {
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        suppressClick.current = false;
        if (event.button !== 0 || event.pointerType === "touch") return;
        if (
          !(event.target instanceof Element) ||
          event.target.closest(
            "button, input, label, select, a, thead, h2, .d-select-bar, .d-map-hint, [data-cite]",
          )
        )
          return;
        gesture.current = {
          x: event.pageX,
          y: event.pageY,
          currentX: event.pageX,
          currentY: event.pageY,
          selected: view.selected,
          mode: event.ctrlKey || event.metaKey ? "toggle" : event.shiftKey ? "add" : "replace",
          moved: false,
          pointerId: event.pointerId,
        };
      },
      onPointerMove: move,
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
        const g = gesture.current;
        if (!g) return;
        if (g.moved) {
          g.currentX = event.pageX;
          g.currentY = event.pageY;
          const caught = updatePreview();
          const selected =
            g.mode === "replace"
              ? caught
              : g.mode === "add"
                ? [...new Set([...g.selected, ...caught])]
                : [
                    ...g.selected.filter((id) => !caught.includes(id)),
                    ...caught.filter((id) => !g.selected.includes(id)),
                  ];
          const added = selected.filter((id) => !g.selected.includes(id));
          const removed = g.selected.filter((id) => !selected.includes(id));
          // A drag that only deselects, such as one over empty space, asks first when it is large.
          if (added.length === 0 && removed.length > 0)
            ask(removed.length, {
              message: `Vai desselecionar ${unitsText(0, removed.length)}.`,
              action: "Desselecionar",
              run: () => setView((v) => withSelected(v, selected)),
            });
          else setView((v) => withSelected(v, selected));
          lastPicked = caught[0] ?? lastPicked;
          if (added.length) pick(added, { x: event.clientX + 8, y: event.clientY + 8 });
          surface.current
            ?.querySelector<HTMLElement>(`[data-units="${caught[0] ?? ""}"]`)
            ?.focus({ preventScroll: true });
        }
        cancel();
      },
      onPointerCancel: cancel,
      onLostPointerCapture: () => {
        if (gesture.current) cancel();
      },
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (!suppressClick.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      },
    },
  };
}

export function LocalityResults({
  view,
  setView,
  locs,
}: {
  view: View;
  setView: SetView;
  locs: Locality[];
}) {
  const { title, list, places } = worksToList(view, locs);
  const gesturesFor = useRowGestures(list, view, setView);
  const surface = useRef<HTMLElement>(null);
  const drag = useListDrag(view, setView, surface);
  const openMenu = useOpenMenu();
  // With no obras there is nothing to select: the message is plain text.
  const selectable = list.length > 0;
  const ask = useConfirm();
  const body =
    list.length === 0 ? (
      <p>Sem obras com estes filtros.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th scope="col">
              <span className="d-sr">Conversa</span>
            </th>
            <th scope="col">Obra</th>
            <th scope="col">Tipo</th>
            <th scope="col">Valor</th>
            <th scope="col">Prazo</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <ContestRow
              key={c.id}
              contest={c}
              view={view}
              setView={setView}
              preview={drag.preview.includes(c.id)}
              gestures={gesturesFor(c)}
              place={places > 1 ? c.place : undefined}
            />
          ))}
        </tbody>
      </table>
    );
  return (
    <section
      ref={surface}
      className="d-results"
      aria-label="Obras"
      data-dragging={drag.rectangle !== null}
      {...(selectable ? drag.handlers : {})}
      // Clicking empty space in the list clears the selection, as in a file explorer.
      onClick={(event) => {
        if (!(event.target instanceof Element)) return;
        if (event.shiftKey || event.ctrlKey || event.metaKey) return;
        const text = window.getSelection();
        if (text && !text.isCollapsed && text.containsNode(event.currentTarget, true)) return;
        if (event.target.closest("tr, li, th, button, input, label, select, a, h2, [data-empty]"))
          return;
        if (view.selected.length > 0)
          ask(view.selected.length, {
            message: `Vai desselecionar ${unitsText(0, view.selected.length)}.`,
            action: "Desselecionar",
            run: () => setView((v) => withSelected(v, [])),
          });
      }}
      onContextMenu={(event) => {
        if (!(event.target instanceof Element)) return;
        if (event.target.closest("tr, li, th, button, input, label, select, a, h2, [data-empty]"))
          return;
        event.preventDefault();
        openMenu({ kind: "vazio" }, { x: event.clientX, y: event.clientY });
      }}
    >
      <h2>{title}</h2>
      {list.length > 0 && (
        <p className="d-select-bar">
          <SelectGroup
            ids={list.map((c) => c.id)}
            view={view}
            setView={setView}
            label={list.length === 1 ? "Selecionar a obra" : `Selecionar as ${list.length} obras`}
          />
          <small>
            {view.selected.length === 0
              ? "Nada selecionado"
              : `${view.selected.length} selecionadas no total`}
          </small>
        </p>
      )}
      <div className="d-work-items" data-empty={!selectable}>
        {body}
      </div>
      {list.length > 0 && (
        <p className="d-map-hint">
          Arraste no espaço vazio para selecionar obras · Shift junta · Ctrl alterna · arraste sobre
          texto para citar
        </p>
      )}
      {drag.rectangle !== null && (
        <div className="d-list-marquee" aria-hidden="true" style={drag.rectangle} />
      )}
    </section>
  );
}

export function ContestView({ id, setView }: { id: string; setView: SetView }) {
  const c = contestById(id);
  return (
    <aside className="d-contest" aria-label="Concurso">
      <h2>
        <Cite source={`${c.title} · Obra`} contest={c.id}>
          {c.title}
        </Cite>
        <button
          type="button"
          className="d-close"
          aria-label="Fechar concurso"
          onClick={() => setView((v) => ({ ...v, open: null }))}
        >
          ✕
        </button>
      </h2>
      <dl>
        <dt>Entidade adjudicante</dt>
        <dd>
          <Cite source={`${c.title} · Entidade adjudicante`} contest={c.id}>
            {c.buyer}
          </Cite>
        </dd>
        <dt>Localização</dt>
        <dd>
          <Cite source={`${c.title} · Localização`} contest={c.id}>
            {c.place} · {c.distanceKm} km da empresa
          </Cite>
        </dd>
        <dt>Valor anunciado</dt>
        <dd>
          <Cite source={`${c.title} · Valor anunciado`} contest={c.id}>
            {euro.format(c.announcedValue)}
          </Cite>
        </dd>
        <dt>Prazo de execução</dt>
        <dd>
          <Cite source={`${c.title} · Prazo de execução`} contest={c.id}>
            {c.executionDays} dias
          </Cite>
        </dd>
        <dt>Entrega de propostas</dt>
        <dd>
          <Cite source={`${c.title} · Entrega de propostas`} contest={c.id}>
            {deadlineText(c)}
          </Cite>
        </dd>
        <dt>Alvará exigido</dt>
        <dd>
          <Cite source={`${c.title} · Alvará exigido`} contest={c.id}>
            {c.requiredLicences.join(", ")} · classe {c.requiredClass}
          </Cite>
        </dd>
        <dt>Plataforma</dt>
        <dd>
          <Cite source={`${c.title} · Plataforma`} contest={c.id}>
            {c.platform}
          </Cite>
        </dd>
        <dt>Publicado a</dt>
        <dd>
          <Cite source={`${c.title} · Data de publicação`} contest={c.id}>
            {formatDate(c.publishedOn)}
          </Cite>
        </dd>
      </dl>
      <h3>Anúncio de origem (pré-visualização fictícia)</h3>
      <blockquote>
        {c.notice.map((line) => (
          <Cite as="p" key={line} source={`${c.title} · Anúncio de origem`} contest={c.id}>
            {line}
          </Cite>
        ))}
      </blockquote>
      <p>
        <small>Mostrar o alvará exigido não verifica a elegibilidade da empresa.</small>
      </p>
    </aside>
  );
}

export function CompareTable({ ids, onClose }: { ids: string[]; onClose?: () => void }) {
  const list = ids.map((id) => contestById(id));
  const rows: [string, (c: Contest) => string][] = [
    ["Localidade", (c) => `${c.place} · ${c.distanceKm} km`],
    ["Tipo", (c) => c.workType],
    ["Valor anunciado", (c) => euro.format(c.announcedValue)],
    ["Execução", (c) => `${c.executionDays} dias`],
    ["Entrega", (c) => deadlineText(c)],
    ["Alvará", (c) => `${c.requiredLicences.join(", ")} · classe ${c.requiredClass}`],
    ["Plataforma", (c) => c.platform],
  ];
  return (
    <section className="d-compare" aria-label="Comparação">
      <h2>
        Comparação
        {onClose !== undefined && (
          <button
            type="button"
            className="d-close"
            aria-label="Fechar comparação"
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </h2>
      <table>
        <thead>
          <tr>
            <th scope="col">
              <span className="d-sr">Campo</span>
            </th>
            {list.map((c) => (
              <th key={c.id} scope="col">
                <Cite source={`${c.title} · Obra`} contest={c.id}>
                  {c.title}
                </Cite>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, get]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {list.map((c) => (
                <td key={c.id}>
                  <Cite source={`${c.title} · ${label}`} contest={c.id}>
                    {get(c)}
                  </Cite>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
