// PROTOTYPE: the map is where the person starts. Markers are localities, like folders
// in a file explorer: a click selects, a double click opens, a right click opens a menu. The agent
// can frame several contests together with a halo.

import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { type Contest, company, contests, places } from "./data";
import { useOpenMenu } from "./ContextMenu";
import { type Point as ScreenPoint, besideElement } from "./Notes";
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
import { type PickMode, type View, matches, selectionState } from "./view";

// Labels sit beside the pin, away from the crowded centre around the company.
const labelOffsets: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> =
  {
    Leiria: { dx: -10, dy: -26, anchor: "end" },
    "Marinha Grande": { dx: -4, dy: 14, anchor: "end" },
    Alcobaça: { dx: -10, dy: -14, anchor: "end" },
    Batalha: { dx: 8, dy: 14, anchor: "start" },
    Ourém: { dx: 10, dy: -4, anchor: "start" },
    Pombal: { dx: 10, dy: -10, anchor: "start" },
    Condeixa: { dx: 10, dy: -10, anchor: "start" },
  };

export type Locality = {
  place: string;
  contests: Contest[];
  shown: Contest[];
};

export function localities(view: View): Locality[] {
  return places.map((place) => {
    const inPlace = contests.filter((c) => c.place === place);
    return {
      place,
      contests: inPlace,
      shown: inPlace.filter((c) => matches(view.filters, c) || view.highlighted.includes(c.id)),
    };
  });
}

type Point = { x: number; y: number };
// File-explorer conventions: a plain drag replaces the selection, Shift adds, Ctrl/⌘ toggles.
export type DragMode = PickMode;

// A drag shorter than this is a click on a locality, not a selection.
const dragThreshold = 6;

function inside(point: Point, path: Point[]): boolean {
  const start = path[0];
  const end = path.at(-1);
  if (start === undefined || end === undefined) return false;
  return (
    point.x >= Math.min(start.x, end.x) &&
    point.x <= Math.max(start.x, end.x) &&
    point.y >= Math.min(start.y, end.y) &&
    point.y <= Math.max(start.y, end.y)
  );
}

function rectanglePath(path: Point[]): string {
  const start = path[0];
  const end = path.at(-1);
  if (start === undefined || end === undefined) return "";
  return `M${start.x},${start.y} H${end.x} V${end.y} H${start.x} Z`;
}

const modeOf = (event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }): DragMode =>
  event.ctrlKey || event.metaKey ? "alternar" : event.shiftKey ? "juntar" : "substituir";

export function MapView({
  view,
  onPickPlaces,
  onOpenPlaces,
}: {
  view: View;
  // `settled` is false for a click, which may still become a double click.
  onPickPlaces: (places: string[], mode: DragMode, at: ScreenPoint, settled: boolean) => void;
  onOpenPlaces: (places: string[]) => void;
}) {
  const openMenu = useOpenMenu();
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ path: Point[]; mode: DragMode; moved: boolean } | null>(null);
  // The click that ends a drag must not also open a locality.
  const justDragged = useRef(false);
  const locs = localities(view);

  const toMap = (event: ReactPointerEvent): Point => {
    const matrix = svgRef.current?.getScreenCTM()?.inverse();
    if (matrix === undefined) return { x: 0, y: 0 };
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
    return { x: p.x, y: p.y };
  };

  // A drag catches the localities whose pin it covers.
  const caught = (path: Point[]) =>
    locs.flatMap((loc) => {
      const first = loc.contests[0];
      if (first === undefined) return [];
      const { x, y } = positionOf(first);
      return inside({ x, y: y - 15 }, path) ? [loc.place] : [];
    });
  const preview = drag?.moved ? caught(drag.path) : [];

  // Esc cancels a drag in progress, as it does in the obras list.
  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      justDragged.current = true;
      setDrag(null);
    };
    document.addEventListener("keydown", cancel, true);
    return () => document.removeEventListener("keydown", cancel, true);
  }, [dragging]);

  return (
    <div className="map-wrap d-map">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapSize} ${mapSize}`}
        role="group"
        aria-label={`Mapa: obras num raio de ${view.filters.maxKm} km de ${company.place}. Arraste para selecionar localidades.`}
        data-dragging={drag?.moved ?? false}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          justDragged.current = false;
          setDrag({ path: [toMap(event)], mode: modeOf(event), moved: false });
        }}
        onPointerMove={(event) => {
          if (drag === null) return;
          const point = toMap(event);
          const start = drag.path[0] as Point;
          const moved =
            drag.moved || Math.hypot(point.x - start.x, point.y - start.y) > dragThreshold;
          if (moved && !drag.moved) event.currentTarget.setPointerCapture(event.pointerId);
          setDrag({ ...drag, moved, path: [...drag.path, point] });
        }}
        onPointerUp={(event) => {
          if (drag?.moved) {
            justDragged.current = true;
            onPickPlaces(
              caught(drag.path),
              drag.mode,
              { x: event.clientX + 8, y: event.clientY + 8 },
              true,
            );
          } else if (
            drag?.mode === "substituir" &&
            event.target instanceof Element &&
            event.target.closest(".d-locality") === null
          ) {
            // Like an empty click in a file explorer: nothing picked, so nothing stays selected.
            onPickPlaces([], "substituir", { x: event.clientX, y: event.clientY }, true);
          }
          setDrag(null);
        }}
        onPointerCancel={() => setDrag(null)}
        onContextMenu={(event) => {
          if (event.target instanceof Element && event.target.closest(".d-locality") !== null) {
            return;
          }
          event.preventDefault();
          openMenu({ kind: "vazio" }, { x: event.clientX, y: event.clientY });
        }}
      >
        <MapBackdrop labelTowns={["Coimbra"]} />
        <RadiusRing km={view.filters.maxKm} />
        <CompanyMarker place={company.place} label={false} />
        {locs.map((loc) => {
          const first = loc.contests[0];
          if (first === undefined) return null;
          const { x, y } = positionOf(first);
          const offset = labelOffsets[loc.place] ?? { dx: 10, dy: -10, anchor: "start" as const };
          const active = loc.shown.length > 0;
          const framed = loc.contests.some((c) => view.highlighted.includes(c.id));
          const selected = view.picked.includes(loc.place);
          const opened = view.filters.localities.includes(loc.place);
          const count = loc.shown.length;
          const picked = selectionState(
            view.selected,
            loc.contests.map((c) => c.id),
          );
          const previewed = preview.includes(loc.place);
          return (
            <g
              key={loc.place}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-label={`${loc.place}: ${count} ${count === 1 ? "obra" : "obras"}${picked === "none" ? "" : ", com obras selecionadas"}${opened ? ", aberta" : ""}`}
              data-place={loc.place}
              className="d-locality"
              data-active={active}
              data-open={opened}
              data-units={loc.contests.map((c) => c.id).join(" ")}
              // A double click would otherwise select the label's text.
              onMouseDown={(event) => {
                if (event.detail > 1) event.preventDefault();
              }}
              onClick={(event) => {
                if (justDragged.current) return;
                onPickPlaces([loc.place], modeOf(event), besideElement(event.currentTarget), false);
              }}
              onDoubleClick={() => onOpenPlaces([loc.place])}
              onContextMenu={(event) => {
                event.preventDefault();
                openMenu(
                  { kind: "localidades", place: loc.place },
                  { x: event.clientX, y: event.clientY },
                );
              }}
            >
              {previewed && (
                <circle cx={x} cy={y - 15} r="17" className="d-sel-ring" data-state="preview" />
              )}
              {picked !== "none" && (
                <circle cx={x} cy={y - 15} r="14" className="d-sel-ring" data-state={picked} />
              )}
              <MapPin
                x={x}
                y={y}
                tone={active ? "inside" : "outside"}
                selected={selected}
                highlighted={framed}
              />
              {count > 1 && (
                <g transform={`translate(${x + 8} ${y - 26})`} className="d-count">
                  <circle r="8" />
                  <text textAnchor="middle" y="4">
                    {count}
                  </text>
                </g>
              )}
              <text
                x={x + offset.dx}
                y={y + offset.dy}
                textAnchor={offset.anchor}
                className={selected ? "map-label selected" : "map-label"}
              >
                {loc.place}
              </text>
            </g>
          );
        })}
        {drag?.moved && (
          <path d={rectanglePath(drag.path)} className="d-drag-shape" data-mode={drag.mode} />
        )}
      </svg>
      <p className="d-map-hint">
        {drag?.moved
          ? `${preview.length} ${preview.length === 1 ? "localidade" : "localidades"} · ${
              drag.mode === "alternar"
                ? "alternar"
                : drag.mode === "juntar"
                  ? "juntar"
                  : "substituir"
            }`
          : "Arraste no espaço vazio para selecionar localidades · Shift junta · Ctrl alterna · duplo clique abre · clique no vazio limpa"}
      </p>
      <MapLegend
        items={[
          { icon: legendIcons.company, label: "A sua empresa" },
          { icon: legendIcons.pinInside, label: "Localidade com obras" },
          { icon: legendIcons.pinOutside, label: "Sem obras nestes filtros" },
          { icon: legendIcons.highlighted, label: "Mostrado pelo agente" },
          {
            icon: (
              <svg viewBox="0 0 26 22" aria-hidden="true">
                <circle cx="13" cy="11" r="8" className="d-sel-ring" data-state="all" />
              </svg>
            ),
            label: "Com obras selecionadas",
          },
          { icon: legendIcons.radius, label: "Raio de pesquisa" },
        ]}
      />
    </div>
  );
}

// A small, non-interactive map for the chat: the same geography, only the result pins.
export function MiniMap({ ids }: { ids: string[] }) {
  const items = contests.filter((c) => ids.includes(c.id));
  return (
    <svg
      className="d-minimap"
      viewBox={`0 0 ${mapSize} ${mapSize}`}
      role="img"
      aria-label={`Mapa pequeno com ${items.length} obras`}
    >
      <MapBackdrop />
      <CompanyMarker place={company.place} label={false} />
      {items.map((c) => {
        const { x, y } = positionOf(c);
        return <MapPin key={c.id} x={x} y={y} tone="inside" highlighted />;
      })}
    </svg>
  );
}
