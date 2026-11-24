import assert from "node:assert/strict";
import test from "node:test";
import { createLogger, getRequestId } from "../lib/logging/logger";

test("request logging uses a supplied correlation id", () => {
  const request = new Request("http://localhost/api/workspaces", {
    headers: { "x-request-id": "flash-request-123" },
  });
  assert.equal(getRequestId(request), "flash-request-123");
});

test("request logging creates a correlation id when absent", () => {
  const id = getRequestId();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
});

test("logger is constructible with redaction-sensitive fields", () => {
  const logger = createLogger({
    requestId: "flash-request-123",
    authorization: "Bearer secret",
  });
  assert.equal(typeof logger.info, "function");
  assert.equal(typeof logger.error, "function");
});

test("emailId is not treated as an email address", () => {
  const originalInfo = console.info;
  let output = "";
  console.info = (line: string) => {
    output = line;
  };
  try {
    createLogger().info("resend accepted", { emailId: "email_123" });
  } finally {
    console.info = originalInfo;
  }
  assert.match(output, /email_123/);
});
