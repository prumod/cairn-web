import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@cairn/db";
import * as schema from "@cairn/db/schema/auth";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { and, eq } from "drizzle-orm";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

export function authOptions(env: AuthConfig, database: Database) {
  return {
    database: drizzleAdapter(database, { provider: "pg", schema }),
    trustedOrigins: [env.BETTER_AUTH_URL],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    socialProviders: {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    },
    session: { cookieCache: { enabled: false } },
    plugins: [tanstackStartCookies()],
  };
}

export function createAuth(env: AuthConfig, database: Database) {
  return betterAuth(authOptions(env, database));
}

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

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
