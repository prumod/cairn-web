import { afterAll, beforeAll, expect, test } from "vitest";
import { createTestApplication, type TestApplication } from "./testSupport.js";

let app: TestApplication;

beforeAll(async () => {
  app = await createTestApplication();
});

afterAll(async () => {
  await app?.close();
});

test("a pending user retains an unapproved session", async () => {
  const user = await app.identity("pending@example.test");
  const currentUser = await app.request("/api/me", user.cookie);
  expect(currentUser.status).toBe(200);
  expect(await currentUser.json()).toEqual({
    id: user.user.id,
    email: "pending@example.test",
    approved: false,
    administrator: false,
  });
});

test("the acceptance Worker never exposes production analytics configuration", async () => {
  const response = await app.request("/api/analytics-config");
  expect(response.status).toBe(200);
  expect(await response.json()).toBeNull();
});

test("an administrator can approve and revoke an existing user session", async () => {
  const admin = await app.identity("admin@example.test");
  const user = await app.identity("approved@example.test");

  const response = await app.rpc("changeAccess", admin.cookie, {
    userId: user.user.id,
    approved: true,
  });

  // state verification
  expect(response.status).toBe(200);
  expect(await (await app.request("/api/me", user.cookie)).json()).toMatchObject({
    approved: true,
  });

  const revoked = await app.rpc("changeAccess", admin.cookie, {
    userId: user.user.id,
    approved: false,
  });

  expect(revoked.status).toBe(200);
  expect(await (await app.request("/api/me", user.cookie)).json()).toMatchObject({
    approved: false,
  });
});

test("RPC rejects anonymous and non-administrator users and does not cache private responses", async () => {
  const pending = await app.identity("rpc-pending@example.test");

  for (const cookie of ["", pending.cookie]) {
    const response = await app.rpc("listUsers", cookie);
    expect(await response.text()).toContain(
      cookie ? "Administrator access required." : "Sign in required.",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
  }
});

test("RPC validates Zod input before writes and forbids self-access and cross-origin writes", async () => {
  const admin = await app.identity("admin@example.test");
  const member = await app.identity("rpc-member@example.test");

  for (const data of [
    { userId: "", approved: true },
    { userId: member.user.id, approved: "true" },
    { userId: 42, approved: true },
    { userId: member.user.id },
  ]) {
    const response = await app.rpc("changeAccess", admin.cookie, data);
    expect(await response.text()).toContain(data.userId === "" ? "too_small" : "invalid_type");
    expect(response.headers.get("cache-control")).toBe("no-store");
  }

  const self = await app.rpc("changeAccess", admin.cookie, {
    userId: admin.user.id,
    approved: false,
  });

  expect(await self.text()).toContain("You cannot change your own access.");

  const missing = await app.rpc("changeAccess", admin.cookie, {
    userId: "missing",
    approved: true,
  });

  expect(await missing.text()).toContain("User not found.");

  const foreign = await app.rpc(
    "changeAccess",
    admin.cookie,
    { userId: member.user.id, approved: true },
    "https://other.example",
  );

  expect(foreign.status).toBe(403);
  const current = await app.request("/api/me", member.cookie);
  expect(await current.json()).toMatchObject({ approved: false });
});
