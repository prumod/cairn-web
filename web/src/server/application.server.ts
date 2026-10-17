import { sql } from "drizzle-orm";
import { getAccess, changeApproval, listUsers } from "./modules/access/access.js";
import {
  getCompanyProfile,
  saveCompanyProfile,
  parseCompanyProfile,
} from "./modules/company/profile.js";
import { getRuntime } from "./runtime.server.js";

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

async function protect(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "Invalid JSON." }, 400);
    console.error("Request failed.");
    return json({ error: "Request failed. Try again." }, 500);
  }
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
  return protect(async () => {
    const runtime = await getRuntime();
    try {
      await runtime.db.run(sql.raw("SELECT 1"));
      return json({ status: "ready", revision: runtime.config.revision });
    } catch {
      return json({ status: "unavailable" }, 503);
    }
  });
}

export function getCurrentUser(request: Request) {
  return protect(async () => {
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

export function getUsers(request: Request) {
  return protect(async () => {
    const current = await signedIn(request);
    if (!current.session) return json({ error: "Sign in required." }, 401);
    if (!current.access?.administrator || !current.access.approved) {
      return json({ error: "Administrator access required." }, 403);
    }
    return json(await listUsers(current.runtime.db));
  });
}

export function updateUserAccess(request: Request, userId: string) {
  return protect(async () => {
    const runtime = await getRuntime();
    if (!sameOrigin(request, runtime.config.origin)) {
      return json({ error: "Same-origin request required." }, 403);
    }
    const current = await signedIn(request);
    if (!current.session) return json({ error: "Sign in required." }, 401);
    if (!current.access?.administrator || !current.access.approved) {
      return json({ error: "Administrator access required." }, 403);
    }
    const body: unknown = await request.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("approved" in body) ||
      typeof body.approved !== "boolean"
    ) {
      return json({ error: "Approval must be true or false." }, 400);
    }
    if (userId === current.session.user.id) {
      return json({ error: "You cannot change your own access." }, 400);
    }
    const updated = await changeApproval(current.runtime.db, userId, body.approved);
    if (!updated) return json({ error: "User not found." }, 404);
    return json({ approved: body.approved });
  });
}

export function getCompanyProfileRoute(request: Request) {
  return protect(async () => {
    const current = await signedIn(request);
    if (!current.session) return json({ error: "Sign in required." }, 401);
    if (!current.access?.approved) return json({ error: "Account awaits approval." }, 403);
    return json(await getCompanyProfile(current.runtime.db));
  });
}

export function updateCompanyProfile(request: Request) {
  return protect(async () => {
    const runtime = await getRuntime();
    if (!sameOrigin(request, runtime.config.origin)) {
      return json({ error: "Same-origin request required." }, 403);
    }
    const current = await signedIn(request);
    if (!current.session) return json({ error: "Sign in required." }, 401);
    if (!current.access?.approved) return json({ error: "Account awaits approval." }, 403);
    const body: unknown = await request.json();
    const profile = parseCompanyProfile(body);
    if (!profile) {
      return json(
        { error: "Name and address are required; radius must be a positive number." },
        400,
      );
    }
    return json(await saveCompanyProfile(current.runtime.db, profile));
  });
}
