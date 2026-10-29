import { sql } from "drizzle-orm";
import { z } from "zod";
import { getAccess, changeApproval, listUsers } from "./modules/access/access.js";
import {
  CompanyProfile,
  getCompanyProfile,
  saveCompanyProfile,
} from "./modules/company/profile.js";
import { getRuntime } from "./runtime.server.js";
import { ENV } from "../env.server.js";
import { DependencyUnavailable, handleRequest } from "./shared/observability/observability.js";
import { publicAnalyticsConfig } from "./shared/observability/analyticsConfig.js";

const ApprovalChange = z.object({ approved: z.boolean() });

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

function sameOrigin(request: Request, expectedOrigin: string) {
  return request.headers.get("origin") === expectedOrigin;
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

export function getUsers(request: Request) {
  return protect("list_users", async () => {
    const current = await signedIn(request);

    if (!current.session) return json({ error: "Sign in required." }, 401);

    if (!current.access?.administrator || !current.access.approved) {
      return json({ error: "Administrator access required." }, 403);
    }

    return json(await listUsers(current.runtime.db));
  });
}

export function updateUserAccess(request: Request, userId: string) {
  return protect("update_user_access", async () => {
    const runtime = await getRuntime();

    if (!sameOrigin(request, runtime.config.origin)) {
      return json({ error: "Same-origin request required." }, 403);
    }

    const current = await signedIn(request);

    if (!current.session) return json({ error: "Sign in required." }, 401);

    if (!current.access?.administrator || !current.access.approved) {
      return json({ error: "Administrator access required." }, 403);
    }

    const change = ApprovalChange.safeParse(await request.json());

    if (!change.success) return json({ error: "Approval must be true or false." }, 400);

    if (userId === current.session.user.id) {
      return json({ error: "You cannot change your own access." }, 400);
    }

    const updated = await changeApproval(current.runtime.db, userId, change.data.approved);

    if (!updated) return json({ error: "User not found." }, 404);

    return json({ approved: change.data.approved });
  });
}

export function getCompanyProfileRoute(request: Request) {
  return protect("get_company_profile", async () => {
    const current = await signedIn(request);

    if (!current.session) return json({ error: "Sign in required." }, 401);

    if (!current.access?.approved) return json({ error: "Account awaits approval." }, 403);

    return json(await getCompanyProfile(current.runtime.db));
  });
}

export function updateCompanyProfile(request: Request) {
  return protect("save_company_profile", async () => {
    const runtime = await getRuntime();

    if (!sameOrigin(request, runtime.config.origin)) {
      return json({ error: "Same-origin request required." }, 403);
    }

    const current = await signedIn(request);

    if (!current.session) return json({ error: "Sign in required." }, 401);

    if (!current.access?.approved) return json({ error: "Account awaits approval." }, 403);
    const profile = CompanyProfile.safeParse(await request.json());

    if (!profile.success) {
      return json(
        { error: "Name and address are required; radius must be a positive number." },
        400,
      );
    }

    return json(await saveCompanyProfile(current.runtime.db, profile.data));
  });
}
