// PROTOTYPE: what the person sees on the main screen. The agent's tools only change
// this view; they never change contest data, so every change can be undone.

import { type Contest, type WorkType, company, contestById, contests } from "./data";

export type Filters = {
  maxKm: number;
  workTypes: WorkType[];
  publishedOn: string | null;
  maxValue: number | null;
  minValue: number | null;
  buyer: string | null;
  text: string;
  // Localities that filter the obras. Empty means every locality.
  localities: string[];
};

export type View = {
  filters: Filters;
  // Contests the agent asked to show together on the map.
  highlighted: string[];
  // Localities selected on the map (not yet necessarily opened). Never together with obras.
  picked: string[];
  open: string | null;
  // Contests that form the agent's context (chosen by the person).
  selected: string[];
  compare: string[] | null;
};

export const defaultFilters: Filters = {
  maxKm: company.radiusKm,
  workTypes: [],
  publishedOn: null,
  maxValue: null,
  minValue: null,
  buyer: null,
  text: "",
  localities: [],
};

export const initialView: View = {
  filters: defaultFilters,
  highlighted: [],
  picked: [],
  open: null,
  selected: [],
  compare: null,
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function matches(filters: Filters, contest: Contest): boolean {
  return (
    (filters.localities.length === 0 || filters.localities.includes(contest.place)) &&
    contest.distanceKm <= filters.maxKm &&
    (filters.workTypes.length === 0 || filters.workTypes.includes(contest.workType)) &&
    (filters.publishedOn === null || contest.publishedOn === filters.publishedOn) &&
    (filters.maxValue === null || contest.announcedValue <= filters.maxValue) &&
    (filters.minValue === null || contest.announcedValue >= filters.minValue) &&
    (filters.buyer === null || contest.buyer === filters.buyer) &&
    (filters.text === "" ||
      normalize(`${contest.title} ${contest.place} ${contest.buyer}`).includes(
        normalize(filters.text),
      ))
  );
}

// Priority types come first; within each group the nearest deadline is first, and contests
// whose deadline is unknown come last. Priority orders and highlights; it never excludes.
export function visibleContests(view: View): Contest[] {
  return contests
    .filter((c) => matches(view.filters, c))
    .toSorted((a, b) => {
      const pa = company.priorityTypes.includes(a.workType) ? 0 : 1;
      const pb = company.priorityTypes.includes(b.workType) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return (a.deadline ?? "9").localeCompare(b.deadline ?? "9");
    });
}

export const isPriority = (contest: Contest) => company.priorityTypes.includes(contest.workType);

export function describeFilters(filters: Filters): string {
  const parts = [`até ${filters.maxKm} km`];
  if (filters.localities.length > 0) parts.push(placesLabel(filters.localities));
  if (filters.workTypes.length > 0) parts.push(filters.workTypes.join(" / "));
  if (filters.publishedOn !== null) parts.push(`publicados a ${filters.publishedOn}`);
  if (filters.minValue !== null) parts.push(`valor ≥ ${filters.minValue / 1000} mil €`);
  if (filters.maxValue !== null) parts.push(`valor ≤ ${filters.maxValue / 1000} mil €`);
  if (filters.buyer !== null) parts.push(filters.buyer);
  if (filters.text !== "") parts.push(`«${filters.text}»`);
  return parts.join(", ");
}

export const hasActiveFilters = (filters: Filters) =>
  describeFilters(filters) !== describeFilters(defaultFilters);

// The localities of some obras, in the order they first appear.
export const placesOf = (ids: string[]): string[] => [
  ...new Set(ids.map((id) => contestById(id).place)),
];

// Selecting obras also lists their localities, so the list never hides what is selected.
export const withPlaces = (localities: string[], ids: string[]): string[] => [
  ...new Set([...localities, ...placesOf(ids)]),
];

// File-explorer pick modes: a plain pick replaces the selection, Shift adds, Ctrl/⌘ toggles.
export type PickMode = "substituir" | "juntar" | "alternar";

const combine = (current: string[], ids: string[], mode: PickMode): string[] =>
  mode === "substituir"
    ? ids
    : mode === "juntar"
      ? [...new Set([...current, ...ids])]
      : [
          ...current.filter((id) => !ids.includes(id)),
          ...ids.filter((id) => !current.includes(id)),
        ];

// Obras and localities are two silos: selecting or deselecting one never touches the other.
// Selects obras; Ctrl/⌘ and Shift add to them, a plain pick replaces them.
export const withSelected = (view: View, selected: string[]): View => ({ ...view, selected });

// Selects localities on the map. Selecting never opens them, and never touches obras.
export function pickPlaces(view: View, places: string[], mode: PickMode): View {
  return { ...view, picked: combine(view.picked, places, mode) };
}

// The Localidade filter as text: no filter, one name, or a count.
export const placesLabel = (places: string[]): string =>
  places.length === 0
    ? "todas"
    : places.length === 1
      ? (places[0] ?? "")
      : `${places.length} localidades`;

export type SelectionState = "none" | "some" | "all";

export function selectionState(selected: string[], ids: string[]): SelectionState {
  const count = ids.filter((id) => selected.includes(id)).length;
  return count === 0 ? "none" : count === ids.length ? "all" : "some";
}

// Selecting a group adds every unit in it; selecting it again when all are in removes them.
// Units selected elsewhere stay, so a selection can span several lists.
export function toggleGroup(selected: string[], ids: string[]): string[] {
  return selectionState(selected, ids) === "all"
    ? selected.filter((id) => !ids.includes(id))
    : [...new Set([...selected, ...ids])];
}
