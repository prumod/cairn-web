import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrototypeAiInteraction } from "./prototype-ai-interaction/PrototypeAiInteraction";

const container = document.getElementById("root");
if (container === null) throw new Error("The app root element is missing.");

createRoot(container).render(
  <StrictMode>
    <PrototypeAiInteraction />
  </StrictMode>,
);
