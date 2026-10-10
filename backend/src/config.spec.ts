import { expect, test } from "vitest";
import { readConfig } from "./config.js";

test("invalid origins stop startup with a configuration error", () => {
  // result verification
  expect(() => readConfig({ APP_ORIGIN: "not-a-url" })).toThrow(
    "APP_ORIGIN must be a valid HTTP or HTTPS URL.",
  );
});
