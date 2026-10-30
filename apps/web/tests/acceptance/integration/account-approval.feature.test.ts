import { expect } from "vitest";
import { feature } from "../../../../../features/access/account-approval.feature";
import { createTestApplication, type TestApplication } from "../../support/testSupport.js";

const administratorEmail = "admin@example.test";

async function currentUser(app: TestApplication, cookie: string) {
  const response = await app.request("/api/me", cookie);
  expect(response.status).toBe(200);

  return response.json();
}

feature
  .beforeAll(async () => ({ app: await createTestApplication() }))
  .afterAll(async ({ app }) => {
    await app?.close();
  })
  .scenario("A pending user remains unapproved")
  .given("a user has signed in with Google")(async ({ app }) => ({
    user: await app.identity("pending@example.test"),
  }))
  .and("that user awaits approval")(() => {})
  .when("the user checks their session")(async ({ app, user }) => ({
    session: await currentUser(app, user.cookie),
  }))
  .then("their account remains unapproved")(({ session, user }) => {
    expect(session).toEqual({
      id: user.user.id,
      email: "pending@example.test",
      approved: false,
      administrator: false,
    });
  })
  .scenario("Revocation updates an existing session")
  .given("an approved user has an active session")(async ({ app }) => {
    const approver = await app.identity(administratorEmail);
    const user = await app.identity("approved@example.test");

    const approval = await app.rpc("changeAccess", approver.cookie, {
      userId: user.user.id,
      approved: true,
    });

    expect(approval.status).toBe(200);
    expect(await currentUser(app, user.cookie)).toMatchObject({ approved: true });

    return { user };
  })
  .and("an administrator is signed in")(async ({ app }) => {
    const admin = await app.identity(administratorEmail);
    expect(await currentUser(app, admin.cookie)).toMatchObject({ administrator: true });

    return { admin };
  })
  .when("the administrator revokes that user's access")(async ({ app, admin, user }) => ({
    revocation: await app.rpc("changeAccess", admin.cookie, {
      userId: user.user.id,
      approved: false,
    }),
  }))
  .then("their existing session reports that approval was revoked")(
    async ({ app, revocation, user }) => {
      expect(revocation.status).toBe(200);
      expect(await currentUser(app, user.cookie)).toMatchObject({ approved: false });
    },
  )
  .run();
