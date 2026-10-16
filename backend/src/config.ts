export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  function required(name: string) {
    const value = env[name]?.trim();
    if (!value) throw new Error(name + " is required.");
    return value;
  }
  let originURL: URL;
  try {
    originURL = new URL(required("APP_ORIGIN"));
  } catch {
    throw new Error("APP_ORIGIN must be a valid HTTP or HTTPS URL.");
  }
  if (!["http:", "https:"].includes(originURL.protocol))
    throw new Error("APP_ORIGIN must be HTTP or HTTPS.");
  if (env.NODE_ENV === "production" && originURL.protocol !== "https:")
    throw new Error("Production APP_ORIGIN must use HTTPS.");
  const secret = required("BETTER_AUTH_SECRET");
  if (secret.length < 32)
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
  const port = Number(env.PORT ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT must be between 1 and 65535.");
  return {
    databaseURL: required("DATABASE_URL"),
    origin: originURL.origin,
    secret,
    googleClientId: required("GOOGLE_CLIENT_ID"),
    googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
    bootstrapEmail: required("BOOTSTRAP_ADMIN_EMAIL"),
    revision: env.RENDER_GIT_COMMIT ?? env.GIT_SHA ?? "local",
    port,
  };
}
