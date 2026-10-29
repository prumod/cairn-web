import { sql } from "drizzle-orm";
import { afterEach, expect, test, vi } from "vitest";
import { createDb } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
});

test.each([
  ["ep-example-123456.us-east-2.aws.neon.tech", "https://api.us-east-2.aws.neon.tech/sql"],
  ["ep-example-123456-pooler.us-east-2.aws.neon.tech", "https://api.us-east-2.aws.neon.tech/sql"],
  ["db.localtest.me:4444", "http://127.0.0.1:4444/sql"],
])("database queries for %s use the correct HTTP endpoint", async (host, endpoint) => {
  const fetchMock = vi.fn().mockResolvedValue(
    Response.json({
      fields: [{ name: "value", dataTypeID: 23 }],
      rows: [["1"]],
      command: "SELECT",
      rowCount: 1,
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  const db = createDb({ DATABASE_URL: `postgresql://test:test@${host}/test` });
  await db.execute(sql`SELECT 1 AS value`);

  expect(fetchMock).toHaveBeenCalledOnce();
  expect(fetchMock.mock.calls[0]?.[0]).toBe(endpoint);
});
