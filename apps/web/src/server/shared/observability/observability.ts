function errorType(cause: unknown) {
  if (cause instanceof TypeError) return "TypeError";

  if (cause instanceof RangeError) return "RangeError";

  if (cause instanceof SyntaxError) return "SyntaxError";

  if (cause instanceof Error) return "Error";

  return "Unknown";
}

export class DependencyUnavailable extends Error {
  constructor(cause: unknown) {
    super("Dependency unavailable", { cause });
  }
}

function safeFrames(cause: unknown) {
  if (!(cause instanceof Error) || !cause.stack) return [];

  return cause.stack
    .split("\n")
    .map((line) => {
      const match = line.match(
        /^\s*at (?:async )?(?:(?<function>[\w.$]+) )?\(?(?<location>[^()\s?#]+):(?<line>\d+):(?<column>\d+)\)?$/,
      );

      if (!match?.groups) return undefined;
      const filename = match.groups.location?.split(/[\\/]/).at(-1);

      if (!filename || !/^[\w.-]+\.(?:[cm]?js|ts)$/.test(filename)) return undefined;

      return `${match.groups.function ? `${match.groups.function} ` : ""}${filename}:${match.groups.line}:${match.groups.column}`;
    })
    .filter((frame): frame is string => frame !== undefined)
    .slice(0, 5);
}

export async function handleRequest(
  operation: string,
  revision: string,
  action: () => Promise<Response>,
) {
  const requestId = crypto.randomUUID();
  const started = performance.now();
  let response: Response;

  try {
    response = await action();
  } catch (error) {
    if (error instanceof SyntaxError) {
      response = Response.json({ error: "Invalid JSON." }, { status: 400 });
    } else {
      const cause = error instanceof DependencyUnavailable ? error.cause : error;
      console.error({
        event: "request_failed",
        operation,
        requestId,
        revision,
        durationMs: Math.round(performance.now() - started),
        errorType: errorType(cause),
        stack: safeFrames(cause),
      });
      response =
        error instanceof DependencyUnavailable
          ? Response.json({ status: "unavailable" }, { status: 503 })
          : Response.json({ error: "Request failed. Try again." }, { status: 500 });
    }
  }

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Request-ID", requestId);

  return response;
}
