import { expect, it, vi } from "vitest";
import { listUsers } from "./listUsers";

const administrator = { id: "admin", approved: true, administrator: true };

it.each([
  { ...administrator, approved: false },
  { ...administrator, administrator: false },
])("rejects unapproved or non-administrator actors before persistence: %j", (actor) => {
  const users = { listUsers: vi.fn() };
  expect(() => listUsers(actor, users)).toThrow("administrator-required");
  expect(users.listUsers).not.toHaveBeenCalled();
});

it("returns users through the injected reader", async () => {
  const records = [
    { id: "member", email: "member@example.com", approved: false, administrator: false },
  ];

  await expect(listUsers(administrator, { listUsers: async () => records })).resolves.toEqual(
    records,
  );
});
