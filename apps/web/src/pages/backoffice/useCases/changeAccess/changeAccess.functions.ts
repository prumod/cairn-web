import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { changeAccess as execute } from "./changeAccess";
import {
  authenticatedContext,
  privateResponse,
  respond,
  requireSameOrigin,
} from "../context.server";
import { usersRepository } from "../../infra/users.server";

const noStore = createMiddleware({ type: "function" }).server(({ next }) => {
  privateResponse();

  return next();
});

export const changeAccess = createServerFn({ method: "POST" })
  .middleware([noStore])
  .validator(z.object({ userId: z.string().min(1), approved: z.boolean() }))
  .handler(({ data }) =>
    respond(async () => {
      const context = await authenticatedContext();
      requireSameOrigin(context.request, context.runtime.config.origin);

      return execute(context.actor, data, usersRepository(context.runtime.db));
    }),
  );
