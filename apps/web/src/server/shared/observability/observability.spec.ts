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
  expect(log.mock.calls[0]?.[0]).toMatchObject({ event: "request_failed", operation: "health" });
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
