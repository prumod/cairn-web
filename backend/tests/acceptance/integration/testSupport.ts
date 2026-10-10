import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import pg from "pg";
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { authOptions } from "../../../src/shared/auth/auth.js";
import { createDatabase, migrateDatabase } from "../../../src/shared/database/database.js";
import { createApplication } from "../../../src/app.js";

export async function createTestApplication(port = 0, staticDirectory?: string) {
  const connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString) throw new Error("Run tests via the PostgreSQL test wrapper.");
  const name = "cairn_test_" + randomUUID().replaceAll("-", "");
  // PostgreSQL does not accept bind parameters for identifiers; escape our generated name.
  const identifier = pg.escapeIdentifier(name);
  const rootPool = new pg.Pool({ connectionString });
  await rootPool.query({ text: "CREATE DATABASE " + identifier });
  const url = new URL(connectionString);
  url.pathname = "/" + name;
  const { db, pool } = createDatabase(url.toString());
  await migrateDatabase(db);
  const origin = "http://127.0.0.1:4173";
  const utils = testUtils();
  const auth = betterAuth({
    ...authOptions(db, {
      origin,
      secret: randomUUID(),
      googleClientId: "controlled-test-client",
      googleClientSecret: "controlled-test-secret",
    }),
    // The upstream helper returns options: undefined, which violates exactOptionalPropertyTypes.
    plugins: [
      {
        ...utils,
        init(context) {
          const result = utils.init(context);
          return { context: result.context, options: result.options ?? {} };
        },
      },
    ],
  });
  const helpers = (await auth.$context).test;
  const app = createApplication({
    db,
    auth,
    origin,
    bootstrapEmail: "admin@example.test",
    ...(staticDirectory === undefined ? {} : { staticDirectory }),
  });
  let server: Server;
  await new Promise<void>((resolve, reject) => {
    server = app.listen(port, "127.0.0.1", (error) => (error ? reject(error) : resolve()));
  });
  const address = server!.address();
  if (!address || typeof address === "string") throw new Error("No test server address.");
  const baseURL = "http://127.0.0.1:" + address.port;
  return {
    db,
    auth,
    app,
    origin,
    baseURL,
    async identity(email: string, verified = true, google = true) {
      const user = await helpers.saveUser(helpers.createUser({ email, emailVerified: verified }));
      if (google)
        await (
          await auth.$context
        ).internalAdapter.createAccount({
          userId: user.id,
          providerId: "google",
          accountId: randomUUID(),
        });
      const login = await helpers.login({ userId: user.id });
      return { user, cookie: login.headers.get("cookie") ?? "", cookies: login.cookies };
    },
    request(path: string, cookie = "", method = "GET", body?: unknown, requestOrigin = origin) {
      return fetch(baseURL + path, {
        method,
        headers: {
          cookie,
          origin: requestOrigin,
          "content-type": "application/json",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    },
    async close() {
      await new Promise<void>((resolve, reject) =>
        server!.close((error) => (error ? reject(error) : resolve())),
      );
      await pool.end();
      await rootPool.query({ text: "DROP DATABASE " + identifier });
      await rootPool.end();
    },
  };
}
export type TestApplication = Awaited<ReturnType<typeof createTestApplication>>;
