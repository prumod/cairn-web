import type { Database } from "../../shared/database/database.js";
import { companyProfileTable } from "./persistence/companyProfileTable.js";

export type CompanyProfile = { name: string; address: string; radiusKm: number };

export function parseCompanyProfile(input: unknown): CompanyProfile | null {
  if (
    typeof input !== "object" ||
    input === null ||
    !("name" in input) ||
    !("address" in input) ||
    !("radiusKm" in input) ||
    typeof input.name !== "string" ||
    typeof input.address !== "string" ||
    typeof input.radiusKm !== "number"
  )
    return null;
  const name = input.name.trim();
  const address = input.address.trim();
  if (
    !name ||
    name.length > 200 ||
    !address ||
    address.length > 500 ||
    !Number.isFinite(input.radiusKm) ||
    input.radiusKm <= 0
  )
    return null;
  return { name, address, radiusKm: input.radiusKm };
}
export async function getCompanyProfile(db: Database): Promise<CompanyProfile | null> {
  const profiles = await db
    .select({
      name: companyProfileTable.name,
      address: companyProfileTable.address,
      radiusKm: companyProfileTable.radiusKm,
    })
    .from(companyProfileTable);
  return profiles[0] ?? null;
}
export async function saveCompanyProfile(db: Database, profile: CompanyProfile) {
  await db.insert(companyProfileTable).values(profile).onConflictDoUpdate({
    target: companyProfileTable.id,
    set: profile,
  });
  return profile;
}
