import { createFileRoute } from "@tanstack/react-router";
import { updateUserAccess } from "../../../../server/application.server.js";

export const Route = createFileRoute("/api/users/$userId/access")({
  server: {
    handlers: {
      PUT: ({ request, params }) => updateUserAccess(request, params.userId),
    },
  },
});
