export interface Actor {
  id: string;
  approved: boolean;
  administrator: boolean;
}

export type AccessFailure = "administrator-required" | "self-change" | "user-not-found";

export class AccessError extends Error {
  constructor(public readonly reason: AccessFailure) {
    super(reason);
  }
}

export function requireAdministrator(actor: Actor) {
  if (!actor.approved || !actor.administrator) throw new AccessError("administrator-required");
}
