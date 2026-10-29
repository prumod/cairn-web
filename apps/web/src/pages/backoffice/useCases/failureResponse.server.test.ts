import { expect, it } from "vitest";
import { failureResponse } from "./failureResponse.server";

it.each([
  ["administrator-required", "Administrator access required.", 403],
  ["self-change", "You cannot change your own access.", 400],
  ["user-not-found", "User not found.", 404],
] as const)("maps application failure %s to an HTTP response", (reason, message, status) => {
  expect(failureResponse(reason)).toEqual({ message, status });
});
