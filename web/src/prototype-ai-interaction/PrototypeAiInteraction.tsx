// PROTOTYPE (throwaway, issue #64): five AI interaction mechanisms over the same fictional
// data, switchable via `?variant=A..E`. Lives on a throwaway branch; do not merge into main.

import { useCallback, useReducer, useState } from "react";
import "./prototype.css";
import { type Change, type ChangeSource, createInitialDb, dbReducer } from "./data";
import { StatePanel, type VariantInfo, VariantSwitcher } from "./shared";
import { VariantAgent } from "./VariantAgent";
import { VariantChatBoard } from "./VariantChatBoard";
import { VariantChatNav } from "./VariantChatNav";
import { VariantChatReview } from "./VariantChatReview";
import { VariantChatCanvas } from "./VariantChatCanvas";
import { VariantCommandBar } from "./VariantCommandBar";
import { VariantContextual } from "./VariantContextual";
import { VariantInbox } from "./VariantInbox";

const variants: (VariantInfo & { Component: typeof VariantChatCanvas })[] = [
  { key: "A", name: "Chat + canvas", Component: VariantChatCanvas },
  { key: "B", name: "IA contextual nos objetos", Component: VariantContextual },
  { key: "C", name: "Barra de comandos", Component: VariantCommandBar },
  { key: "D", name: "Agente com plano", Component: VariantAgent },
  { key: "E", name: "Sugestões proativas", Component: VariantInbox },
  { key: "F", name: "Chatbot central · navegação + dossier", Component: VariantChatNav },
  { key: "G", name: "Chatbot central · pedidos + revisão", Component: VariantChatReview },
  { key: "H", name: "Chatbot central · pipeline + mapa", Component: VariantChatBoard },
];

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
        onReset={() => {
          dispatch({ type: "reset" });
          setResetCount((n) => n + 1);
        }}
      />
      {import.meta.env.DEV && (
        <VariantSwitcher variants={variants} current={variant.key} onChange={changeVariant} />
      )}
    </div>
  );
}
