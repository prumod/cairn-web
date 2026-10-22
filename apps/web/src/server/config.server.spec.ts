import { expect, test } from "vitest";
import { readConfig } from "./config.server.js";

test("production rejects HTTP origins", () => {
  expect(() => readConfig({ APP_ORIGIN: "http://localhost:3001", APP_ENV: "production" })).toThrow(
    "Production APP_ORIGIN must use HTTPS.",
  );
});

test("deployment environment is required independently of the Vite build mode", () => {
  expect(() => readConfig({ APP_ORIGIN: "https://example.test" })).toThrow("APP_ENV is required.");
});

test("the local Worker accepts HTTP even when the build mode is production", () => {
  const config = readConfig({
    APP_ENV: "development",
    APP_ORIGIN: "http://localhost:3001",
    BETTER_AUTH_SECRET: "synthetic-local-secret-at-least-32-characters",
    DATABASE_URL: "postgres://example:example@localhost/test",
    GOOGLE_CLIENT_ID: "synthetic-client",
    GOOGLE_CLIENT_SECRET: "synthetic-secret",
    BOOTSTRAP_ADMIN_EMAIL: "admin@example.test",
    ...{ NODE_ENV: "production" },
  });
  expect(config.origin).toBe("http://localhost:3001");
});

test("invalid origins stop startup with a configuration error", () => {
  // result verification
  expect(() => readConfig({ APP_ORIGIN: "not-a-url" })).toThrow(
    "APP_ORIGIN must be a valid HTTP or HTTPS URL.",
  );
});
