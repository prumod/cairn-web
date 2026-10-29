import type { AccessFailure } from "../domain/access";

const failures = {
  "administrator-required": { message: "Administrator access required.", status: 403 },
  "self-change": { message: "You cannot change your own access.", status: 400 },
  "user-not-found": { message: "User not found.", status: 404 },
} as const satisfies Record<AccessFailure, { message: string; status: number }>;

export function failureResponse(reason: AccessFailure) {
  return failures[reason];
}
