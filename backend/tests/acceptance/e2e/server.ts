import { fileURLToPath } from "node:url";
import { createTestApplication } from "../integration/testSupport.js";

if (process.env.NODE_ENV !== "test") throw new Error("This server is for isolated tests only.");
const key = process.env.TEST_IDENTITY_KEY;
if (!key) throw new Error("TEST_IDENTITY_KEY is required.");
const directory = fileURLToPath(new URL("../../../../web/dist", import.meta.url));
const testApp = await createTestApplication(4173, directory);
const identities = new Map<string, Awaited<ReturnType<typeof testApp.identity>>>();
testApp.app.post("/__test/session", async (req, res) => {
  if (req.get("x-test-identity-key") !== key) {
    res.sendStatus(403);
    return;
  }
  const role: unknown = req.body?.identity;
  if (role !== "admin" && role !== "pending" && role !== "editor") {
    res.sendStatus(400);
    return;
  }
  let identity = identities.get(role);
  if (!identity) {
    identity = await testApp.identity(role + "@example.test");
    identities.set(role, identity);
  }
  for (const cookie of identity.cookies) {
    res.cookie(cookie.name, cookie.value, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  res.json({ userId: identity.user.id, email: identity.user.email });
});
async function close() {
  await testApp.close();
  process.exit(0);
}
process.once("SIGTERM", close);
process.once("SIGINT", close);
