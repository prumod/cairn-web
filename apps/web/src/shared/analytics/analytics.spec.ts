// @vitest-environment jsdom
import type { PostHog } from "posthog-js";
import { afterEach, expect, test, vi } from "vitest";
import { createAnalytics } from "./analytics.js";

function fakeSdk() {
  return {
    init: vi.fn<PostHog["init"]>(),
    identify: vi.fn<PostHog["identify"]>(),
    capture: vi.fn<PostHog["capture"]>(),
    captureException: vi.fn<PostHog["captureException"]>(),
    reset: vi.fn<PostHog["reset"]>(),
  };
}

function productionConfig() {
  return Response.json({ token: "phc_synthetic", host: "https://eu.i.posthog.com" });
}

afterEach(() => vi.unstubAllGlobals());

test("a nonproduction configuration never initializes or sends analytics", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(null)),
  );
  const sdk = fakeSdk();
  const analytics = createAnalytics(async () => sdk);
  await analytics.track("company_profile_viewed");
  await analytics.identify("synthetic-user");
  expect(sdk.init).not.toHaveBeenCalled();
  expect(sdk.capture).not.toHaveBeenCalled();
});

test("production identifies by opaque ID and masks replay before emitting a product event", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => productionConfig()),
  );
  const sdk = fakeSdk();
  const analytics = createAnalytics(async () => sdk);
  await analytics.identify("synthetic-user");
  await analytics.track("company_profile_viewed");
  expect(sdk.init).toHaveBeenCalledOnce();
  expect(sdk.init).toHaveBeenCalledWith(
    "phc_synthetic",
    expect.objectContaining({
      api_host: "https://eu.i.posthog.com",
      persistence: "memory",
      autocapture: false,
      enable_recording_console_log: false,
      session_recording: expect.objectContaining({
        maskAllInputs: true,
        maskTextSelector: "*",
        maskAllElementAttributes: true,
        recordBody: false,
        recordHeaders: false,
      }),
    }),
  );
  expect(sdk.identify).toHaveBeenCalledWith("synthetic-user");
  expect(sdk.capture).toHaveBeenCalledWith("company_profile_viewed", undefined);

  const config = sdk.init.mock.calls[0]?.[1];
  const beforeSend = config?.before_send;
  const maskRequest = config?.session_recording?.maskCapturedNetworkRequestFn;

  if (!beforeSend || Array.isArray(beforeSend) || !maskRequest) {
    throw new Error("Analytics was initialized without its privacy hooks.");
  }

  expect(
    beforeSend({
      uuid: "synthetic-event",
      event: "company_profile_viewed",
      properties: {
        $current_url: "https://example.test/?token=secret",
        $set: { $referrer: "secret" },
      },
    })?.properties,
  ).toEqual({ $set: {} });
  expect(
    maskRequest({
      name: "https://example.test/?token=secret",
      entryType: "resource",
      startTime: 0,
      duration: 0,
    }),
  ).toMatchObject({ name: "https://example.test" });
  window.dispatchEvent(
    new ErrorEvent("error", {
      message: "private company data",
      filename: `${window.location.origin}/assets/index.js?token=secret`,
      lineno: 12,
      colno: 8,
    }),
  );
  const [reportedError, metadata] = sdk.captureException.mock.calls[0] ?? [];
  expect(reportedError).toMatchObject({
    message: "Unexpected browser error",
    stack: "Error: Unexpected browser error",
  });
  expect(metadata).toEqual({ source_file: "/assets/index.js", line: 12, column: 8 });
  await analytics.reset();
  expect(sdk.reset).toHaveBeenCalledOnce();
});

test("sign-out while analytics is loading does not start an identified session", async () => {
  let respond!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve;
        }),
    ),
  );
  const sdk = fakeSdk();
  const analytics = createAnalytics(async () => sdk);
  const identifying = analytics.identify("synthetic-user");
  await analytics.reset();
  respond(productionConfig());
  await identifying;
  expect(sdk.init).not.toHaveBeenCalled();
  expect(sdk.identify).not.toHaveBeenCalled();
});

test("reset clears the previous identity before a different user is identified", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => productionConfig()),
  );
  const sdk = fakeSdk();
  const analytics = createAnalytics(async () => sdk);
  await analytics.identify("first-user");
  await analytics.reset();
  await analytics.identify("second-user");
  expect(sdk.reset).toHaveBeenCalledOnce();
  expect(sdk.identify).toHaveBeenNthCalledWith(1, "first-user");
  expect(sdk.identify).toHaveBeenNthCalledWith(2, "second-user");
  expect(sdk.reset.mock.invocationCallOrder[0]).toBeLessThan(
    sdk.identify.mock.invocationCallOrder[1]!,
  );
});
