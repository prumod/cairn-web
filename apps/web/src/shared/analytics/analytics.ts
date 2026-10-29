import type { PostHog, Properties } from "posthog-js";
import { z } from "zod";

type ProductEvent =
  | "company_profile_viewed"
  | "company_profile_save_attempted"
  | "company_profile_save_succeeded"
  | "company_profile_save_failed";

export type EventProperties = { status?: number; request_id?: string };

type AnalyticsSdk = Pick<PostHog, "init" | "identify" | "capture" | "captureException" | "reset">;

const AnalyticsConfig = z.object({
  token: z.string().regex(/^phc_[A-Za-z0-9]+$/),
  host: z.literal("https://eu.i.posthog.com"),
});

function removeLocationProperties(properties: Properties) {
  for (const key of Object.keys(properties)) {
    if (/url|referrer|referring_domain|pathname|search/i.test(key)) delete properties[key];
  }

  for (const key of ["$set", "$set_once"]) {
    const value = properties[key];

    if (value instanceof Object && !Array.isArray(value)) removeLocationProperties(value);
  }
}

function recordBrowserErrors(posthog: AnalyticsSdk) {
  window.addEventListener("error", (event) => {
    const safe = new Error("Unexpected browser error");
    safe.stack = "Error: Unexpected browser error";
    let sourceFile: string | undefined;

    try {
      const source = new URL(event.filename, window.location.origin);

      if (
        source.origin === window.location.origin &&
        /^\/assets\/[\w.-]+\.js$/.test(source.pathname)
      ) {
        sourceFile = source.pathname;
      }
    } catch {
      // An invalid source URL is omitted from diagnostics.
    }

    try {
      posthog.captureException(
        safe,
        sourceFile
          ? { source_file: sourceFile, line: event.lineno, column: event.colno }
          : undefined,
      );
    } catch {
      // Error reporting must not create another application error.
    }
  });
  window.addEventListener("unhandledrejection", () => {
    const safe = new Error("Unhandled browser rejection");
    safe.stack = "Error: Unhandled browser rejection";

    try {
      posthog.captureException(safe);
    } catch {
      // Error reporting must not create another application error.
    }
  });
}

export function createAnalytics(loadSdk: () => Promise<AnalyticsSdk>) {
  let client: AnalyticsSdk | null = null;
  let pending: Promise<AnalyticsSdk | null> | undefined;
  let identityGeneration = 0;

  async function getClient(): Promise<AnalyticsSdk | null> {
    if (typeof window === "undefined") return null;

    if (client) return client;

    if (!pending) {
      const generation = identityGeneration;
      pending = (async () => {
        const response = await fetch("/api/analytics-config", { cache: "no-store" });

        if (!response.ok) throw new Error("Analytics configuration unavailable");
        const parsed = AnalyticsConfig.safeParse(await response.json());

        if (!parsed.success) return null;
        const config = parsed.data;
        const posthog = await loadSdk();

        if (generation !== identityGeneration) return null;
        posthog.init(config.token, {
          api_host: config.host,
          persistence: "memory",
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
          capture_exceptions: false,
          capture_performance: false,
          enable_recording_console_log: false,
          session_recording: {
            maskAllInputs: true,
            maskTextSelector: "*",
            maskAllElementAttributes: true,
            blockSelector: 'input[type="hidden"], input[type="file"], img, video, canvas',
            recordBody: false,
            recordHeaders: false,
            maskCapturedNetworkRequestFn: (request) => {
              if (request.name) {
                try {
                  request.name = new URL(request.name, window.location.origin).origin;
                } catch {
                  return null;
                }
              }

              return request;
            },
          },
          before_send: (event) => {
            if (event.event !== "$snapshot") removeLocationProperties(event.properties);

            return event;
          },
        });
        client = posthog;
        recordBrowserErrors(posthog);

        return client;
      })().catch(() => {
        if (generation === identityGeneration) pending = undefined;

        return null;
      });
    }

    return pending;
  }

  async function identify(userId: string) {
    const generation = identityGeneration;
    const posthog = await getClient();

    if (generation === identityGeneration) {
      try {
        posthog?.identify(userId);
      } catch {
        // Analytics must not interrupt sign-in.
      }
    }
  }

  async function track(event: ProductEvent, properties?: EventProperties) {
    const generation = identityGeneration;
    const posthog = await getClient();

    if (generation === identityGeneration) {
      try {
        posthog?.capture(event, properties);
      } catch {
        // Analytics must not interrupt the user's action.
      }
    }
  }

  async function reset() {
    identityGeneration++;
    pending = undefined;

    try {
      client?.reset();
    } catch {
      // Analytics must not interrupt sign-out.
    }
  }

  return { identify, track, reset };
}

export const { identify, track, reset } = createAnalytics(
  async () => (await import("posthog-js")).default,
);
