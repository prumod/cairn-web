import { requireAdministrator, type Actor } from "../../domain/access";

export interface UserAccess {
  id: string;
  email: string;
  approved: boolean;
  administrator: boolean;
}

export interface UsersReader {
  listUsers(): Promise<UserAccess[]>;
}

export function listUsers(actor: Actor, users: UsersReader) {
  requireAdministrator(actor);

  return users.listUsers();
}
