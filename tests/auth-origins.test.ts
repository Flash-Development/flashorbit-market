import assert from "node:assert/strict";
import test from "node:test";
import {
  getTrustedOrigins,
  isTrustedRequestOrigin,
} from "../lib/auth/trusted-origins";
import { normalizeVerificationEmailResponse } from "../lib/auth/verification-response";

test("trusted origins include configured origins and the auth base origin", () => {
  const previousTrusted = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  const previousBase = process.env.BETTER_AUTH_URL;
  process.env.BETTER_AUTH_TRUSTED_ORIGINS =
    "http://localhost:3000, http://127.0.0.1:3000";
  process.env.BETTER_AUTH_URL = "http://127.0.0.1:3000/path";
  try {
    assert.deepEqual(
      getTrustedOrigins().sort(),
      ["http://127.0.0.1:3000", "http://localhost:3000"],
    );
  } finally {
    if (previousTrusted === undefined) {
      delete process.env.BETTER_AUTH_TRUSTED_ORIGINS;
    } else {
      process.env.BETTER_AUTH_TRUSTED_ORIGINS = previousTrusted;
    }
    if (previousBase === undefined) {
      delete process.env.BETTER_AUTH_URL;
    } else {
      process.env.BETTER_AUTH_URL = previousBase;
    }
  }
});

test("request origin checks reject absent, malformed, and untrusted origins", () => {
  const previousTrusted = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  const previousBase = process.env.BETTER_AUTH_URL;
  process.env.BETTER_AUTH_TRUSTED_ORIGINS =
    "http://localhost:3000,http://127.0.0.1:3000";
  process.env.BETTER_AUTH_URL = "http://127.0.0.1:3000";
  try {
    assert.equal(isTrustedRequestOrigin("http://localhost:3000"), true);
    assert.equal(isTrustedRequestOrigin("http://127.0.0.1:3000"), true);
    assert.equal(isTrustedRequestOrigin("http://localhost:3000/path"), false);
    assert.equal(isTrustedRequestOrigin("https://attacker.example"), false);
    assert.equal(isTrustedRequestOrigin(null), false);
  } finally {
    if (previousTrusted === undefined) {
      delete process.env.BETTER_AUTH_TRUSTED_ORIGINS;
    } else {
      process.env.BETTER_AUTH_TRUSTED_ORIGINS = previousTrusted;
    }
    if (previousBase === undefined) {
      delete process.env.BETTER_AUTH_URL;
    } else {
      process.env.BETTER_AUTH_URL = previousBase;
    }
  }
});

test("verification email server failures become retryable, safe responses", async () => {
  const response = normalizeVerificationEmailResponse(
    Response.json({
      message: "provider failure with private details",
      token: "secret-verification-token",
    }, { status: 500 }),
    "flash-request-123",
  );
  const body = await response.json() as { code: string; message: string };
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("retry-after"), "30");
  assert.equal(response.headers.get("x-request-id"), "flash-request-123");
  assert.equal(body.code, "VERIFICATION_EMAIL_UNAVAILABLE");
  assert.match(body.message, /try again shortly/);
  assert.doesNotMatch(JSON.stringify(body), /private details|secret-verification-token/);
});

test("verification email client errors are not rewritten", async () => {
  const response = Response.json({ code: "BAD_REQUEST" }, { status: 400 });
  assert.equal(normalizeVerificationEmailResponse(response, "request-id"), response);
});
