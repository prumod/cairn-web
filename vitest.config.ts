import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "{web,backend,shared}/src/**/*.{spec,test}.{ts,tsx}",
      "{web,backend}/tests/{acceptance,typical}/integration/**/*.{spec,test}.{ts,tsx}",
    ],
    allowOnly: false,
  },
});
