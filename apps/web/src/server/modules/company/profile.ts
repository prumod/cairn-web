import type { Database } from "@cairn/db";
import { z } from "zod";
import { companyProfileTable } from "./persistence/companyProfileTable.js";

export const CompanyProfile = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(500),
  radiusKm: z.number().positive(),
});

export type CompanyProfile = z.infer<typeof CompanyProfile>;

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
