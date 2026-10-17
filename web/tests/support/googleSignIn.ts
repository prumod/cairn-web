import { setTimeout as delay } from "node:timers/promises";
import type { APIRequestContext } from "@playwright/test";

export async function signInWithGoogleToken(
  request: APIRequestContext,
  origin: string,
  idToken: string,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await request.post(`${origin}/api/auth/sign-in/social`, {
      headers: { Origin: origin, Referer: `${origin}/` },
      data: { provider: "google", idToken: { token: idToken } },
      maxRedirects: 0,
      timeout: 15_000,
    });
    const status = response.status();
    const headers = response.headers();
    const retryAfter = headers["retry-after"] ?? headers["x-retry-after"];
    await response.dispose();
    if (status === 200) return;
    // Only an explicit rate-limit rejection is safe to retry. Never relax the server limit.
    if (
      status !== 429 ||
      attempt === 2 ||
      retryAfter === undefined ||
      !/^\d+$/.test(retryAfter) ||
      Number(retryAfter) > 15
    )
      throw new Error(`Google ID-token sign-in failed (HTTP ${status}).`);
    await delay(Number(retryAfter) * 1000);
  }
}
