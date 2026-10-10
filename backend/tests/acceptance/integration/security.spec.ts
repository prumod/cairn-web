import { afterEach, beforeEach, expect, test } from "vitest";
import { createTestApplication, type TestApplication } from "./testSupport.js";

let app: TestApplication;
beforeEach(async () => {
  app = await createTestApplication();
});
afterEach(async () => {
  await app?.close();
});

test("cookie-authenticated writes reject another origin without changing data", async () => {
  const admin = await app.identity("admin@example.test");
  const profile = { name: "Original company", address: "Porto", radiusKm: 25 };
  await app.request("/api/company-profile", admin.cookie, "PUT", profile);
  const response = await app.request(
    "/api/company-profile",
    admin.cookie,
    "PUT",
    { ...profile, name: "Unwanted edit" },
    "https://other.example",
  );
  // state verification
  expect(response.status).toBe(403);
  expect(await (await app.request("/api/company-profile", admin.cookie)).json()).toEqual(profile);
});

test.each([
  { verified: false, google: true },
  { verified: true, google: false },
])("bootstrap requires a verified Google identity: %j", async ({ verified, google }) => {
  const identity = await app.identity("admin@example.test", verified, google);
  const response = await app.request("/api/me", identity.cookie);
  // result verification
  expect(await response.json()).toMatchObject({ administrator: false, approved: false });
  expect((await app.request("/api/users", identity.cookie)).status).toBe(403);
});

test("ordinary users cannot grant approval, even with client-supplied roles", async () => {
  const admin = await app.identity("admin@example.test");
  const ordinary = await app.identity("ordinary@example.test");
  const target = await app.identity("target@example.test");
  await app.request("/api/users/" + ordinary.user.id + "/access", admin.cookie, "PUT", {
    approved: true,
  });
  const response = await app.request(
    "/api/users/" + target.user.id + "/access",
    ordinary.cookie,
    "PUT",
    { approved: true, administrator: true },
  );
  // state verification
  expect(response.status).toBe(403);
  expect((await app.request("/api/users", ordinary.cookie)).status).toBe(403);
  expect((await app.request("/api/company-profile", target.cookie)).status).toBe(403);
});

test("pending users cannot overwrite company data", async () => {
  const admin = await app.identity("admin@example.test");
  const pending = await app.identity("pending@example.test");
  const profile = { name: "Original", address: "Porto", radiusKm: 25 };
  await app.request("/api/company-profile", admin.cookie, "PUT", profile);
  const response = await app.request("/api/company-profile", pending.cookie, "PUT", {
    ...profile,
    name: "Blocked",
  });
  // state verification
  expect(response.status).toBe(403);
  expect(await (await app.request("/api/company-profile", admin.cookie)).json()).toEqual(profile);
});

test("anonymous users cannot read, edit, or administer company data", async () => {
  // result verification
  expect((await app.request("/api/company-profile")).status).toBe(401);
  expect((await app.request("/api/company-profile", "", "PUT", {})).status).toBe(401);
  expect((await app.request("/api/users")).status).toBe(401);
  expect(
    (await app.request("/api/users/unknown/access", "", "PUT", { approved: true })).status,
  ).toBe(401);
});

test("production application has no controlled-identity endpoint", async () => {
  // result verification
  expect((await app.request("/__test/session", "", "POST", { identity: "admin" })).status).toBe(
    404,
  );
});

test.each([
  { name: "", address: "Porto", radiusKm: 25 },
  { name: "Example", address: "  ", radiusKm: 25 },
  { name: "Example", address: "Porto", radiusKm: 0 },
  { name: "Example", address: "Porto", radiusKm: -1 },
  { name: "Example", address: "Porto", radiusKm: "25" },
  { name: "Example", address: "Porto", radiusKm: null },
  { name: null, address: "Porto", radiusKm: 25 },
  {},
])("invalid profile is rejected without overwriting stored values: %j", async (invalid) => {
  const admin = await app.identity("admin@example.test");
  const profile = { name: "Original", address: "Porto", radiusKm: 25 };
  await app.request("/api/company-profile", admin.cookie, "PUT", profile);
  const response = await app.request("/api/company-profile", admin.cookie, "PUT", invalid);
  // state verification
  expect(response.status).toBe(400);
  expect(await (await app.request("/api/company-profile", admin.cookie)).json()).toEqual(profile);
});
