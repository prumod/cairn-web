// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { UserAccess } from "../useCases/listUsers/listUsers";
import { AccessManager } from "./accessManager";

afterEach(cleanup);

const users: UserAccess[] = [
  { id: "admin", email: "admin@example.com", approved: true, administrator: true },
  { id: "member", email: "member@example.com", approved: false, administrator: false },
];

type ChangeAccessOptions = { data: { userId: string; approved: boolean } };

function fakes() {
  return {
    listUsers: vi.fn<(options: { signal: AbortSignal }) => Promise<UserAccess[]>>(),
    changeAccess: vi.fn<(options: ChangeAccessOptions) => Promise<{ approved: boolean }>>(),
  };
}

function show({ listUsers, changeAccess }: ReturnType<typeof fakes>) {
  const client = new QueryClient();

  const view = render(
    <QueryClientProvider client={client}>
      <AccessManager listUsers={listUsers} changeAccess={changeAccess} />
    </QueryClientProvider>,
  );

  return { client, ...view };
}

it("keeps approval disabled until refetch completes, then supports revocation", async () => {
  const api = fakes();
  let finishRefetch: (value: UserAccess[]) => void = () => {};

  api.listUsers
    .mockResolvedValueOnce(users)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRefetch = resolve;
        }),
    )
    .mockResolvedValueOnce(users);

  api.changeAccess.mockResolvedValue({ approved: true });
  show(api);

  fireEvent.click(await screen.findByRole("button", { name: "Aprovar" }));
  await waitFor(() => expect(api.listUsers).toHaveBeenCalledTimes(2));

  expect(screen.getByRole("button", { name: "A guardar…" }).hasAttribute("disabled")).toBe(true);
  expect(api.changeAccess).toHaveBeenCalledWith({ data: { userId: "member", approved: true } });

  finishRefetch(users.map((user) => ({ ...user, approved: true })));

  const revoke = await screen.findByRole("button", { name: "Revogar" });

  await waitFor(() => expect(revoke.hasAttribute("disabled")).toBe(false));
  fireEvent.click(revoke);
  await screen.findByRole("button", { name: "Aprovar" });

  expect(api.changeAccess).toHaveBeenLastCalledWith({
    data: { userId: "member", approved: false },
  });
});

it("hides privileged data when refetch denies access", async () => {
  const api = fakes();

  api.listUsers.mockResolvedValueOnce(users).mockRejectedValueOnce(new Error("Forbidden"));
  api.changeAccess.mockResolvedValue({ approved: true });
  show(api);

  fireEvent.click(await screen.findByRole("button", { name: "Aprovar" }));
  await screen.findByRole("alert");

  expect(screen.queryByText("member@example.com")).toBeNull();
});

it("discards privileged users when leaving the page", async () => {
  const api = fakes();

  api.listUsers.mockResolvedValue(users);

  const { client, unmount } = show(api);

  await screen.findByText("member@example.com");
  unmount();

  await waitFor(() => expect(client.getQueryData(["users"])).toBeUndefined());
});

it("reports mutation failure and keeps the current list", async () => {
  const api = fakes();

  api.listUsers.mockResolvedValue(users);
  api.changeAccess.mockRejectedValue(new Error("Denied"));
  show(api);

  fireEvent.click(await screen.findByRole("button", { name: "Aprovar" }));
  await screen.findByRole("alert");

  expect(screen.getByText("member@example.com")).toBeTruthy();
});
