import { createFileRoute } from "@tanstack/react-router";
import { getUsers } from "../../../server/application.server.js";

export const Route = createFileRoute("/api/users/")({
  server: { handlers: { GET: ({ request }) => getUsers(request) } },
});
