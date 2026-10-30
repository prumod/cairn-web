import { createTestApplication } from "../apps/web/tests/support/testSupport.js";

const application = await createTestApplication(4173, { testControlProxy: true });
let closing: Promise<void> | undefined;

async function close() {
  closing ??= application.close().then(() => process.exit(0));
  await closing;
}

// Playwright signals the process group, and the wrapper also forwards the signal.
// Keep the idempotent handler installed until async teardown has finished.
process.on("SIGTERM", close);

process.on("SIGINT", close);
