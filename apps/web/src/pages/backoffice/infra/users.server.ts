import { eq, sql } from "drizzle-orm";
import type { Database } from "@cairn/db";
import { user } from "@cairn/db/schema/auth";
import { accessTable } from "../../../server/modules/access/access";
import type { AccessWriter } from "../useCases/changeAccess/changeAccess";
import type { UsersReader } from "../useCases/listUsers/listUsers";

function listUsers(db: Database) {
  return db
    .select({
      id: user.id,
      email: user.email,
      approved: sql<boolean>`coalesce(${accessTable.approved}, false)`,
      administrator: sql<boolean>`coalesce(${accessTable.administrator}, false)`,
    })
    .from(user)
    .leftJoin(accessTable, eq(accessTable.userId, user.id))
    .orderBy(user.email);
}

async function changeApproval(db: Database, userId: string, approved: boolean) {
  const exists = await db.select({ id: user.id }).from(user).where(eq(user.id, userId));

  if (!exists[0]) return false;
  await db.insert(accessTable).values({ userId, approved }).onConflictDoUpdate({
    target: accessTable.userId,
    set: { approved },
  });

  return true;
}

export function usersRepository(db: Database): UsersReader & AccessWriter {
  return {
    listUsers: () => listUsers(db),
    changeApproval: (userId, approved) => changeApproval(db, userId, approved),
  };
}
