import { createServer, type OutgoingHttpHeaders, type Server } from "node:http";
import { request, type APIRequestContext } from "@playwright/test";
import { afterEach, beforeEach, expect, test } from "vitest";
import { z } from "zod";
import { signInWithGoogleToken } from "../../support/googleSignIn.js";

let server: Server;
let client: APIRequestContext;
let origin: string;
let attempts: number;
let statuses: number[];
let retryHeaders: OutgoingHttpHeaders;

const ListeningAddress = z.object({ port: z.number() });

beforeEach(async () => {
  attempts = 0;
  statuses = [200];
  retryHeaders = { "X-Retry-After": "0" };
  server = createServer((request, response) => {
    // Other local clients can probe this port. Only sign-in attempts consume a scripted status.
    if (request.method !== "POST" || request.url !== "/api/auth/sign-in/social") {
      response.writeHead(404).end();

      return;
    }

    const status = statuses[attempts] ?? 500;

    attempts += 1;
    response.writeHead(status, status === 429 ? retryHeaders : {});
    response.end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = ListeningAddress.safeParse(server.address());

  if (!address.success) throw new Error("Missing local server port.");
  origin = `http://127.0.0.1:${address.data.port}`;
  client = await request.newContext();
});

afterEach(async () => {
  await client.dispose();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("a non-rate-limit error exposes only the status and is not retried", async () => {
  statuses = [401];
  await expect(signInWithGoogleToken(client, origin, "controlled-token")).rejects.toThrow(
    "Google ID-token sign-in failed (HTTP 401).",
  );
  expect(attempts).toBe(1);
});

test("rate-limit retries stop after three requests", async () => {
  statuses = [429, 429, 429, 200];
  await expect(signInWithGoogleToken(client, origin, "controlled-token")).rejects.toThrow(
    "Google ID-token sign-in failed (HTTP 429).",
  );
  expect(attempts).toBe(3);
});

test.each([undefined, "999999", "-1", "not-a-number"])(
  "an invalid retry interval (%s) fails without a retry",
  async (retryAfter) => {
    statuses = [429, 200];
    retryHeaders = retryAfter === undefined ? {} : { "Retry-After": retryAfter };
    await expect(signInWithGoogleToken(client, origin, "controlled-token")).rejects.toThrow(
      "Google ID-token sign-in failed (HTTP 429).",
    );
    expect(attempts).toBe(1);
  },
);

test("the standard Retry-After header is also honored", async () => {
  statuses = [429, 200];
  retryHeaders = { "Retry-After": "0" };
  await signInWithGoogleToken(client, origin, "controlled-token");
  expect(attempts).toBe(2);
});
