import { afterAll, beforeAll, expect, test } from "vitest";
import { createTestApplication, type TestApplication } from "./testSupport.js";

let app: TestApplication;
beforeAll(async () => {
  app = await createTestApplication();
});
afterAll(async () => {
  await app?.close();
});

test("a pending user cannot retrieve company data", async () => {
  const user = await app.identity("pending@example.test");
  const response = await app.request("/api/company-profile", user.cookie);
  // result verification
  expect(response.status).toBe(403);
  expect(await response.json()).toEqual({ error: "Account awaits approval." });
  const currentUser = await app.request("/api/me", user.cookie);
  expect(currentUser.status).toBe(200);
  expect(await currentUser.json()).toEqual({
    id: user.user.id,
    email: "pending@example.test",
    approved: false,
    administrator: false,
  });
});

test("an administrator can approve a user who can then read the empty profile", async () => {
  const admin = await app.identity("admin@example.test");
  const user = await app.identity("approved@example.test");
  const response = await app.request(
    "/api/users/" + user.user.id + "/access",
    admin.cookie,
    "PUT",
    { approved: true },
  );
  // state verification
  expect(response.status).toBe(200);
  const profile = await app.request("/api/company-profile", user.cookie);
  expect(profile.status).toBe(200);
  expect(await profile.json()).toBeNull();
});
