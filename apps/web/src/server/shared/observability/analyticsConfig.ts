export function publicAnalyticsConfig(stage: string | undefined, token: string | undefined) {
  if (stage !== "production" || !token) return null;

  return { token, host: "https://eu.i.posthog.com" };
}
