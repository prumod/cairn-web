function errorType(error: unknown) {
  if (error instanceof TypeError) return "TypeError";
  if (error instanceof RangeError) return "RangeError";
  if (error instanceof SyntaxError) return "SyntaxError";
  if (error instanceof Error) return "Error";
  return "Unknown";
}

export class DependencyUnavailable extends Error {
  constructor(cause: unknown) {
    super("Dependency unavailable", { cause });
  }
}

function safeFrames(error: unknown) {
  if (!(error instanceof Error) || !error.stack) return [];
  return error.stack
    .split("\n")
    .slice(1)
    .map((line) => line.match(/^\s*at ([\w.$]+) \([^()\s?#]*\/([\w.-]+\.(?:js|ts)):(\d+):(\d+)\)$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .slice(0, 5)
    .map((match) => `${match[1]} ${match[2]}:${match[3]}:${match[4]}`);
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
