import { createTestApplication } from "../web/tests/acceptance/integration/testSupport.js";

const application = await createTestApplication(4173, { testControlProxy: true });
let closing: Promise<void> | undefined;

async function close() {
  closing ??= application.close().then(() => process.exit(0));
  await closing;
}

process.once("SIGTERM", close);
process.once("SIGINT", close);
