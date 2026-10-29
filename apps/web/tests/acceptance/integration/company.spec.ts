import { afterAll, beforeAll, expect, test } from "vitest";
import { createTestApplication, type TestApplication } from "./testSupport.js";

let app: TestApplication;

beforeAll(async () => {
  app = await createTestApplication();
});

afterAll(async () => {
  await app?.close();
});

test("the removed company endpoint is unavailable to anonymous, pending and approved users", async () => {
  const admin = await app.identity("admin@example.test");
  const pending = await app.identity("pending@example.test");
  const approved = await app.identity("approved@example.test");
  expect(
    (await app.rpc("changeAccess", admin.cookie, { userId: approved.user.id, approved: true }))
      .status,
  ).toBe(200);

  for (const cookie of ["", pending.cookie, approved.cookie, admin.cookie]) {
    for (const method of ["GET", "PUT"]) {
      const response = await app.request(
        "/api/company-profile",
        cookie,
        method,
        method === "PUT" ? { name: "Removed" } : undefined,
      );

      expect(response.status).toBe(404);
    }
  }
});
