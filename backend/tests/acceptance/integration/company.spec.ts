import { afterAll, beforeAll, expect, test } from "vitest";
import { createTestApplication, type TestApplication } from "./testSupport.js";

let app: TestApplication;
beforeAll(async () => {
  app = await createTestApplication();
});
afterAll(async () => {
  await app?.close();
});

test("an approved user saves and retrieves the shared company profile", async () => {
  const admin = await app.identity("admin@example.test");
  const user = await app.identity("editor@example.test");
  const approval = await app.request(
    "/api/users/" + user.user.id + "/access",
    admin.cookie,
    "PUT",
    { approved: true },
  );
  expect(approval.status).toBe(200);
  const profile = { name: "Example Company", address: "Rua do Comércio, Porto", radiusKm: 25 };
  const saved = await app.request("/api/company-profile", user.cookie, "PUT", profile);
  // state verification
  expect(saved.status).toBe(200);
  const response = await app.request("/api/company-profile", user.cookie);
  expect(await response.json()).toEqual(profile);
});
