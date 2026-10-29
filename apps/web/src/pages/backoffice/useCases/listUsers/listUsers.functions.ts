import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { listUsers as execute } from "./listUsers";
import { authenticatedContext, privateResponse, respond } from "../context.server";
import { usersRepository } from "../../infra/users.server";

const noStore = createMiddleware({ type: "function" }).server(({ next }) => {
  privateResponse();

  return next();
});

export const listUsers = createServerFn({ method: "GET" })
  .middleware([noStore])
  .handler(() =>
    respond(async () => {
      const context = await authenticatedContext();

      return execute(context.actor, usersRepository(context.runtime.db));
    }),
  );
