import { randomUUID } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import {
  createServer as createHttpServer,
  request as httpRequest,
  type IncomingMessage,
  type Server,
} from "node:http";
import { createServer as createNetServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { authOptions } from "@cairn/auth";
import { createDb } from "@cairn/db";
import { migrate } from "drizzle-orm/neon-http/migrator";

const environmentKeys = [
  "APP_ORIGIN",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "BOOTSTRAP_ADMIN_EMAIL",
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GIT_SHA",
  "NODE_ENV",
  "TEST_IDENTITY_KEY",
] as const;

async function findAvailablePort(requested: number) {
  if (requested !== 0) return requested;
  const server = createNetServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No available test port.");
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

function captureOutput(child: ChildProcess) {
  const lines: string[] = [];
  const record = (chunk: Buffer) => {
    lines.push(chunk.toString());
    if (lines.length > 40) lines.shift();
  };
  child.stdout?.on("data", record);
  child.stderr?.on("data", record);
  return () => lines.join("");
}

async function stop(child: ChildProcess | undefined) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const closed = new Promise<void>((resolve) => child.once("close", () => resolve()));
  if (process.platform === "win32") child.kill("SIGTERM");
  else if (child.pid) process.kill(-child.pid, "SIGTERM");
  let timer: NodeJS.Timeout | undefined;
  const stopped = await Promise.race([
    closed.then(() => true),
    new Promise<false>((resolve) => {
      timer = setTimeout(() => resolve(false), 10_000);
    }),
  ]);
  if (timer) clearTimeout(timer);
  if (!stopped) {
    if (process.platform === "win32") child.kill("SIGKILL");
    else if (child.pid) process.kill(-child.pid, "SIGKILL");
    await closed;
  }
}

async function closeServer(server: Server | undefined) {
  if (!server?.listening) return;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 4096) throw new Error("Test identity payload is too large.");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

export async function createTestApplication(
  requestedPort = 0,
  { testControlProxy = false }: { testControlProxy?: boolean } = {},
) {
  const connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString) throw new Error("Run tests via the PostgreSQL test wrapper.");

  const previousEnvironment = new Map(
    environmentKeys.map((key) => [key, process.env[key]] as const),
  );
  const name = "cairn_test_" + randomUUID().replaceAll("-", "");
  const identifier = pg.escapeIdentifier(name);
  const rootPool = new pg.Pool({ connectionString });
  let pool: pg.Pool | undefined;
  let appServer: ChildProcess | undefined;
  let proxyServer: Server | undefined;
  let databaseCreated = false;

  async function restoreEnvironment() {
    for (const key of environmentKeys) {
      const value = previousEnvironment.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  async function cleanup() {
    const errors: unknown[] = [];
    async function attempt(operation: () => Promise<void>) {
      try {
        await operation();
      } catch (error) {
        errors.push(error);
      }
    }
    await attempt(() => closeServer(proxyServer));
    await attempt(() => stop(appServer));
    if (pool) await attempt(() => pool!.end());
    if (databaseCreated) {
      await attempt(async () => {
        // Neon’s HTTP proxy keeps pooled connections after the Worker stops.
        await rootPool.query({ text: "DROP DATABASE " + identifier + " WITH (FORCE)" });
      });
    }
    await attempt(() => rootPool.end());
    await attempt(restoreEnvironment);
    if (errors.length > 0) throw new AggregateError(errors, "Test application cleanup failed.");
  }

  try {
    await rootPool.query({ text: "CREATE DATABASE " + identifier });
    databaseCreated = true;
    const url = new URL(connectionString);
    url.pathname = "/" + name;
    pool = new pg.Pool({ connectionString: url.toString() });
    const neonPort = process.env.TEST_NEON_PORT;
    if (!neonPort) throw new Error("Run tests via the disposable PostgreSQL/Neon proxy wrapper.");
    const neonURL = new URL(url);
    neonURL.hostname = "db.localtest.me";
    neonURL.port = neonPort;
    const db = createDb({ DATABASE_URL: neonURL.toString() });
    await migrate(db, {
      migrationsFolder: fileURLToPath(
        new URL("../../../../../packages/db/migrations", import.meta.url),
      ),
    });

    const secret = randomUUID();
    const googleClientId = "controlled-test-client";
    const googleClientSecret = "controlled-test-secret";
    const publicPort = await findAvailablePort(requestedPort);
    const appPort = testControlProxy ? await findAvailablePort(0) : publicPort;
    const origin = "http://127.0.0.1:" + publicPort;
    const appOrigin = "http://127.0.0.1:" + appPort;
    const key = "isolated-local-browser-test";
    const environment = {
      APP_ORIGIN: origin,
      BETTER_AUTH_URL: origin,
      BETTER_AUTH_SECRET: secret,
      BOOTSTRAP_ADMIN_EMAIL: "admin@example.test",
      DATABASE_URL: neonURL.toString(),
      GOOGLE_CLIENT_ID: googleClientId,
      GOOGLE_CLIENT_SECRET: googleClientSecret,
      GIT_SHA: "0123456789abcdef0123456789abcdef01234567",
      HOST: "127.0.0.1",
      NODE_ENV: "test",
      PORT: String(appPort),
      TEST_IDENTITY_KEY: key,
      ...(process.env.HOME === undefined ? {} : { HOME: process.env.HOME }),
      ...(process.env.PATH === undefined ? {} : { PATH: process.env.PATH }),
    };
    Object.assign(process.env, environment);

    const auth = betterAuth({
      ...authOptions(environment, db),
      plugins: [testUtils()],
    });
    const helpers = (await auth.$context).test;

    async function createIdentity(email: string, verified = true, google = true) {
      const testContext = await auth.$context;
      const userRecord = await helpers.saveUser(
        helpers.createUser({ email, emailVerified: verified }),
      );
      if (google) {
        await testContext.internalAdapter.createAccount({
          userId: userRecord.id,
          providerId: "google",
          accountId: randomUUID(),
        });
      }
      const login = await helpers.login({ userId: userRecord.id });
      return {
        user: userRecord,
        cookie: login.headers.get("cookie") ?? "",
        cookies: login.cookies,
      };
    }

    type Identity = Awaited<ReturnType<typeof createIdentity>>;
    const identities = new Map<string, Identity>();
    const infraRoot = fileURLToPath(new URL("../../../../../packages/infra/", import.meta.url));
    appServer = spawn(
      "bun",
      [
        "node_modules/alchemy/bin/cli.js",
        "dev",
        "test/alchemy.run.ts",
        "--stage",
        "test-" + name,
        "--env-file",
        process.platform === "win32" ? "NUL" : "/dev/null",
      ],
      {
        cwd: infraRoot,
        env: environment,
        detached: process.platform !== "win32",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const output = captureOutput(appServer);
    const exited = new Promise<never>((_resolve, reject) => {
      appServer!.once("error", reject);
      appServer!.once("close", (code, signal) => {
        reject(new Error(`TanStack Start server exited (${String(code ?? signal)}): ${output()}`));
      });
    });

    let ready = false;
    let lastObservation = "no response";
    const deadline = Date.now() + 180_000;
    while (!ready && Date.now() < deadline) {
      const response = await Promise.race([
        fetch(appOrigin + "/healthz", {
          headers: { Origin: origin },
          signal: AbortSignal.timeout(1_500),
        }).catch(() => null),
        exited,
      ]);
      if (response) {
        const contentType = response.headers.get("content-type") ?? "unknown content type";
        const body = await response.text().catch(() => "unreadable response");
        lastObservation = `HTTP ${response.status} (${contentType}): ${body.slice(0, 160)}`;
        if (response.status >= 500 && response.status !== 503) {
          throw new Error(`TanStack Start returned ${lastObservation}: ${output()}`);
        }
        try {
          const health: unknown = JSON.parse(body);
          if (
            response.ok &&
            typeof health === "object" &&
            health !== null &&
            "status" in health &&
            health.status === "ready"
          ) {
            ready = true;
            break;
          }
        } catch {
          // Continue until the app responds with its database-backed readiness state.
        }
      }
      await delay(100);
    }
    if (!ready) {
      throw new Error(`TanStack Start server was not ready (${lastObservation}): ${output()}`);
    }

    if (testControlProxy) {
      proxyServer = createHttpServer(async (request, response) => {
        if (request.method === "POST" && request.url === "/__test/session") {
          if (request.headers["x-test-identity-key"] !== key) {
            response.writeHead(403);
            response.end();
            return;
          }
          let body: unknown;
          try {
            body = await readJson(request);
          } catch {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Invalid test identity request." }));
            return;
          }
          const role =
            typeof body === "object" && body !== null && "identity" in body ? body.identity : null;
          if (role !== "admin" && role !== "pending" && role !== "editor") {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Unknown test identity." }));
            return;
          }
          let identity = identities.get(role);
          if (!identity) {
            identity = await createIdentity(role + "@example.test");
            identities.set(role, identity);
          }
          const cookies = identity.cookies.map((cookie) => {
            const parts = [cookie.name + "=" + cookie.value, "Path=" + cookie.path];
            if (cookie.httpOnly) parts.push("HttpOnly");
            if (cookie.secure) parts.push("Secure");
            if (cookie.sameSite) parts.push("SameSite=" + cookie.sameSite);
            return parts.join("; ");
          });
          response.writeHead(200, {
            "Cache-Control": "no-store",
            "Content-Type": "application/json",
            "Set-Cookie": cookies,
          });
          response.end(JSON.stringify({ userId: identity.user.id, email: identity.user.email }));
          return;
        }

        const upstream = httpRequest(
          {
            hostname: "127.0.0.1",
            port: appPort,
            path: request.url,
            method: request.method,
            headers: { ...request.headers, host: "127.0.0.1:" + appPort },
          },
          (upstreamResponse) => {
            response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
            upstreamResponse.pipe(response);
          },
        );
        upstream.on("error", () => {
          if (!response.headersSent) response.writeHead(502);
          response.end();
        });
        request.pipe(upstream);
      });
      await new Promise<void>((resolve, reject) => {
        proxyServer!.once("error", reject);
        proxyServer!.listen(publicPort, "127.0.0.1", resolve);
      });
    }

    return {
      db,
      auth,
      origin,
      baseURL: origin,
      createIdentity,
      identity: createIdentity,
      request(path: string, cookie = "", method = "GET", body?: unknown, requestOrigin = origin) {
        return fetch(origin + path, {
          method,
          headers: {
            cookie,
            origin: requestOrigin,
            "content-type": "application/json",
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
      },
      async reset() {
        await pool!.query({
          text: 'TRUNCATE TABLE company_profile, session, account, verification, user_access, "user" RESTART IDENTITY CASCADE',
        });
      },
      close: cleanup,
    };
  } catch (error) {
    try {
      await cleanup();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Test startup and cleanup failed.");
    }
    throw error;
  }
}

export type TestApplication = Awaited<ReturnType<typeof createTestApplication>>;
