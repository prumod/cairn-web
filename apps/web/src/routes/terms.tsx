import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "../pages/terms/terms.page.js";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Cairn | Termos de utilização" }] }),
  component: TermsPage,
});
