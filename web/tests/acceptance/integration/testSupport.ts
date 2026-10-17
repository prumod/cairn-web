import { randomUUID } from "node:crypto";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import {
  createServer as createHttpServer,
  request as httpRequest,
  type IncomingMessage,
  type Server,
} from "node:http";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { authOptions } from "../../../src/server/shared/auth/auth.js";

// Prototype fixture: runs the built Worker under workerd with a local D1 database.
// Node opens the same persisted SQLite file for identity setup and per-test resets.

function findAvailablePort(requested: number) {
  if (requested !== 0) return Promise.resolve(requested);
  return new Promise<number>((resolve, reject) => {
    const server = createNetServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (!address || typeof address === "string") reject(new Error("No available test port."));
        else resolve(address.port);
      });
    });
  });
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
  // wrangler starts workerd as a child process; signal the whole process group.
  try {
    process.kill(-child.pid!, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
  let timer: NodeJS.Timeout | undefined;
  const stopped = await Promise.race([
    closed.then(() => true),
    new Promise<false>((resolve) => {
      timer = setTimeout(() => resolve(false), 10_000);
    }),
  ]);
  if (timer) clearTimeout(timer);
  if (!stopped) {
    try {
      process.kill(-child.pid!, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
    await closed;
  }
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

async function closeServer(server: Server | undefined) {
  if (!server?.listening) return;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

function findD1Database(persistTo: string) {
  const root = join(persistTo, "v3", "d1");
  if (!existsSync(root)) return undefined;
  const files = readdirSync(root, { recursive: true, withFileTypes: false })
    .map(String)
    .filter((name) => name.endsWith(".sqlite"))
    .map((name) => join(root, name))
    .filter((path) => statSync(path).size > 0);
  return files[0];
}

export async function createTestApplication(
  requestedPort = 0,
  { testControlProxy = false }: { testControlProxy?: boolean } = {},
) {
  const webRoot = fileURLToPath(new URL("../../../", import.meta.url));
  const persistTo = mkdtempSync(join(tmpdir(), "cairn-d1-test-"));
  const wranglerConfig = join(webRoot, "dist/server/wrangler.json");
  const wrangler = join(webRoot, "node_modules/wrangler/bin/wrangler.js");
  const wranglerEnvironment = { ...process.env, WRANGLER_SEND_METRICS: "false" };
  let appServer: ChildProcess | undefined;
  let sqlite: DatabaseSync | undefined;
  let proxyServer: Server | undefined;

  async function cleanup() {
    const errors: unknown[] = [];
    try {
      await closeServer(proxyServer);
    } catch (error) {
      errors.push(error);
    }
    try {
      await stop(appServer);
    } catch (error) {
      errors.push(error);
    }
    try {
      sqlite?.close();
    } catch (error) {
      errors.push(error);
    }
    try {
      rmSync(persistTo, { recursive: true, force: true });
    } catch (error) {
      errors.push(error);
    }
    if (errors.length > 0) throw new AggregateError(errors, "Test application cleanup failed.");
  }

  try {
    const migrated = spawnSync(
      process.execPath,
      [
        wrangler,
        "d1",
        "migrations",
        "apply",
        "DB",
        "--local",
        "--persist-to",
        persistTo,
        "--config",
        wranglerConfig,
      ],
      { cwd: webRoot, env: wranglerEnvironment, encoding: "utf8" },
    );
    if (migrated.status !== 0) {
      throw new Error("D1 migrations failed: " + migrated.stdout + migrated.stderr);
    }

    const databaseFile = findD1Database(persistTo);
    if (!databaseFile) throw new Error("Local D1 database file was not created.");
    sqlite = new DatabaseSync(databaseFile);
    sqlite.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
    const rawSqlite = sqlite;

    // Node-side Drizzle proxy for identity setup. The Worker still uses its own D1 binding.
    const db = drizzle(async (sql, params, method) => {
      const statement = rawSqlite.prepare(sql);
      if (method === "run") {
        statement.run(...(params as never[]));
        return { rows: [] };
      }
      const rows = statement.all(...(params as never[])) as Record<string, unknown>[];
      return { rows: rows.map((row) => Object.values(row)) };
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
      BETTER_AUTH_SECRET: secret,
      BOOTSTRAP_ADMIN_EMAIL: "admin@example.test",
      GOOGLE_CLIENT_ID: googleClientId,
      GOOGLE_CLIENT_SECRET: googleClientSecret,
    };

    const utils = testUtils();
    const auth = betterAuth({
      ...authOptions(db as never, { origin, secret, googleClientId, googleClientSecret }),
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

    appServer = spawn(
      process.execPath,
      [
        wrangler,
        "dev",
        "--config",
        wranglerConfig,
        "--local",
        "--persist-to",
        persistTo,
        "--ip",
        "127.0.0.1",
        "--port",
        String(appPort),
        ...Object.entries(environment).flatMap(([key, value]) => ["--var", key + ":" + value]),
      ],
      { cwd: webRoot, env: wranglerEnvironment, stdio: ["ignore", "pipe", "pipe"], detached: true },
    );
    const output = captureOutput(appServer);
    const exited = new Promise<never>((_resolve, reject) => {
      appServer!.once("error", reject);
      appServer!.once("close", (code, signal) => {
        reject(new Error(`Worker dev server exited (${String(code ?? signal)}): ${output()}`));
      });
    });

    let ready = false;
    let lastObservation = "no response";
    const deadline = Date.now() + 60_000;
    while (!ready && Date.now() < deadline) {
      const response = await Promise.race([
        fetch(appOrigin + "/healthz", { signal: AbortSignal.timeout(1_500) }).catch(() => null),
        exited,
      ]);
      if (response) {
        const body = await response.text().catch(() => "unreadable response");
        lastObservation = `HTTP ${response.status}: ${body.slice(0, 160)}`;
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
          // Continue until the Worker responds with its database-backed readiness state.
        }
      }
      await delay(200);
    }
    if (!ready) {
      throw new Error(`Worker was not ready (${lastObservation}): ${output()}`);
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
        // SQLite has no TRUNCATE; delete children before parents to honor foreign keys.
        rawSqlite.exec(
          'DELETE FROM company_profile; DELETE FROM session; DELETE FROM account; DELETE FROM verification; DELETE FROM user_access; DELETE FROM "user";',
        );
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
