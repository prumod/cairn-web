#!/usr/bin/env node
// Creates an offline Google grant for one E2E test account and stores its
// refresh token in the cairn-testing-e2e GitHub environment secret.
// The token never reaches stdout, logs or argv: it goes to `gh` through stdin.
//
// Usage: CAIRN_E2E_EXPECTED_EMAIL=<account email> \
//          node scripts/grant-e2e-refresh-token.mjs <admin|member>
//
// Requires: the Render API key file (default ~/.config/cairn/render-api-key),
// an authenticated `gh`, and http://127.0.0.1:8765/callback registered as an
// authorized redirect URI on the testing Google OAuth client.
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { join } from "node:path";

const REPOSITORY = "prumod/cairn-web";
const ENVIRONMENT = "cairn-testing-e2e";
const RENDER_SERVICE_ID = "srv-db5aeujbc2fs73esi140";
const PORT = 8765;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const TIMEOUT_MS = 5 * 60 * 1000;

const role = process.argv[2];
if (role !== "admin" && role !== "member") {
  throw new Error("Usage: grant-e2e-refresh-token.mjs <admin|member>");
}
const expectedEmail = process.env.CAIRN_E2E_EXPECTED_EMAIL;
if (!expectedEmail) throw new Error("Set CAIRN_E2E_EXPECTED_EMAIL to the account being granted.");

const keyFile =
  process.env.RENDER_API_KEY_FILE ?? join(homedir(), ".config", "cairn", "render-api-key");
const renderKey = readFileSync(keyFile, "utf8").trim();

async function renderEnv() {
  const response = await fetch(
    `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars?limit=100`,
    { headers: { Authorization: `Bearer ${renderKey}` }, signal: AbortSignal.timeout(30_000) },
  );
  if (!response.ok) throw new Error(`Render env lookup failed with HTTP ${response.status}.`);
  const items = await response.json();
  return Object.fromEntries(items.map(({ envVar }) => [envVar.key, envVar.value]));
}

const env = await renderEnv();
const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) throw new Error("Render service lacks Google client settings.");

const verifier = randomBytes(32).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
const state = randomBytes(16).toString("hex");

const authQuery = new URLSearchParams({
  client_id: clientId,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope: "openid email",
  access_type: "offline",
  prompt: "consent",
  state,
  code_challenge: challenge,
  code_challenge_method: "S256",
});
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authQuery}`;

function parseCallback(rawUrl) {
  try {
    return new URL(rawUrl ?? "/", REDIRECT_URI);
  } catch {
    return undefined;
  }
}

function decodeClaims(idToken) {
  try {
    return JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString());
  } catch {
    throw new Error("ID token payload is not valid.");
  }
}

function waitForCode() {
  return new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      const url = parseCallback(request.url);
      if (url?.pathname !== "/callback") {
        response.writeHead(404).end();
        return;
      }
      const ok = url.searchParams.get("state") === state && url.searchParams.has("code");
      response.writeHead(ok ? 200 : 400, { "Content-Type": "text/plain" });
      response.end(ok ? "Grant received. You can close this tab." : "Invalid callback.");
      server.close();
      if (ok) resolve(url.searchParams.get("code"));
      else reject(new Error("Callback rejected: state mismatch or missing code."));
    });
    server.listen(PORT, "127.0.0.1");
    setTimeout(() => {
      server.close();
      reject(new Error("Timed out waiting for Google consent."));
    }, TIMEOUT_MS).unref();
  });
}

console.log(`Open this URL and sign in as the ${role} test account only:\n${authUrl}\n`);
const code = await waitForCode();

const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    code_verifier: verifier,
  }),
  signal: AbortSignal.timeout(30_000),
});
if (!tokenResponse.ok) throw new Error(`Token exchange failed with HTTP ${tokenResponse.status}.`);
const tokens = await tokenResponse.json();
if (!tokens.refresh_token || !tokens.id_token) {
  throw new Error("Google returned no refresh token. Revoke the app's access and retry.");
}

const claims = decodeClaims(tokens.id_token);
if (claims.aud !== clientId || claims.email_verified !== true) {
  throw new Error("ID token audience or verification does not match.");
}
if (claims.email?.toLowerCase() !== expectedEmail.toLowerCase()) {
  throw new Error("Signed-in account differs from CAIRN_E2E_EXPECTED_EMAIL. Nothing was stored.");
}

const secretName = `CAIRN_E2E_${role.toUpperCase()}_REFRESH_TOKEN`;
await new Promise((resolve, reject) => {
  const child = spawn(
    "gh",
    ["secret", "set", secretName, "--env", ENVIRONMENT, "--repo", REPOSITORY],
    { stdio: ["pipe", "ignore", "inherit"] },
  );
  child.on("error", reject);
  child.on("close", (status) =>
    status === 0 ? resolve() : reject(new Error(`gh secret set exited with ${status}.`)),
  );
  child.stdin.end(tokens.refresh_token);
});
console.log(`${secretName} stored. Account matched; no token was printed.`);
