import { createFileRoute } from "@tanstack/react-router";

function notFound() {
  return Response.json(
    { error: "Not found." },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: notFound,
      POST: notFound,
      PUT: notFound,
      PATCH: notFound,
      DELETE: notFound,
    },
  },
});
