import { getRequest, setResponseHeader, setResponseStatus } from "@tanstack/react-start/server";
import { getRuntime } from "../../../server/runtime.server";
import { getAccess } from "../../../server/modules/access/access";
import { AccessError } from "../domain/access";
import { failureResponse } from "./failureResponse.server";

export function privateResponse() {
  setResponseHeader("Cache-Control", "no-store");
}

function fail(message: string, status: number): never {
  setResponseStatus(status);
  throw new Error(message);
}

export async function authenticatedContext() {
  const request = getRequest();
  const runtime = await getRuntime();
  const session = await runtime.auth.api.getSession({ headers: request.headers });

  if (!session) fail("Sign in required.", 401);
  const access = await getAccess(runtime.db, session.user.id, runtime.config.bootstrapEmail);

  return { runtime, request, actor: { id: session.user.id, ...access } };
}

export function requireSameOrigin(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin) fail("Same-origin request required.", 403);
}

export async function respond<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (!(error instanceof AccessError)) throw error;

    const { message, status } = failureResponse(error.reason);

    return fail(message, status);
  }
}
