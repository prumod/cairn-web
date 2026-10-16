import { createFileRoute } from "@tanstack/react-router";
import { getHealth } from "../server/application.server.js";

export const Route = createFileRoute("/healthz")({
  server: { handlers: { GET: () => getHealth() } },
});
