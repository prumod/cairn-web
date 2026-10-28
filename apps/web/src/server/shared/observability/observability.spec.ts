import { afterEach, expect, test, vi } from "vitest";
import { DependencyUnavailable, handleRequest } from "./observability.js";

afterEach(() => vi.restoreAllMocks());

test("a failed request returns an identifier that matches its sanitized log", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await handleRequest("save_company_profile", "revision-123", async () => {
    throw new Error("secret-token and private company data");
  });

  const requestId = response.headers.get("x-request-id");
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Request failed. Try again." });
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(requestId).toMatch(/^[0-9a-f-]{36}$/);
  expect(log).toHaveBeenCalledOnce();
  expect(log.mock.calls[0]?.[0]).toMatchObject({
    event: "request_failed",
    operation: "save_company_profile",
    revision: "revision-123",
    requestId,
    errorType: "Error",
  });
  expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
  expect(JSON.stringify(log.mock.calls)).not.toContain("private company data");
});

test("a failed Worker request keeps bundle frames and redacts absolute paths", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const error = new Error("secret-token");
  error.stack = [
    "Error: secret-token",
    "    at saveCompanyProfile (worker.js:123:45)",
    "    at async Object.fetch (/private/build/worker.js:34:5)",
    "    at /private/runtime.mjs:67:8",
    "prefix at fake.js:90:3",
    "    at trailing.js:91:3 extra",
    "    at unsupported.map:92:4",
  ].join("\n");

  await handleRequest("save_company_profile", "revision-123", async () => {
    throw error;
  });

  expect(log.mock.calls[0]?.[0]).toEqual(
    expect.objectContaining({
      stack: [
        "saveCompanyProfile worker.js:123:45",
        "Object.fetch worker.js:34:5",
        "runtime.mjs:67:8",
      ],
    }),
  );
  expect(JSON.stringify(log.mock.calls)).not.toContain("/private/build");
  expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
});

test("a failure without a stack records an empty frame list", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const error = new Error("secret-token");
  error.stack = undefined;

  await handleRequest("save_company_profile", "revision-123", async () => {
    throw error;
  });

  expect(log.mock.calls[0]?.[0]).toMatchObject({ errorType: "Error", stack: [] });
  expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
});

test("a non-Error failure does not leak its value into the log", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});

  await handleRequest("save_company_profile", "revision-123", async () => {
    throw { privateValue: "secret-token" };
  });

  expect(log.mock.calls[0]?.[0]).toMatchObject({ errorType: "Unknown", stack: [] });
  expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
});

test("recognized error types remain visible without logging their messages", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});

  for (const [error, errorType] of [
    [new TypeError("private type detail"), "TypeError"],
    [new RangeError("private range detail"), "RangeError"],
    [new DependencyUnavailable(new SyntaxError("private syntax detail")), "SyntaxError"],
  ] as const) {
    await handleRequest("save_company_profile", "revision-123", async () => {
      throw error;
    });
    expect(log.mock.calls.at(-1)?.[0]).toMatchObject({
      errorType,
    });
  }

  expect(JSON.stringify(log.mock.calls)).not.toContain("private type detail");
  expect(JSON.stringify(log.mock.calls)).not.toContain("private range detail");
  expect(JSON.stringify(log.mock.calls)).not.toContain("private syntax detail");
});

test("a failed request logs elapsed duration in milliseconds", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(performance, "now").mockReturnValueOnce(100).mockReturnValueOnce(125);

  await handleRequest("save_company_profile", "revision-123", async () => {
    throw new Error("secret-token");
  });

  expect(log.mock.calls[0]?.[0]).toMatchObject({ durationMs: 25 });
});

test("invalid JSON remains a client error without logging the input", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await handleRequest("save_company_profile", "revision-123", async () => {
    throw new SyntaxError("secret-token");
  });

  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Invalid JSON." });
  expect(log).not.toHaveBeenCalled();
});

test("a database readiness failure stays unavailable and is logged", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await handleRequest("health", "revision-123", async () => {
    throw new DependencyUnavailable(new Error("postgres://user:password@host/database"));
  });

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ status: "unavailable" });
  expect(log.mock.calls[0]?.[0]).toMatchObject({
    event: "request_failed",
    operation: "health",
    errorType: "Error",
  });
  expect(JSON.stringify(log.mock.calls)).not.toContain("password");
});

test("a readiness configuration failure remains an internal error", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await handleRequest("health", "revision-123", async () => {
    throw new Error("bad startup configuration");
  });

  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Request failed. Try again." });
});
