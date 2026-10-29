import { createHash } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { createBdd, test as base } from "playwright-bdd";

export const test = base.extend<{
  scenario: { email: string; adminPage: Page };
}>({
  scenario: async ({ browser }, use) => {
    const adminContext = await browser.newContext({ baseURL: "http://127.0.0.1:4173" });
    const adminPage = await adminContext.newPage();
    await use({ email: "", adminPage });
    await adminContext.close();
  },
});

const { Given, When, Then } = createBdd(test);

async function signIn(page: Page, identity: string) {
  const response = await page.request.post("/__test/session", {
    headers: { "x-test-identity-key": "isolated-local-browser-test" },
    data: { identity },
  });

  expect(response.ok()).toBe(true);
  const result: { userId: string; email: string } = await response.json();
  await page.goto("/");

  return result;
}

async function approve(adminPage: Page, email: string) {
  await signIn(adminPage, "admin");
  await adminPage.getByRole("link", { name: "Gerir acessos" }).click();

  const changeAccessId = createHash("sha256")
    .update(
      "src/pages/backoffice/useCases/changeAccess/changeAccess.functions.ts--changeAccess_createServerFn_handler",
    )
    .digest("hex");

  const mutationResponse = adminPage.waitForResponse(
    (response) =>
      response.url().endsWith(`/_serverFn/${changeAccessId}`) &&
      response.request().method() === "POST",
  );

  await adminPage
    .getByRole("row")
    .filter({ hasText: email })
    .getByRole("button", { name: "Aprovar", exact: true })
    .click();
  expect((await mutationResponse).ok()).toBe(true);
  await expect(
    adminPage
      .getByRole("row")
      .filter({ hasText: email })
      .getByRole("button", { name: "Revogar", exact: true }),
  ).toBeVisible();
}

Given("a user has signed in with Google", async ({ page, scenario }) => {
  scenario.email = (await signIn(page, "pending")).email;
});

Given("that user awaits approval", async ({ page }) => {
  expect(await (await page.request.get("/api/me")).json()).toMatchObject({ approved: false });
});

When("the user checks their session", async ({ page }) => {
  await page.reload();
});

Then("their account remains unapproved", async ({ page }) => {
  expect(await (await page.request.get("/api/me")).json()).toMatchObject({ approved: false });
  await expect(page.getByRole("link", { name: "Gerir acessos" })).toHaveCount(0);
});

Given("an approved user has an active session", async ({ page, scenario }) => {
  scenario.email = (await signIn(page, "editor")).email;
  await approve(scenario.adminPage, scenario.email);
  expect(await (await page.request.get("/api/me")).json()).toMatchObject({ approved: true });
});

Given("an administrator is signed in", async ({ scenario }) => {
  await expect(scenario.adminPage.getByRole("heading", { name: "Gerir acessos" })).toBeVisible();
});

When("the administrator revokes that user's access", async ({ scenario }) => {
  await scenario.adminPage
    .getByRole("row")
    .filter({ hasText: scenario.email })
    .getByRole("button", { name: "Revogar", exact: true })
    .click();
  await expect(
    scenario.adminPage
      .getByRole("row")
      .filter({ hasText: scenario.email })
      .getByRole("button", { name: "Aprovar", exact: true }),
  ).toBeVisible();
});

Then("their existing session reports that approval was revoked", async ({ page }) => {
  expect(await (await page.request.get("/api/me")).json()).toMatchObject({ approved: false });
});

Given("a signed-in user has been approved by the administrator", async ({ page, scenario }) => {
  scenario.email = (await signIn(page, "editor")).email;
  await approve(scenario.adminPage, scenario.email);
});

When("the user opens the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});

Then("no company profile editor is available", async ({ page }) => {
  await expect(page.getByRole("textbox", { name: "Nome da empresa" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Guardar perfil" })).toHaveCount(0);
});

Then("the former company endpoint is unavailable", async ({ page }) => {
  expect((await page.request.get("/api/company-profile")).status()).toBe(404);
});
