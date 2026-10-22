// PROTOTYPE: the person's options for the agent, chosen in the Opções panel.

export type Settings = {
  // The agent's results also appear in the chat, not only on the map.
  resultsInChat: boolean;
  // Whether the agent's changes to the main screen apply at once or wait for approval.
  actions: "imediato" | "proposta";
};

export const defaultSettings: Settings = { resultsInChat: false, actions: "imediato" };
