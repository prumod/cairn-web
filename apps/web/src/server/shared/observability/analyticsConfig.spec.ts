import { expect, test } from "vitest";
import { publicAnalyticsConfig } from "./analyticsConfig.js";

test.each(["dev", "test", "testing", "preview", undefined])(
  "does not enable product analytics for stage %s",
  (stage) => {
    expect(publicAnalyticsConfig(stage, "phc_synthetic")).toBeNull();
  },
);

test("production exposes only the public project token and EU ingestion host", () => {
  expect(publicAnalyticsConfig("production", "phc_synthetic")).toEqual({
    token: "phc_synthetic",
    host: "https://eu.i.posthog.com",
  });
});

test("production does not enable product analytics without a token", () => {
  expect(publicAnalyticsConfig("production", "")).toBeNull();
});
