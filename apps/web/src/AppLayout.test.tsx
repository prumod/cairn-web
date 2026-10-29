// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const admin = { id: "admin", email: "admin@example.com", approved: true, administrator: true };

function stubApi(handlers: Record<string, () => Response>) {
  vi.stubGlobal("fetch", async (input: string | URL | Request) => {
    const url = new URL(input instanceof Request ? input.url : String(input), "http://localhost");
    const handler = handlers[url.pathname];

    return handler ? handler() : new Response(null, { status: 404 });
  });
}

function showLayout(client: QueryClient) {
  const root = createRootRoute({ component: AppLayout });

  const home = createRoute({
    getParentRoute: () => root,
    path: "/",
    component: () => <p>Protected content</p>,
  });

  const privacy = createRoute({
    getParentRoute: () => root,
    path: "/privacy",
    component: () => <p>Privacy policy</p>,
  });

  const router = createRouter({
    routeTree: root.addChildren([home, privacy]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

it("clears the previous identity's cache before rendering a newly checked session", async () => {
  const client = new QueryClient();
  let sessionChecks = 0;

  stubApi({
    "/api/me": () => Response.json(sessionChecks++ === 0 ? admin : { ...admin, id: "second" }),
  });

  const router = showLayout(client);

  await screen.findByRole("button", { name: "Sair" });
  client.setQueryData(["users"], [admin]);
  await router.navigate({ to: "/privacy" });
  await router.navigate({ to: "/" });

  await waitFor(() => expect(client.getQueryData(["users"])).toBeUndefined());
});

it("clears privileged cache and hides authenticated content on successful logout", async () => {
  const client = new QueryClient();

  stubApi({
    "/api/me": () => Response.json(admin),
    "/api/auth/sign-out": () => Response.json({ success: true }),
  });

  showLayout(client);

  const signOut = await screen.findByRole("button", { name: "Sair" });

  client.setQueryData(["users"], [{ email: "private@example.com" }]);
  fireEvent.click(signOut);
  await screen.findByRole("button", { name: "Entrar com Google" });

  expect(client.getQueryData(["users"])).toBeUndefined();
  expect(screen.queryByText("Protected content")).toBeNull();
});
