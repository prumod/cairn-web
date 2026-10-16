const sha = process.env.DEPLOYED_SHA;
if (!sha || !/^[a-f0-9]{40}$/i.test(sha))
  throw new Error("DEPLOYED_SHA must be a full commit SHA.");

const healthURL = process.env.CAIRN_TESTING_HEALTH_URL;
if (!healthURL) throw new Error("CAIRN_TESTING_HEALTH_URL is required.");
let healthTarget;
try {
  healthTarget = new URL(healthURL);
} catch {
  throw new Error("CAIRN_TESTING_HEALTH_URL must be a valid URL.");
}
if (
  healthTarget.protocol !== "https:" ||
  healthTarget.hostname !== "cairn-testing.onrender.com" ||
  healthTarget.pathname !== "/healthz"
)
  throw new Error("CAIRN_TESTING_HEALTH_URL must target the testing health endpoint.");
for (let attempt = 0; attempt < 120; attempt += 1) {
  try {
    const response = await fetch(healthURL, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (response.ok) {
      const health = await response.json();
      if (health?.status === "ready" && health.revision === sha) {
        console.log(`Testing service is ready at ${sha}.`);
        process.exit(0);
      }
    }
  } catch {
    // Render cold starts and deploy transitions can briefly make healthz unavailable.
  }
  if (attempt % 6 === 0) console.log(`Waiting for testing service revision ${sha}.`);
  await new Promise((resolve) => setTimeout(resolve, 10_000));
}
throw new Error(`Testing service did not become ready at ${sha} within 30 minutes.`);
