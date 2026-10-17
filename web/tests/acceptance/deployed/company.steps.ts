import { expect, type Page } from "@playwright/test";
import { createBdd, test as base } from "playwright-bdd";

const testingOrigin = "https://cairn-testing.onrender.com";
const savedProfile = {
  name: "Cairn Automated E2E",
  address: "Automated test address, Porto",
  radiusKm: 31,
};
type Profile = { name: string; address: string; radiusKm: number };
type UserAccess = { id: string; email: string; approved: boolean; administrator: boolean };
type ApiResult = { status: number; data: unknown };
type Scenario = {
  adminPage: Page;
  memberPage: Page;
  adminSignedIn: boolean;
  memberSignedIn: boolean;
  memberId?: string;
  originalProfile?: Profile;
  originalMemberApproval?: boolean;
  baselineCaptured: boolean;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for deployed Google E2E.`);
  return value;
}

function decodeGoogleClaims(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error();
    return JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    throw new Error("Google returned an invalid ID token.");
  }
}

async function refreshGoogleIdToken(refreshToken: string, expectedEmail: string) {
  const clientId = required("CAIRN_E2E_GOOGLE_CLIENT_ID");
  const clientSecret = required("CAIRN_E2E_GOOGLE_CLIENT_SECRET");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(15_000),
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Google refresh-token exchange failed (HTTP ${response.status}).`);
  }
  const payload = (await response.json()) as { id_token?: unknown };
  if (typeof payload.id_token !== "string")
    throw new Error("Google refresh-token response did not include an ID token.");

  const claims = decodeGoogleClaims(payload.id_token);
  const now = Math.floor(Date.now() / 1000);
  const valid =
    typeof claims.email === "string" &&
    claims.email.toLowerCase() === expectedEmail.toLowerCase() &&
    claims.email_verified === true &&
    claims.aud === clientId &&
    (claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com") &&
    typeof claims.iat === "number" &&
    claims.iat <= now + 30 &&
    now - claims.iat < 3600 &&
    typeof claims.exp === "number" &&
    claims.exp > now + 30 &&
    claims.exp > claims.iat &&
    claims.exp - claims.iat <= 3600;
  if (!valid) throw new Error("Google returned an ID token for the wrong identity or audience.");
  return payload.id_token;
}

async function apiRequest(
  page: Page,
  path: string,
  method: "GET" | "POST" | "PUT" = "GET",
  body?: unknown,
): Promise<ApiResult> {
  const response = await page.context().request.fetch(`${testingOrigin}${path}`, {
    method,
    headers: {
      Origin: testingOrigin,
      Referer: `${testingOrigin}/`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { data: body }),
    maxRedirects: 0,
    timeout: 15_000,
  });
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Status-only responses are expected for denied access and sign-out.
  }
  return { status: response.status(), data };
}

async function signInWithGoogleIdToken(page: Page, idToken: string) {
  const response = await page.context().request.post(`${testingOrigin}/api/auth/sign-in/social`, {
    headers: { Origin: testingOrigin, Referer: `${testingOrigin}/` },
    data: { provider: "google", idToken: { token: idToken } },
    maxRedirects: 0,
    timeout: 15_000,
  });
  if (response.status() !== 200)
    throw new Error("Google ID-token sign-in did not create an application session.");
  await page.goto("/");
}

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<Profile>;
  return (
    typeof profile.name === "string" &&
    typeof profile.address === "string" &&
    typeof profile.radiusKm === "number"
  );
}

function sameProfile(left: unknown, right: Profile) {
  if (!left || typeof left !== "object") return false;
  const profile = left as Partial<Profile>;
  return (
    profile.name === right.name &&
    profile.address === right.address &&
    profile.radiusKm === right.radiusKm
  );
}

async function getUsers(page: Page) {
  const result = await apiRequest(page, "/api/users");
  if (result.status !== 200 || !Array.isArray(result.data))
    throw new Error("The testing administrator could not list access records.");
  return result.data as UserAccess[];
}

async function setMemberApproval(scenario: Scenario, approved: boolean) {
  const memberId = scenario.memberId;
  if (!memberId) throw new Error("The testing member was not initialized.");
  const users = await getUsers(scenario.adminPage);
  const rowIndex = users.findIndex((user) => user.id === memberId);
  const member = users[rowIndex];
  if (!member) throw new Error("The testing member is missing from the access list.");
  if (member.approved === approved) return;

  await scenario.adminPage.goto("/access");
  const row = scenario.adminPage
    .getByRole("table")
    .getByRole("row")
    .nth(rowIndex + 1);
  const currentAction = member.approved ? "Revogar" : "Aprovar";
  const resultingAction = approved ? "Revogar" : "Aprovar";
  await expect(row.getByRole("button", { name: currentAction, exact: true })).toBeVisible();
  await row.getByRole("button", { name: currentAction, exact: true }).click();
  await expect(row.getByRole("button", { name: resultingAction, exact: true })).toBeVisible();

  const updated = (await getUsers(scenario.adminPage)).find((user) => user.id === memberId);
  expect(updated?.approved === approved).toBe(true);
}

async function restoreBaseline(scenario: Scenario) {
  if (!scenario.baselineCaptured) return;
  const memberId = scenario.memberId;
  const profile = scenario.originalProfile;
  const approved = scenario.originalMemberApproval;
  if (!memberId || !profile || approved === undefined)
    throw new Error("The testing baseline is incomplete; no restoration was attempted.");

  const access = await apiRequest(
    scenario.adminPage,
    `/api/users/${encodeURIComponent(memberId)}/access`,
    "PUT",
    { approved },
  );
  const saved = await apiRequest(scenario.adminPage, "/api/company-profile", "PUT", profile);
  if (access.status !== 200 || saved.status !== 200)
    throw new Error("The original testing data could not be restored.");

  const readProfile = await apiRequest(scenario.adminPage, "/api/company-profile");
  const readUsers = await getUsers(scenario.adminPage);
  const member = readUsers.find((user) => user.id === memberId);
  if (
    readProfile.status !== 200 ||
    !sameProfile(readProfile.data, profile) ||
    member?.approved !== approved
  )
    throw new Error("The restored testing baseline could not be verified.");
}

async function signInAdministrator(scenario: Scenario) {
  const adminEmail = required("CAIRN_E2E_ADMIN_EMAIL");
  const adminToken = await refreshGoogleIdToken(
    required("CAIRN_E2E_ADMIN_REFRESH_TOKEN"),
    adminEmail,
  );
  await signInWithGoogleIdToken(scenario.adminPage, adminToken);
  scenario.adminSignedIn = true;

  const admin = await apiRequest(scenario.adminPage, "/api/me");
  const adminMe = admin.data as { email?: unknown; approved?: unknown; administrator?: unknown };
  expect(
    admin.status === 200 &&
      typeof adminMe.email === "string" &&
      adminMe.email.toLowerCase() === adminEmail.toLowerCase() &&
      adminMe.approved === true &&
      adminMe.administrator === true,
  ).toBe(true);

  const users = await getUsers(scenario.adminPage);
  const adminRows = users.filter((user) => user.email.toLowerCase() === adminEmail.toLowerCase());
  const memberRows = users.filter(
    (user) => user.email.toLowerCase() === required("CAIRN_E2E_MEMBER_EMAIL").toLowerCase(),
  );
  expect(adminRows.length === 1 && adminRows[0]?.administrator && adminRows[0]?.approved).toBe(
    true,
  );
  expect(memberRows.length === 1 && !memberRows[0]?.administrator).toBe(true);
  scenario.memberId = memberRows[0]!.id;
}

async function recordBaseline(scenario: Scenario) {
  const profile = await apiRequest(scenario.adminPage, "/api/company-profile");
  const users = await getUsers(scenario.adminPage);
  const member = users.find((user) => user.id === scenario.memberId);
  if (profile.status !== 200 || !isProfile(profile.data) || !member || member.administrator)
    throw new Error("The required testing baseline is unavailable.");

  scenario.originalProfile = {
    name: profile.data.name,
    address: profile.data.address,
    radiusKm: profile.data.radiusKm,
  };
  scenario.originalMemberApproval = member.approved;
  scenario.baselineCaptured = true;
}

async function prepareAdministrator(scenario: Scenario, memberApproved: boolean) {
  await signInAdministrator(scenario);
  await recordBaseline(scenario);
  await setMemberApproval(scenario, memberApproved);
}

async function signInMember(scenario: Scenario, approved: boolean) {
  const memberEmail = required("CAIRN_E2E_MEMBER_EMAIL");
  const memberToken = await refreshGoogleIdToken(
    required("CAIRN_E2E_MEMBER_REFRESH_TOKEN"),
    memberEmail,
  );
  await signInWithGoogleIdToken(scenario.memberPage, memberToken);
  scenario.memberSignedIn = true;

  const member = await apiRequest(scenario.memberPage, "/api/me");
  const memberMe = member.data as { email?: unknown; approved?: unknown; administrator?: unknown };
  expect(
    member.status === 200 &&
      typeof memberMe.email === "string" &&
      memberMe.email.toLowerCase() === memberEmail.toLowerCase() &&
      memberMe.approved === approved &&
      memberMe.administrator === false,
  ).toBe(true);
}

async function expectMemberPending(scenario: Scenario) {
  await scenario.memberPage.goto("/");
  await expect(
    scenario.memberPage.getByRole("heading", { name: "Acesso à empresa" }),
  ).toBeVisible();
  await expect(scenario.memberPage.getByText("A sua conta aguarda aprovação.")).toBeVisible();

  const current = await apiRequest(scenario.memberPage, "/api/me");
  const currentMe = current.data as {
    email?: unknown;
    approved?: unknown;
    administrator?: unknown;
  };
  const memberEmail = required("CAIRN_E2E_MEMBER_EMAIL");
  expect(
    current.status === 200 &&
      typeof currentMe.email === "string" &&
      currentMe.email.toLowerCase() === memberEmail.toLowerCase() &&
      currentMe.approved === false &&
      currentMe.administrator === false,
  ).toBe(true);

  const read = await apiRequest(scenario.memberPage, "/api/company-profile");
  const write = await apiRequest(scenario.memberPage, "/api/company-profile", "PUT", savedProfile);
  expect(read.status === 403 && write.status === 403).toBe(true);
}

async function expectMemberCanAccessProfile(scenario: Scenario) {
  const originalProfile = scenario.originalProfile;
  if (!originalProfile) throw new Error("The testing profile baseline was not recorded.");

  await scenario.memberPage.goto("/");
  const current = await apiRequest(scenario.memberPage, "/api/me");
  const currentMe = current.data as {
    email?: unknown;
    approved?: unknown;
    administrator?: unknown;
  };
  const memberEmail = required("CAIRN_E2E_MEMBER_EMAIL");
  const profile = await apiRequest(scenario.memberPage, "/api/company-profile");
  expect(
    current.status === 200 &&
      typeof currentMe.email === "string" &&
      currentMe.email.toLowerCase() === memberEmail.toLowerCase() &&
      currentMe.approved === true &&
      currentMe.administrator === false,
  ).toBe(true);
  expect(profile.status === 200 && sameProfile(profile.data, originalProfile)).toBe(true);
  await expect(scenario.memberPage.getByRole("textbox", { name: "Nome da empresa" })).toBeVisible();
}

export const test = base.extend<{ scenario: Scenario }>({
  scenario: async ({ browser }, use) => {
    const adminContext = await browser.newContext({ baseURL: testingOrigin });
    const memberContext = await browser.newContext({ baseURL: testingOrigin });
    const scenario: Scenario = {
      adminPage: await adminContext.newPage(),
      memberPage: await memberContext.newPage(),
      adminSignedIn: false,
      memberSignedIn: false,
      baselineCaptured: false,
    };

    await use(scenario);

    const cleanupFailures: string[] = [];
    try {
      await restoreBaseline(scenario);
    } catch {
      cleanupFailures.push("Baseline restoration or read-back failed.");
    }
    for (const [page, signedIn] of [
      [scenario.memberPage, scenario.memberSignedIn],
      [scenario.adminPage, scenario.adminSignedIn],
    ] as const) {
      if (!signedIn) continue;
      try {
        const role = page === scenario.adminPage ? "Administrator" : "Member";
        const signOut = await apiRequest(page, "/api/auth/sign-out", "POST", {});
        if (signOut.status !== 200) {
          cleanupFailures.push(`${role} sign-out returned HTTP ${signOut.status}.`);
          continue;
        }
        const session = await apiRequest(page, "/api/auth/get-session");
        if (session.status !== 200 || session.data !== null)
          cleanupFailures.push(`${role} session invalidation was not verified.`);
      } catch {
        cleanupFailures.push("Session cleanup request failed.");
      }
    }
    await Promise.all([adminContext.close(), memberContext.close()]);
    if (cleanupFailures.length > 0) throw new Error(cleanupFailures.join(" "));
  },
});

const { Given, When, Then } = createBdd(test);

Given("the exact testing candidate is live", async () => {
  const expectedRevision = required("CAIRN_CANDIDATE_SHA");
  if (!/^[a-f0-9]{40}$/i.test(expectedRevision))
    throw new Error("CAIRN_CANDIDATE_SHA must be a full commit SHA.");
  const response = await fetch(`${testingOrigin}/healthz`, { cache: "no-store" });
  const health = (await response.json().catch(() => ({}))) as {
    status?: unknown;
    revision?: unknown;
  };
  expect(
    response.ok && health.status === "ready" && health.revision === expectedRevision,
    `Testing health: HTTP ${response.status}, status ${String(health.status)}, revision ${String(health.revision)}, expected ${expectedRevision}`,
  ).toBe(true);
});

Given(
  "the administrator has recorded the baseline and marked the member pending",
  async ({ scenario }) => {
    await prepareAdministrator(scenario, false);
  },
);

Given(
  "the administrator and pending member have signed in with Google after the baseline was recorded",
  async ({ scenario }) => {
    await prepareAdministrator(scenario, false);
    await signInMember(scenario, false);
  },
);

Given(
  "the administrator and approved member have signed in with Google after the baseline was recorded",
  async ({ scenario }) => {
    await prepareAdministrator(scenario, true);
    await signInMember(scenario, true);
  },
);

When("the pending member signs in with Google", async ({ scenario }) => {
  await signInMember(scenario, false);
});

When("the administrator approves the member", async ({ scenario }) => {
  await setMemberApproval(scenario, true);
});

When("the administrator revokes the member's access", async ({ scenario }) => {
  await setMemberApproval(scenario, false);
});

Then(
  "the member sees the pending approval state and profile reads and edits are denied",
  async ({ scenario }) => {
    await expectMemberPending(scenario);
  },
);

Then("the original company profile remains unchanged", async ({ scenario }) => {
  const originalProfile = scenario.originalProfile;
  if (!originalProfile) throw new Error("The testing profile baseline was not recorded.");
  const current = await apiRequest(scenario.adminPage, "/api/company-profile");
  expect(current.status === 200 && sameProfile(current.data, originalProfile)).toBe(true);
});

Then("the member can access the company profile", async ({ scenario }) => {
  await expectMemberCanAccessProfile(scenario);
});

When("the member saves a company profile and reloads the page", async ({ scenario }) => {
  await scenario.memberPage.goto("/");
  await scenario.memberPage
    .getByRole("textbox", { name: "Nome da empresa" })
    .fill(savedProfile.name);
  await scenario.memberPage
    .getByRole("textbox", { name: "Morada de referência" })
    .fill(savedProfile.address);
  await scenario.memberPage
    .getByRole("spinbutton", { name: "Raio de pesquisa (km)" })
    .fill(String(savedProfile.radiusKm));
  await scenario.memberPage.getByRole("button", { name: "Guardar perfil" }).click();
  await expect(scenario.memberPage.getByRole("status")).toHaveText("Perfil guardado.");
  await scenario.memberPage.reload();
});

Then("the saved profile remains available after reloading", async ({ scenario }) => {
  const values = await Promise.all([
    scenario.memberPage.getByRole("textbox", { name: "Nome da empresa" }).inputValue(),
    scenario.memberPage.getByRole("textbox", { name: "Morada de referência" }).inputValue(),
    scenario.memberPage.getByRole("spinbutton", { name: "Raio de pesquisa (km)" }).inputValue(),
  ]);
  expect(
    values[0] === savedProfile.name &&
      values[1] === savedProfile.address &&
      values[2] === String(savedProfile.radiusKm),
  ).toBe(true);
  const saved = await apiRequest(scenario.adminPage, "/api/company-profile");
  expect(saved.status === 200 && sameProfile(saved.data, savedProfile)).toBe(true);
});
