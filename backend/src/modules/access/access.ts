import { eq, sql } from "drizzle-orm";
import type { Database } from "../../shared/database/database.js";
import { verifiedGoogleIdentity } from "../../shared/auth/auth.js";
import { accessTable } from "./persistence/accessTable.js";
import { user } from "../../shared/auth/schema.js";

export async function getAccess(db: Database, userId: string, bootstrapEmail: string) {
  const existing = await db.select().from(accessTable).where(eq(accessTable.userId, userId));
  if (existing[0]) return existing[0];
  const administrator = await verifiedGoogleIdentity(db, userId, bootstrapEmail);
  await db
    .insert(accessTable)
    .values({ userId, administrator, approved: administrator })
    .onConflictDoNothing();
  const result = (await db.select().from(accessTable).where(eq(accessTable.userId, userId)))[0];
  if (!result) throw new Error("Unable to initialize access.");
  return result;
}

export function listUsers(db: Database) {
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

export async function changeApproval(db: Database, userId: string, approved: boolean) {
  const exists = await db.select({ id: user.id }).from(user).where(eq(user.id, userId));
  if (!exists[0]) return false;
  await db.insert(accessTable).values({ userId, approved }).onConflictDoUpdate({
    target: accessTable.userId,
    set: { approved },
  });
  return true;
}
