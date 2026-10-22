// PROTOTYPE: the person's options for the agent, chosen in the Opções panel.

export type Settings = {
  // The agent's results also appear in the chat, not only on the map.
  resultsInChat: boolean;
  // With results in the chat, show the small map and/or the list of rows. Both can be on.
  chatMap: boolean;
  chatList: boolean;
  // How the Localidade filter is shown: a map in a popover, or a plain list of checkboxes.
  localityFilter: "mapa" | "lista";
  // Whether the agent's changes to the main screen apply at once or wait for approval.
  actions: "imediato" | "proposta";
};

export const defaultSettings: Settings = {
  resultsInChat: false,
  chatMap: false,
  chatList: true,
  localityFilter: "mapa",
  actions: "imediato",
};
