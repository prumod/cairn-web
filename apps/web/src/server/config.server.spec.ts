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

const validEnvironment = {
  APP_ENV: "production",
  APP_ORIGIN: "https://example.test/path?query=1",
  BETTER_AUTH_SECRET: "a".repeat(32),
  DATABASE_URL: "postgres://example:example@localhost/test",
  GOOGLE_CLIENT_ID: "synthetic-client",
  GOOGLE_CLIENT_SECRET: "synthetic-secret",
  BOOTSTRAP_ADMIN_EMAIL: "admin@example.test",
};

test("startup returns normalized settings and defaults for omitted optional settings", () => {
  expect(readConfig(validEnvironment)).toEqual({
    origin: "https://example.test",
    secret: "a".repeat(32),
    databaseURL: "postgres://example:example@localhost/test",
    googleClientId: "synthetic-client",
    googleClientSecret: "synthetic-secret",
    bootstrapEmail: "admin@example.test",
    port: 3000,
    revision: "local",
  });
});

test("startup trims deployment values and preserves an explicit port and revision", () => {
  expect(
    readConfig({
      ...validEnvironment,
      APP_ENV: " test ",
      APP_ORIGIN: " http://localhost:3001/path ",
      BETTER_AUTH_SECRET: " " + "b".repeat(32) + " ",
      DATABASE_URL: " postgres://localhost/test ",
      GOOGLE_CLIENT_ID: " client ",
      GOOGLE_CLIENT_SECRET: " secret ",
      BOOTSTRAP_ADMIN_EMAIL: " admin@example.test ",
      PORT: "8080",
      GIT_SHA: "synthetic-revision",
    }),
  ).toEqual({
    origin: "http://localhost:3001",
    secret: "b".repeat(32),
    databaseURL: "postgres://localhost/test",
    googleClientId: "client",
    googleClientSecret: "secret",
    bootstrapEmail: "admin@example.test",
    port: 8080,
    revision: "synthetic-revision",
  });
});

test.each([
  "APP_ENV",
  "BETTER_AUTH_SECRET",
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "BOOTSTRAP_ADMIN_EMAIL",
] as const)("startup requires a nonblank %s", (name) => {
  for (const value of [undefined, "", "   "]) {
    expect(() => readConfig({ ...validEnvironment, [name]: value })).toThrow(
      `${name} is required.`,
    );
  }
});

test.each([undefined, "", "   "])("startup rejects missing origin %j", (origin) => {
  expect(() => readConfig({ ...validEnvironment, APP_ORIGIN: origin })).toThrow(
    "APP_ORIGIN must be a valid HTTP or HTTPS URL.",
  );
});

test.each(["ftp://example.test", "file:///tmp/example"])(
  "startup rejects non-HTTP origin %s",
  (origin) => {
    expect(() => readConfig({ ...validEnvironment, APP_ORIGIN: origin })).toThrow(
      "APP_ORIGIN must be HTTP or HTTPS.",
    );
  },
);

test.each(["preview", "Production"])("startup rejects unknown environment %s", (environment) => {
  expect(() => readConfig({ ...validEnvironment, APP_ENV: environment })).toThrow(
    "APP_ENV must be development, test, or production.",
  );
});

test("startup rejects an auth secret below the minimum length", () => {
  expect(() => readConfig({ ...validEnvironment, BETTER_AUTH_SECRET: "a".repeat(31) })).toThrow(
    "BETTER_AUTH_SECRET must contain at least 32 characters.",
  );
});

test.each(["1", "65535"])("startup accepts boundary port %s", (port) => {
  expect(readConfig({ ...validEnvironment, PORT: port }).port).toBe(Number(port));
});

test.each(["0", "65536", "-1", "1.5", "not-a-number", "Infinity", ""])(
  "startup rejects unusable port %s",
  (port) => {
    expect(() => readConfig({ ...validEnvironment, PORT: port })).toThrow(
      "PORT must be between 1 and 65535.",
    );
  },
);
