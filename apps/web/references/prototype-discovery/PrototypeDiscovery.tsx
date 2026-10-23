// PROTOTYPE: discovering works from the map, with an AI agent that has tools.

import { useCallback, useEffect, useRef, useState } from "react";
import "./discovery.css";
import { ChatPanel, useAgentChat } from "./Chat";
import { type Citation, SelectionWatcher } from "./Citations";
import {
  type Anchor,
  InlineNote,
  PickProvider,
  type Point,
  type UnitNote,
  besideElement,
} from "./Notes";
import {
  ConfirmDialog,
  type ConfirmRequest,
  ConfirmProvider,
  confirmThresholds,
  unitsText,
} from "./Confirm";
import { ContextMenu, type MenuItem, MenuProvider, type MenuTarget } from "./ContextMenu";
import { places as allPlaces } from "./data";
import { MapView, localities } from "./MapView";
import { OptionsPanel } from "./Options";
import {
  CompareTable,
  ContestView,
  FilterBar,
  LocalityChecks,
  LocalityResults,
  Profile,
  worksToList,
} from "./Panels";
import { type Settings, defaultSettings } from "./settings";
import {
  type PickMode,
  type View,
  defaultFilters,
  hasActiveFilters,
  initialView,
  pickPlaces,
  placesLabel,
  withPlaces,
  withSelected,
} from "./view";

// The Comparison fits at most this many obras side by side.
const maxCompare = 4;
// A click on a locality waits this long for a possible double click before offering a note.
const doubleClickMs = 400;

export function PrototypeDiscovery() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  // Remounting the screen on reset clears the view and the conversation; the options stay.
  const [resetCount, setResetCount] = useState(0);
  return (
    <Screen
      key={resetCount}
      settings={settings}
      onSettings={setSettings}
      onReset={() => setResetCount((n) => n + 1)}
    />
  );
}

function Screen({
  settings,
  onSettings,
  onReset,
}: {
  settings: Settings;
  onSettings: (next: Settings) => void;
  onReset: () => void;
}) {
  // The Localidade popover is open while its map picks are a draft, not yet a filter.
  const [mapOpen, setMapOpen] = useState(false);
  const [view, setViewState] = useState<View>(initialView);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [unitNotes, setUnitNotes] = useState<UnitNote[]>([]);
  // Actions that discard many units wait for the person to confirm.
  const [confirming, setConfirming] = useState<ConfirmRequest | null>(null);
  const ask = useCallback((units: number, request: ConfirmRequest) => {
    if (units >= confirmThresholds[request.effort ?? "selecao"]) setConfirming(request);
    else request.run();
  }, []);
  const setView = useCallback((update: (view: View) => View) => {
    setViewState((current) => {
      const next = update(current);
      const listed = worksToList(next, localities(next)).list;
      const selected = next.selected.filter((id) => listed.some((contest) => contest.id === id));
      return selected.length === next.selected.length ? next : { ...next, selected };
    });
  }, []);

  // The note button offered by the latest selection, and whether its form is open.
  const [anchor, setAnchor] = useState<(Anchor & { key: number; startEditing: boolean }) | null>(
    null,
  );
  const anchorKey = useRef(0);
  const keyboardAnchor = useRef<string | null>(null);
  const editing = useRef(false);
  const offer = useCallback((next: Anchor, startEditing = false) => {
    editing.current = startEditing;
    anchorKey.current += 1;
    setAnchor({ ...next, key: anchorKey.current, startEditing });
  }, []);
  const closeNote = useCallback(() => {
    editing.current = false;
    setAnchor(null);
  }, []);
  const pick = useCallback(
    (ids: string[], at: Point) => offer({ kind: "obras", ids, ...at }),
    [offer],
  );
  const onTextSelected = useCallback(
    (citation: Omit<Citation, "note">, at: Point) => offer({ kind: "citacao", citation, ...at }),
    [offer],
  );
  // A collapsed text selection removes only an unopened citation button.
  const onTextCleared = useCallback(() => {
    if (!editing.current) setAnchor((a) => (a?.kind === "citacao" ? null : a));
  }, []);

  const saveNote = (current: Anchor, note: string) => {
    if (current.kind === "citacao") {
      const citation = { ...current.citation, note };
      // Citing the same text again updates its note instead of adding a duplicate.
      const same = (c: Citation) => c.text === citation.text && c.source === citation.source;
      setCitations((list) =>
        list.some(same) ? list.map((c) => (same(c) ? citation : c)) : [...list, citation],
      );
    } else {
      // Saving stages the obras even without words; the note can be written later in the chat.
      const units =
        current.kind === "localidades"
          ? { places: current.places, obras: current.obras }
          : { places: [], obras: current.ids };
      setUnitNotes((list) => [...list, { ids: current.ids, ...units, note }]);
      // What the comment is about is no longer selected.
      setView((v) => ({
        ...v,
        picked: v.picked.filter((place) => !units.places.includes(place)),
        selected: v.selected.filter((id) => !units.obras.includes(id)),
      }));
    }
    closeNote();
  };

  // Taking a comment back selects again what it was about, and lists the obras it named.
  const uncomment = (index: number) => {
    const note = unitNotes[index];
    if (note === undefined) return;
    ask(note.places.length + note.obras.length, {
      effort: note.note.trim() === "" ? "comentario" : "escrito",
      message: `Vai retirar o comentário sobre ${unitsText(note.places.length, note.obras.length)} e voltar a selecioná-las. O texto do comentário perde-se.`,
      action: "Descomentar",
      run: () => {
        setUnitNotes((list) => list.filter((_, i) => i !== index));
        setView((v) => ({
          ...v,
          filters: {
            ...v.filters,
            localities: withPlaces(v.filters.localities, note.obras),
          },
          picked: [...new Set([...v.picked, ...note.places])],
          selected: [...new Set([...v.selected, ...note.obras])],
        }));
      },
    });
  };
  const removeNote = (index: number) => {
    const note = unitNotes[index];
    if (note === undefined) return;
    ask(note.places.length + note.obras.length, {
      effort: note.note.trim() === "" ? "comentario" : "escrito",
      message: `Vai apagar o comentário sobre ${unitsText(note.places.length, note.obras.length)}.`,
      action: "Apagar",
      run: () => setUnitNotes((list) => list.filter((_, i) => i !== index)),
    });
  };

  const locs = localities(view);
  const shownIds = (places: string[]) =>
    places.flatMap((p) =>
      locs.filter((l) => l.place === p).flatMap((l) => l.shown.map((c) => c.id)),
    );

  // What a comment is about: the selected obras, and the obras of the picked localities too.
  // Localities alone make a locality note; obras alone make an obra note.
  const unitsAnchor = (v: View, at: Point): Anchor => {
    const ids = [...new Set([...v.selected, ...shownIds(v.picked)])];
    return v.picked.length > 0
      ? { kind: "localidades", places: v.picked, obras: v.selected, ids, ...at }
      : { kind: "obras", ids, ...at };
  };

  const placeNote = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onPickPlaces = (places: string[], mode: PickMode, at: Point, settled: boolean) => {
    clearTimeout(placeNote.current);
    const after = pickPlaces(view, places, mode);
    if (after.picked.length === 0 && view.picked.length > 0) {
      ask(view.picked.length, {
        message: `Vai desselecionar ${unitsText(view.picked.length, 0)}.`,
        action: "Desselecionar",
        run: () => setView((v) => pickPlaces(v, places, mode)),
      });
      return;
    }
    setView((v) => pickPlaces(v, places, mode));
    // A pick that added a locality offers a note button; the list opens only when asked.
    if (!after.picked.some((p) => !view.picked.includes(p))) return;
    const note = () => offer(unitsAnchor(after, at));
    if (settled) note();
    else placeNote.current = setTimeout(note, doubleClickMs);
  };
  // The Localidade popover: its picks are a draft that starts from the current filter. Apply makes
  // them the filter; Cancelar, Escape or a click outside discards them.
  // The draft starts from the current filter; the list starts from every locality when none is set.
  // The map shows every locality, so picking one never shows 0 for the others.
  const mapView: View = { ...view, filters: { ...view.filters, localities: [] } };
  const openMap = () => {
    setView((v) => ({
      ...v,
      picked:
        settings.localityFilter === "lista" && v.filters.localities.length === 0
          ? allPlaces
          : v.filters.localities,
    }));
    setMapOpen(true);
  };
  const cancelMap = () => {
    clearTimeout(placeNote.current);
    setView((v) => ({ ...v, picked: [] }));
    setMapOpen(false);
  };
  const applyPlaces = () => {
    clearTimeout(placeNote.current);
    // Every locality picked is the same as no locality filter.
    setView((v) => ({
      ...v,
      filters: {
        ...v.filters,
        localities: v.picked.length === allPlaces.length ? [] : v.picked,
      },
      picked: [],
      open: null,
    }));
    setMapOpen(false);
  };
  // A double click on a locality filters to it at once.
  const onOpenPlaces = (places: string[]) => {
    clearTimeout(placeNote.current);
    setView((v) => ({
      ...v,
      filters: { ...v.filters, localities: places },
      picked: [],
      open: null,
    }));
    setMapOpen(false);
  };
  // Changing the Localidade option ends a draft that is still open.
  useEffect(() => {
    cancelMap();
  }, [settings.localityFilter]);
  // A click outside the popover is Cancelar. Its own controls, its menu, notes and dialogs do not count.
  useEffect(() => {
    if (!mapOpen) return;
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest(".d-locality-anchor, .d-context-menu, .d-inline-note, .d-confirm"))
        return;
      cancelMap();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  });

  // Activating obras never opens the separately selected localities.
  const activateWorks = (v: View): View => {
    if (v.selected.length === 1) return { ...v, open: v.selected[0] ?? null };
    if (v.selected.length > 1 && v.selected.length <= maxCompare)
      return { ...v, compare: v.selected };
    return v;
  };

  // The right-click menu. As in Windows, a right click on something unselected selects only that;
  // on something selected it keeps the selection and the menu acts on all of it.
  const [menu, setMenu] = useState<{ kind: MenuTarget["kind"]; at: Point } | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);
  const openMenu = (target: MenuTarget, at: Point) => {
    clearTimeout(placeNote.current);
    closeNote();
    if (target.kind === "obras" && !view.selected.includes(target.id)) {
      setView((v) => withSelected(v, [target.id]));
    } else if (target.kind === "localidades" && !view.picked.includes(target.place)) {
      setView((v) => pickPlaces(v, [target.place], "substituir"));
    }
    // A right click on empty space changes no selection. With localities selected, the menu offers
    // what can be done with them.
    const keepsLocalities = target.kind === "vazio" && view.picked.length > 0;
    setMenu({ kind: keepsLocalities ? "localidades" : target.kind, at });
  };
  // One reset for every filter, the locality filter and the agent's results included.
  const resetFilters = () =>
    setView((v) => ({ ...v, filters: defaultFilters, highlighted: [], compare: null }));
  const menuItems = (kind: MenuTarget["kind"], at: Point): MenuItem[] => {
    if (kind === "localidades") {
      return [
        {
          label: "Filtrar obras por estas localidades",
          shortcut: "Enter",
          onSelect: applyPlaces,
        },
        {
          label: "Comentar",
          onSelect: () => offer(unitsAnchor(view, at), true),
        },
      ];
    }
    if (kind === "obras") {
      const ids = view.selected;
      return [
        ids.length === 1
          ? { label: "Abrir", shortcut: "Enter", onSelect: () => setView(activateWorks) }
          : {
              label: ids.length > maxCompare ? `Comparar (máx. ${maxCompare})` : "Comparar",
              shortcut: "Enter",
              disabled: ids.length > maxCompare,
              onSelect: () => setView(activateWorks),
            },
        "separator",
        { label: "Comentar", onSelect: () => offer({ kind: "obras", ids, ...at }, true) },
        {
          label: "Limpar seleção",
          onSelect: () =>
            ask(ids.length, {
              message: `Vai desselecionar ${unitsText(0, ids.length)}.`,
              action: "Desselecionar",
              run: () => setView((v) => withSelected(v, [])),
            }),
        },
      ];
    }
    const listed = worksToList(view, locs).list.map((c) => c.id);
    return [
      {
        label: "Selecionar todas as obras da lista",
        disabled: listed.length === 0,
        onSelect: () => setView((v) => withSelected(v, listed)),
      },
      {
        label: "Limpar filtros",
        disabled: !hasActiveFilters(view.filters) && view.highlighted.length === 0,
        onSelect: () => resetFilters(),
      },
    ];
  };
  // Ctrl/⌘+A selects every locality or every listed obra, in the area last used. Focus is often
  // on the page itself after a click on empty space, so the area is remembered, not just focused.
  const lastArea = useRef<"mapa" | "lista" | null>(null);
  useEffect(() => {
    const remember = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      lastArea.current = event.target.closest(".d-map")
        ? "mapa"
        : event.target.closest(".d-results")
          ? "lista"
          : null;
    };
    document.addEventListener("pointerdown", remember, true);
    document.addEventListener("focusin", remember, true);
    return () => {
      document.removeEventListener("pointerdown", remember, true);
      document.removeEventListener("focusin", remember, true);
    };
  }, []);
  useEffect(() => {
    const onSelectAll = (event: KeyboardEvent) => {
      if (event.defaultPrevented || menu !== null || confirming !== null) return;
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return;
      if (event.key.toLowerCase() !== "a") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      const onPage = target === document.body || target === document.documentElement;
      const area = target.closest(".d-map")
        ? "mapa"
        : target.closest(".d-results")
          ? "lista"
          : onPage
            ? lastArea.current
            : null;
      if (area === "mapa") {
        event.preventDefault();
        const at = besideElement(document.querySelector(".d-map") ?? target);
        onPickPlaces(
          locs.map((l) => l.place),
          "substituir",
          at,
          true,
        );
      } else if (area === "lista") {
        const ids = worksToList(view, locs).list.map((c) => c.id);
        if (ids.length === 0) return;
        event.preventDefault();
        setView((v) => withSelected(v, ids));
        const added = ids.filter((id) => !view.selected.includes(id));
        if (added.length)
          pick(added, besideElement(document.querySelector(".d-results") ?? target));
      }
    };
    document.addEventListener("keydown", onSelectAll);
    return () => document.removeEventListener("keydown", onSelectAll);
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || menu !== null) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (event.key === "Escape" && anchor !== null) {
        event.preventDefault();
        closeNote();
        return;
      }
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      const map = target.closest(".d-map");
      const results = target.closest(".d-results");
      if (map === null && results === null) return;
      if (event.key === "Escape" && map !== null) {
        event.preventDefault();
        cancelMap();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        const count = map ? view.picked.length : view.selected.length;
        ask(count, {
          message: `Vai desselecionar ${map ? unitsText(count, 0) : unitsText(0, count)}.`,
          action: "Desselecionar",
          run: () => setView((v) => (map ? { ...v, picked: [] } : withSelected(v, []))),
        });
        return;
      }
      if (target.closest("button, a")) return;
      const modified = event.ctrlKey || event.metaKey;
      const pin = target.closest<SVGGElement>(".d-locality");
      const row = target.closest<HTMLElement>(".d-contest-row");
      const at = besideElement(pin ?? row ?? target);
      if ((event.shiftKey && event.key === "F10") || event.key === "ContextMenu") {
        event.preventDefault();
        if (pin?.dataset.place) openMenu({ kind: "localidades", place: pin.dataset.place }, at);
        else if (row?.dataset.units) openMenu({ kind: "obras", id: row.dataset.units }, at);
        return;
      }
      if (map !== null) {
        const place = pin?.dataset.place;
        if (event.key === " " && place) {
          event.preventDefault();
          onPickPlaces([place], "alternar", at, true);
        } else if (event.key === "Enter" && place) {
          event.preventDefault();
          onOpenPlaces(view.picked.length ? view.picked : [place]);
        }
        return;
      }
      const rows = [...results!.querySelectorAll<HTMLElement>(".d-contest-row")];
      const ids = rows.map((r) => r.dataset.units!);
      const index = rows.indexOf(row!);
      const select = (selected: string[]) => {
        setView((v) => withSelected(v, selected));
        const added = selected.filter((id) => !view.selected.includes(id));
        if (added.length) pick(added, at);
      };
      if (row && event.key === " ") {
        event.preventDefault();
        const id = ids[index]!;
        keyboardAnchor.current = id;
        select(
          view.selected.includes(id)
            ? view.selected.filter((x) => x !== id)
            : [...view.selected, id],
        );
      } else if (row && event.key === "Enter") {
        event.preventDefault();
        const selected = view.selected.length ? view.selected : [ids[index]!];
        if (selected.length === 1) setView((v) => ({ ...v, open: selected[0]! }));
        else if (selected.length <= maxCompare) setView((v) => ({ ...v, compare: selected }));
      } else if (row && ["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? ids.length - 1
              : Math.max(0, Math.min(ids.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)));
        rows[next]?.focus();
        rows[next]?.scrollIntoView({ block: "nearest" });
        if (modified && !event.shiftKey) return;
        if (event.shiftKey) {
          let from = ids.indexOf(keyboardAnchor.current ?? "");
          if (from < 0) {
            from = index;
            keyboardAnchor.current = ids[index]!;
          }
          const range = ids.slice(Math.min(from, next), Math.max(from, next) + 1);
          select(modified ? [...new Set([...view.selected, ...range])] : range);
        } else {
          keyboardAnchor.current = ids[next]!;
          select([ids[next]!]);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const chat = useAgentChat(view, setView, settings);

  const chatPanel = (
    <ChatPanel
      chat={chat}
      settings={settings}
      onOpen={(id) => setView((v) => ({ ...v, open: id }))}
      citations={citations}
      onRemoveCitation={(index) => setCitations((list) => list.filter((_, i) => i !== index))}
      onNoteCitation={(index, note) =>
        setCitations((list) => list.map((c, i) => (i === index ? { ...c, note } : c)))
      }
      onClearCitations={() => setCitations([])}
      unitNotes={unitNotes}
      onUncommentUnitNote={uncomment}
      onRemoveUnitNote={removeNote}
      onNoteUnitNote={(index, note) =>
        setUnitNotes((list) => list.map((n, i) => (i === index ? { ...n, note } : n)))
      }
      onClearUnitNotes={() => setUnitNotes([])}
    />
  );

  return (
    <PickProvider value={pick}>
      <MenuProvider value={openMenu}>
        <ConfirmProvider value={ask}>
          <div className="d-root">
            <header className="d-brand">
              <span className="d-brand-mark" aria-hidden="true" />
              <strong>Cairn</strong>
              <span>Protótipo · descoberta de obras</span>
              <OptionsPanel settings={settings} onChange={onSettings} />
              <button type="button" className="d-reset" onClick={onReset}>
                Reiniciar demonstração
              </button>
            </header>
            <p className="d-demo">
              <strong>Demonstração.</strong> Dados fictícios; o agente é simulado; nada é enviado.
            </p>
            <div className="d-body">
              <main className="d-main">
                <Profile />
                <div className="d-filter-row">
                  <div className="d-locality-anchor">
                    <button
                      type="button"
                      className="d-locality-button"
                      aria-expanded={mapOpen}
                      onClick={() => (mapOpen ? cancelMap() : openMap())}
                    >
                      Localidade · {placesLabel(view.filters.localities)} ▾
                    </button>
                    {mapOpen && (
                      <div
                        className="d-locality-popover"
                        role="dialog"
                        aria-label="Filtrar por localidade"
                        onKeyDown={(event) => {
                          if (event.key === "Escape") cancelMap();
                        }}
                      >
                        <strong>Localidade</strong>
                        {settings.localityFilter === "lista" ? (
                          <LocalityChecks
                            checked={view.picked}
                            onChange={(next) => setView((v) => ({ ...v, picked: next }))}
                          />
                        ) : (
                          <MapView
                            view={mapView}
                            onPickPlaces={onPickPlaces}
                            onOpenPlaces={onOpenPlaces}
                          />
                        )}
                        <div className="d-locality-foot">
                          <button type="button" onClick={cancelMap}>
                            Cancelar
                          </button>
                          <button type="button" className="primary" onClick={applyPlaces}>
                            Aplicar · {placesLabel(view.picked)}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <FilterBar view={view} setView={setView} />
                </div>
                <p className="d-selection-bar" role="status">
                  {view.picked.length + view.selected.length === 0 ? (
                    <small>Nada selecionado</small>
                  ) : (
                    <>
                      <strong>
                        {[
                          view.picked.length > 0 &&
                            `${view.picked.length} ${view.picked.length === 1 ? "localidade" : "localidades"}`,
                          view.selected.length > 0 &&
                            `${view.selected.length} ${view.selected.length === 1 ? "obra" : "obras"}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </strong>
                      {view.picked.length > 0 && (
                        <button type="button" onClick={applyPlaces}>
                          Filtrar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) =>
                          offer(unitsAnchor(view, besideElement(event.currentTarget)), true)
                        }
                      >
                        ✎ Comentar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          ask(view.picked.length + view.selected.length, {
                            message: `Vai desselecionar ${unitsText(view.picked.length, view.selected.length)}.`,
                            action: "Desselecionar tudo",
                            run: () => setView((v) => ({ ...withSelected(v, []), picked: [] })),
                          })
                        }
                      >
                        Desselecionar tudo
                      </button>
                    </>
                  )}
                </p>
                <div className="d-stage">
                  <LocalityResults view={view} setView={setView} locs={locs} />
                  {view.open !== null && <ContestView id={view.open} setView={setView} />}
                </div>
                {view.compare !== null && (
                  <CompareTable
                    ids={view.compare}
                    onClose={() => setView((v) => ({ ...v, compare: null }))}
                  />
                )}
              </main>
              <div className="d-chat-slot">{chatPanel}</div>
            </div>
            <SelectionWatcher onSelect={onTextSelected} onClear={onTextCleared} />
            {anchor !== null && (
              <InlineNote
                key={anchor.key}
                anchor={anchor}
                startEditing={anchor.startEditing}
                onEditing={() => {
                  editing.current = true;
                }}
                onSave={(note) => saveNote(anchor, note)}
                onClose={closeNote}
              />
            )}
            {menu !== null && (
              <ContextMenu at={menu.at} items={menuItems(menu.kind, menu.at)} onClose={closeMenu} />
            )}
            {confirming !== null && (
              <ConfirmDialog request={confirming} onClose={() => setConfirming(null)} />
            )}
          </div>
        </ConfirmProvider>
      </MenuProvider>
    </PickProvider>
  );
}
