import { eq } from "drizzle-orm";
import type { Database } from "@cairn/db";
import { verifiedGoogleIdentity } from "@cairn/auth";
import { accessTable } from "./persistence/accessTable.js";

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

export { accessTable } from "./persistence/accessTable.js";
