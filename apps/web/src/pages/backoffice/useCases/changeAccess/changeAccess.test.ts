import { expect, it, vi } from "vitest";
import { changeAccess } from "./changeAccess";

const administrator = { id: "admin", approved: true, administrator: true };

it.each([
  { ...administrator, approved: false },
  { ...administrator, administrator: false },
])("rejects unapproved or non-administrator actors before persistence: %j", async (actor) => {
  const users = { changeApproval: vi.fn() };
  await expect(changeAccess(actor, { userId: "member", approved: true }, users)).rejects.toThrow(
    "administrator-required",
  );
  expect(users.changeApproval).not.toHaveBeenCalled();
});

it("rejects self changes without writing", async () => {
  const users = { changeApproval: vi.fn() };
  await expect(
    changeAccess(administrator, { userId: "admin", approved: false }, users),
  ).rejects.toThrow("self-change");
  expect(users.changeApproval).not.toHaveBeenCalled();
});

it("reports missing users and passes approval and revocation to the injected writer", async () => {
  const users = { changeApproval: vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true) };
  await expect(
    changeAccess(administrator, { userId: "missing", approved: true }, users),
  ).rejects.toThrow("user-not-found");

  for (const approved of [true, false]) {
    await expect(
      changeAccess(administrator, { userId: "member", approved }, users),
    ).resolves.toEqual({ approved });
    expect(users.changeApproval).toHaveBeenLastCalledWith("member", approved);
  }
});
