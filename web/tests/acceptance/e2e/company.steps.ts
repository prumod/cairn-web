import { expect, type Page } from "@playwright/test";
import { createBdd, test as base, type DataTable } from "playwright-bdd";

type Profile = { name: string; address: string; radiusKm: number };
export const test = base.extend<{
  scenario: { email: string; adminPage: Page; profile?: Profile };
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
  await adminPage
    .getByRole("row")
    .filter({ hasText: email })
    .getByRole("button", { name: "Aprovar", exact: true })
    .click();
}

Given("a user has signed in with Google", async ({ page, scenario }) => {
  scenario.email = (await signIn(page, "pending")).email;
});
Given("that user awaits approval", async ({ page }) => {
  expect((await page.request.get("/api/company-profile")).status()).toBe(403);
});
When("the user requests the company profile", async ({ page }) => {
  await page.goto("/");
});
Then("access is denied", async ({ page }) => {
  // result verification
  expect((await page.request.get("/api/company-profile")).status()).toBe(403);
  await expect(page.getByRole("textbox", { name: "Nome da empresa" })).toHaveCount(0);
});
Then("the user sees that their account awaits approval", async ({ page }) => {
  await expect(page.getByText("A sua conta aguarda aprovação.")).toBeVisible();
});
Given("an approved user has an active session", async ({ page, scenario }) => {
  scenario.email = (await signIn(page, "editor")).email;
  await approve(scenario.adminPage, scenario.email);
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Nome da empresa" })).toBeVisible();
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
Then("further company profile reads and edits are denied", async ({ page }) => {
  // result verification
  expect((await page.request.get("/api/company-profile")).status()).toBe(403);
  expect(
    (
      await page.request.put("/api/company-profile", {
        headers: {
          origin: "http://127.0.0.1:4173",
        },
        data: { name: "Blocked", address: "Porto", radiusKm: 25 },
      })
    ).status(),
  ).toBe(403);
});
Given("a signed-in user has been approved by the administrator", async ({ page, scenario }) => {
  scenario.email = (await signIn(page, "editor")).email;
  await approve(scenario.adminPage, scenario.email);
  await page.reload();
});
Given("no company profile has been saved", async ({ page }) => {
  expect(await (await page.request.get("/api/company-profile")).json()).toBeNull();
});
When("the user saves these company details:", async ({ page, scenario }, table: DataTable) => {
  const fields = Object.fromEntries(table.rows().map(([field, value]) => [field, value]));
  const name = fields["company name"];
  const address = fields["reference address"];
  const radius = fields["search radius km"];
  if (!name || !address || !radius) throw new Error("Missing company example fields.");
  scenario.profile = { name, address, radiusKm: Number(radius) };
  await page.getByRole("textbox", { name: "Nome da empresa" }).fill(name);
  await page.getByRole("textbox", { name: "Morada de referência" }).fill(address);
  await page.getByRole("spinbutton", { name: "Raio de pesquisa (km)" }).fill(radius);
  await page.getByRole("button", { name: "Guardar perfil" }).click();
  await expect(page.getByRole("status")).toHaveText("Perfil guardado.");
});
Then("those details remain available after reloading the page", async ({ page, scenario }) => {
  // state verification
  await page.reload();
  const profile = scenario.profile;
  if (!profile) throw new Error("No profile was supplied by the scenario.");
  await expect(page.getByRole("textbox", { name: "Nome da empresa" })).toHaveValue(profile.name);
  await expect(page.getByRole("textbox", { name: "Morada de referência" })).toHaveValue(
    profile.address,
  );
  await expect(page.getByRole("spinbutton", { name: "Raio de pesquisa (km)" })).toHaveValue(
    String(profile.radiusKm),
  );
});
