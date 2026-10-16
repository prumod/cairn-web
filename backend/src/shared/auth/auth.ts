import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq } from "drizzle-orm";
import type { Database } from "../database/database.js";
import * as schema from "./schema.js";

export type AuthConfig = {
  origin: string;
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
};

export function authOptions(db: Database, config: AuthConfig) {
  return {
    database: drizzleAdapter(db, { provider: "pg", schema }),
    baseURL: config.origin,
    secret: config.secret,
    trustedOrigins: [config.origin],
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
      },
    },
    session: { cookieCache: { enabled: false } },
  };
}
export function createAuth(db: Database, config: AuthConfig) {
  return betterAuth(authOptions(db, config));
}
export type Auth = Pick<ReturnType<typeof createAuth>, "api" | "handler">;

export async function verifiedGoogleIdentity(db: Database, userId: string, email: string) {
  const matches = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .innerJoin(schema.account, eq(schema.account.userId, schema.user.id))
    .where(
      and(
        eq(schema.user.id, userId),
        eq(schema.user.email, email),
        eq(schema.user.emailVerified, true),
        eq(schema.account.providerId, "google"),
      ),
    )
    .limit(1);
  return matches.length === 1;
}
