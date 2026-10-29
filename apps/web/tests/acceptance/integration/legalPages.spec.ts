import { afterAll, beforeAll, expect, test } from "vitest";
import { createTestApplication, type TestApplication } from "./testSupport.js";

let app: TestApplication;
beforeAll(async () => {
  app = await createTestApplication();
});
afterAll(async () => {
  await app?.close();
});

test.each([
  { path: "/privacy", heading: "Política de privacidade" },
  { path: "/terms", heading: "Termos de utilização" },
])("anonymous visitors can read $path as server-rendered HTML", async ({ path, heading }) => {
  const response = await fetch(app.origin + path);

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("text/html");
  expect(response.headers.get("location")).toBeNull();
  expect(await response.text()).toContain(`<h1>${heading}</h1>`);
});
