import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (container === null) throw new Error("The app root element is missing.");

createRoot(container).render(<StrictMode></StrictMode>);
