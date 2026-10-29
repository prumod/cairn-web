import { z } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly requestId: string | null = null,
  ) {
    super(message);
  }
}

const ErrorBody = z.object({ error: z.string() });

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, init);

  if (!response.ok) {
    const failure = ErrorBody.safeParse(await response.json().catch(() => null));

    const message = failure.success
      ? failure.data.error
      : "Não foi possível concluir o pedido. Tente novamente.";

    throw new ApiError(response.status, message, response.headers.get("x-request-id"));
  }

  return schema.parse(await response.json());
}

export function put<T, Body>(path: string, schema: z.ZodType<T>, body: Body) {
  return request(path, schema, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
