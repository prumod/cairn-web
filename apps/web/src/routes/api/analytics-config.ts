import { createFileRoute } from "@tanstack/react-router";
import { getAnalyticsConfig } from "../../server/application.server.js";

export const Route = createFileRoute("/api/analytics-config")({
  server: { handlers: { GET: () => getAnalyticsConfig() } },
});
