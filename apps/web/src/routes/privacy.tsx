import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../pages/privacy/privacy.page.js";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Cairn | Política de privacidade" }] }),
  component: PrivacyPage,
});
