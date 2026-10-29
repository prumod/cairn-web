import { createFileRoute } from "@tanstack/react-router";
import { getCurrentUser } from "../../server/application.server.js";

export const Route = createFileRoute("/api/me")({
  server: { handlers: { GET: ({ request }) => getCurrentUser(request) } },
});
