import { sql } from "drizzle-orm";
import { getAccess } from "./modules/access/access.js";
import { getRuntime } from "./runtime.server.js";
import { ENV } from "../env.server.js";
import { DependencyUnavailable, handleRequest } from "./shared/observability/observability.js";
import { publicAnalyticsConfig } from "./shared/observability/analyticsConfig.js";

function json<Body>(value: Body, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

function protect(operation: string, action: () => Promise<Response>) {
  return handleRequest(operation, ENV.GIT_SHA ?? "local", action);
}

async function signedIn(request: Request) {
  const runtime = await getRuntime();
  const session = await runtime.auth.api.getSession({ headers: request.headers });

  if (!session) return { runtime, session: null, access: null };
  const access = await getAccess(runtime.db, session.user.id, runtime.config.bootstrapEmail);

  return { runtime, session, access };
}

export function getHealth() {
  return protect("health", async () => {
    const runtime = await getRuntime();

    try {
      await runtime.db.execute(sql.raw("SELECT 1"));
    } catch (error) {
      throw new DependencyUnavailable(error);
    }

    return json({ status: "ready", revision: runtime.config.revision });
  });
}

export function getCurrentUser(request: Request) {
  return protect("get_current_user", async () => {
    const current = await signedIn(request);

    if (!current.session || !current.access) return json(null);

    return json({
      id: current.session.user.id,
      email: current.session.user.email,
      approved: current.access.approved,
      administrator: current.access.administrator,
    });
  });
}

export function getAnalyticsConfig() {
  return protect("get_analytics_config", async () =>
    json(publicAnalyticsConfig(ENV.DEPLOYMENT_STAGE, ENV.POSTHOG_PROJECT_TOKEN)),
  );
}
