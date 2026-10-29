import { AccessError, requireAdministrator, type Actor } from "../../domain/access";

export interface AccessWriter {
  changeApproval(userId: string, approved: boolean): Promise<boolean>;
}

export async function changeAccess(
  actor: Actor,
  input: { userId: string; approved: boolean },
  users: AccessWriter,
) {
  requireAdministrator(actor);

  if (input.userId === actor.id) throw new AccessError("self-change");

  if (!(await users.changeApproval(input.userId, input.approved))) {
    throw new AccessError("user-not-found");
  }

  return { approved: input.approved };
}
