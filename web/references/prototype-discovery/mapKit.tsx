// PROTOTYPE: drawing pieces that make the illustrative map look like a familiar road
// map — land, sea, roads, town names, scale bar, north arrow, pins and a legend. Geography is
// schematic, not to scale beyond the shared km → px factor.

import type { ReactNode } from "react";

export const mapSize = 420;
export const kmToPx = 2.6;

export function positionOf(place: { distanceKm: number; bearingDeg: number }): {
  x: number;
  y: number;
} {
  const angle = (place.bearingDeg * Math.PI) / 180;
  return {
    x: mapSize / 2 + place.distanceKm * kmToPx * Math.sin(angle),
    y: mapSize / 2 - place.distanceKm * kmToPx * Math.cos(angle),
  };
}

const center = { x: mapSize / 2, y: mapSize / 2 };

const towns = {
  Batalha: positionOf({ distanceKm: 18, bearingDeg: 200 }),
  Alcobaça: positionOf({ distanceKm: 27, bearingDeg: 265 }),
  "Marinha Grande": positionOf({ distanceKm: 15, bearingDeg: 255 }),
  Pombal: positionOf({ distanceKm: 31, bearingDeg: 20 }),
  Condeixa: positionOf({ distanceKm: 72, bearingDeg: 35 }),
  Coimbra: positionOf({ distanceKm: 66, bearingDeg: 52 }),
  Ourém: positionOf({ distanceKm: 35, bearingDeg: 110 }),
};
type Town = keyof typeof towns;

const roads: { from: Town | "centro"; to: Town; main: boolean }[] = [
  { from: "centro", to: "Pombal", main: true },
  { from: "Pombal", to: "Condeixa", main: true },
  { from: "Condeixa", to: "Coimbra", main: true },
  { from: "centro", to: "Batalha", main: true },
  { from: "Batalha", to: "Alcobaça", main: false },
  { from: "centro", to: "Marinha Grande", main: false },
  { from: "Marinha Grande", to: "Alcobaça", main: false },
  { from: "centro", to: "Ourém", main: false },
];

const coast = "M0,0 L118,0 Q112,60 108,110 T96,200 Q90,250 84,290 T64,420 L0,420 Z";

// Background: sea, land, roads, optional town names, scale bar and north arrow.
export function MapBackdrop({ labelTowns = [] }: { labelTowns?: Town[] }) {
  const point = (name: Town | "centro") => (name === "centro" ? center : towns[name]);
  return (
    <g aria-hidden="true">
      <rect x="0" y="0" width={mapSize} height={mapSize} className="map-land" />
      <path d={coast} className="map-sea" />
      <text x="40" y="250" className="map-sea-label" transform="rotate(-80 40 250)">
        Oceano Atlântico
      </text>
      {roads.map((r) => {
        const a = point(r.from);
        const b = point(r.to);
        return (
          <g key={`${r.from}-${r.to}`} className={r.main ? "map-road main" : "map-road"}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="casing" />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="fill" />
          </g>
        );
      })}
      {labelTowns.map((name) => (
        <g key={name}>
          <circle cx={towns[name].x} cy={towns[name].y} r="3" className="map-town" />
          <text x={towns[name].x + 6} y={towns[name].y + 4} className="map-town-label">
            {name}
          </text>
        </g>
      ))}
      <g transform={`translate(16 ${mapSize - 22})`} className="map-scale">
        <rect x="0" y="0" width={10 * kmToPx} height="5" />
        <rect x={10 * kmToPx} y="0" width={10 * kmToPx} height="5" className="alt" />
        <text x="0" y="-4">
          0
        </text>
        <text x={20 * kmToPx} y="-4" textAnchor="middle">
          20 km
        </text>
      </g>
      <g transform={`translate(${mapSize - 26} 28)`} className="map-north">
        <path d="M0,-16 L7,6 L0,1 L-7,6 Z" />
        <text x="0" y="20" textAnchor="middle">
          N
        </text>
      </g>
    </g>
  );
}

// Search radius as a dashed circle with its distance written on it.
export function RadiusRing({ km, proposed = false }: { km: number; proposed?: boolean }) {
  const r = km * kmToPx;
  return (
    <g className={proposed ? "map-radius proposed" : "map-radius"}>
      <circle cx={center.x} cy={center.y} r={r} />
      <text x={center.x} y={proposed ? center.y + r + 14 : center.y - r - 4} textAnchor="middle">
        {proposed ? `raio proposto: ${km} km` : `raio de ${km} km`}
      </text>
    </g>
  );
}

// The company's own location: a small building with a label.
export function CompanyMarker({ place, label = true }: { place: string; label?: boolean }) {
  return (
    <g className="map-company" transform={`translate(${center.x} ${center.y})`}>
      <path d="M-8,8 L-8,-3 L0,-10 L8,-3 L8,8 Z" />
      <rect x="-2.5" y="2" width="5" height="6" className="door" />
      {label ? (
        <text x="11" y="16">
          A sua empresa
        </text>
      ) : null}
      <title>A sua empresa ({place})</title>
    </g>
  );
}

// Places a label on the side of a point that faces away from the crowded centre.
export function labelBeside(x: number, y: number) {
  const right = x > center.x && x < mapSize - 100;
  return {
    x: right ? x + 10 : x > center.x ? x + 7 : x - 10,
    y: y > center.y ? y + 18 : y - 10,
    textAnchor: right ? ("start" as const) : ("end" as const),
  };
}

// Teardrop pin whose tip sits on (x, y), as in common web maps.
export function MapPin({
  x,
  y,
  tone,
  selected = false,
  highlighted = false,
}: {
  x: number;
  y: number;
  tone: "inside" | "outside" | "competitor";
  selected?: boolean;
  highlighted?: boolean;
}) {
  const scale = selected ? 1.3 : 1;
  return (
    <g
      className="map-pin"
      data-tone={tone}
      data-selected={selected}
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      {highlighted && <circle cx="0" cy="-15" r="14" className="map-pin-halo" />}
      <path d="M0,0 C-1.5,-5 -8,-9 -8,-15 A8,8 0 1 1 8,-15 C8,-9 1.5,-5 0,0 Z" />
      <circle cx="0" cy="-15" r="3.2" className="map-pin-dot" />
    </g>
  );
}

// Legend shown under a map: each entry pairs a drawn symbol with its meaning.
export function MapLegend({
  items,
  after,
}: {
  items: { icon: ReactNode; label: string }[];
  after?: ReactNode;
}) {
  return (
    <div className="map-legend">
      <strong>Legenda</strong>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <svg width="26" height="22" viewBox="-13 -19 26 22" aria-hidden="true">
              {item.icon}
            </svg>
            {item.label}
          </li>
        ))}
      </ul>
      {after}
    </div>
  );
}

export const legendIcons = {
  company: (
    <g className="map-company">
      <path d="M-7,2 L-7,-7 L0,-13 L7,-7 L7,2 Z" />
    </g>
  ),
  pinInside: (
    <g className="map-pin" data-tone="inside" transform="translate(0 2) scale(0.9)">
      <path d="M0,0 C-1.5,-5 -8,-9 -8,-15 A8,8 0 1 1 8,-15 C8,-9 1.5,-5 0,0 Z" />
      <circle cx="0" cy="-15" r="3.2" className="map-pin-dot" />
    </g>
  ),
  pinOutside: (
    <g className="map-pin" data-tone="outside" transform="translate(0 2) scale(0.9)">
      <path d="M0,0 C-1.5,-5 -8,-9 -8,-15 A8,8 0 1 1 8,-15 C8,-9 1.5,-5 0,0 Z" />
      <circle cx="0" cy="-15" r="3.2" className="map-pin-dot" />
    </g>
  ),
  highlighted: <circle cx="0" cy="-8" r="9" className="map-pin-halo" />,
  radius: <circle cx="0" cy="-8" r="9" className="map-radius-icon" />,
  radiusProposed: <circle cx="0" cy="-8" r="9" className="map-radius-icon proposed" />,
};
