// PROTOTYPE (throwaway, issue #64): five AI interaction mechanisms over the same fictional
// data, switchable via `?variant=A..L`. Lives on a throwaway branch; do not merge into main.

import { useCallback, useReducer, useState } from "react";
import "./prototype.css";
import { type Change, type ChangeSource, createInitialDb, dbReducer } from "./data";
import { StatePanel, VariantSwitcher } from "./shared";
import { TermsProvider } from "./terms";
import { VariantAgent } from "./VariantAgent";
import { VariantChatBoard } from "./VariantChatBoard";
import { VariantChatNav } from "./VariantChatNav";
import { VariantChatReview } from "./VariantChatReview";
import { VariantChatCanvas } from "./VariantChatCanvas";
import { VariantCommandBar } from "./VariantCommandBar";
import { VariantContextual } from "./VariantContextual";
import { VariantInbox } from "./VariantInbox";
import { VariantVizArcs } from "./VariantVizArcs";
import { VariantVizDashboard } from "./VariantVizDashboard";
import { VariantVizSymbols } from "./VariantVizSymbols";
import { VariantVizTable } from "./VariantVizTable";

// Ordered from visually simplest to most complex (panes, charts and encodings competing for
// attention). Keys A.. follow this order; `id` ties a variant to its term mapping.
const ordered: { id: string; name: string; Component: typeof VariantChatCanvas }[] = [
  { id: "canvas", name: "Chat + canvas", Component: VariantChatCanvas },
  { id: "command", name: "Barra de comandos", Component: VariantCommandBar },
  { id: "inbox", name: "Sugestões proativas", Component: VariantInbox },
  { id: "table", name: "Visualização · tabela interativa", Component: VariantVizTable },
  { id: "contextual", name: "IA contextual nos objetos", Component: VariantContextual },
  { id: "chatNav", name: "Chatbot central · navegação + dossier", Component: VariantChatNav },
  { id: "chatReview", name: "Chatbot central · pedidos + revisão", Component: VariantChatReview },
  { id: "agent", name: "Agente com plano", Component: VariantAgent },
  { id: "arcs", name: "Visualização · arcos município → empresa", Component: VariantVizArcs },
  { id: "symbols", name: "Visualização · mapa de símbolos", Component: VariantVizSymbols },
  { id: "chatBoard", name: "Chatbot central · pipeline + mapa", Component: VariantChatBoard },
  {
    id: "dashboard",
    name: "Visualização · painel de barras e preço",
    Component: VariantVizDashboard,
  },
];

const variants = ordered.map((v, index) => ({
  ...v,
  key: String.fromCharCode(65 + index),
}));

function variantFromUrl(): string {
  const key = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
  return variants.some((v) => v.key === key) && key !== undefined ? key : "A";
}

export function PrototypeAiInteraction() {
  const [db, dispatch] = useReducer(dbReducer, undefined, createInitialDb);
  const [variantKey, setVariantKey] = useState(variantFromUrl);
  // Remounting on reset clears each variant's local conversation, plan or inbox state.
  const [resetCount, setResetCount] = useState(0);

  const apply = useCallback((changes: Change[], source: ChangeSource) => {
    if (changes.length > 0) dispatch({ type: "apply", changes, source });
  }, []);

  const changeVariant = (key: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("variant", key);
    window.history.replaceState(null, "", `?${params.toString()}`);
    setVariantKey(key);
  };

  const variant = variants.find((v) => v.key === variantKey) ?? variants[0];
  if (variant === undefined) throw new Error("No prototype variants are defined.");
  const { Component } = variant;

  return (
    <TermsProvider>
      <div className="proto-root">
        <main className="proto-main">
          <header className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <strong>Cairn</strong>
            <span>Protótipo · mecanismos de interação com IA</span>
          </header>
          <Component key={`${variant.key}-${resetCount}`} db={db} apply={apply} />
        </main>
        <StatePanel
          db={db}
          variant={variant.key}
          variantId={variant.id}
          onReset={() => {
            dispatch({ type: "reset" });
            setResetCount((n) => n + 1);
          }}
        />
        {import.meta.env.DEV && (
          <VariantSwitcher variants={variants} current={variant.key} onChange={changeVariant} />
        )}
      </div>
    </TermsProvider>
  );
}
