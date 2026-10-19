import { createFileRoute } from "@tanstack/react-router";
import { getCompanyProfileRoute, updateCompanyProfile } from "../../server/application.server.js";

export const Route = createFileRoute("/api/company-profile")({
  server: {
    handlers: {
      GET: ({ request }) => getCompanyProfileRoute(request),
      PUT: ({ request }) => updateCompanyProfile(request),
    },
  },
});
