import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import test from "node:test";
import {
  getResendEmailConfig,
  sendVerificationEmail,
} from "../lib/email/resend";

async function readBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

async function startServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
) {
  const server = createServer(handler);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Test email server did not bind to a TCP port.");
  }
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

function closeServer(server: ReturnType<typeof createServer>) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

const emailInput = {
  email: "seller@example.test",
  name: "Flash Orbit Seller",
  url: "https://flash-orbit.example/verify?token=private-token",
};

function config(baseUrl: string) {
  return {
    apiKey: "re_test_key",
    from: "Flash Orbit <auth@mail.example.test>",
    verificationTemplateId: "template_test",
    baseUrl,
  };
}

test("Resend verification uses the published template and required variables", async (context) => {
  const requests: Array<{
    authorization: string | undefined;
    idempotencyKey: string | string[] | undefined;
    body: unknown;
  }> = [];
  const { server, baseUrl } = await startServer(async (request, response) => {
    requests.push({
      authorization: request.headers.authorization,
      idempotencyKey: request.headers["idempotency-key"],
      body: await readBody(request),
    });
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ id: "email_test_id" }));
  });
  context.after(() => closeServer(server));

  const emailId = await sendVerificationEmail(emailInput, config(baseUrl));

  assert.equal(emailId, "email_test_id");
  assert.equal(requests.length, 1);
  assert.equal(requests[0]?.authorization, "Bearer re_test_key");
  assert.ok(requests[0]?.idempotencyKey);
  assert.deepEqual(requests[0]?.body, {
    from: "Flash Orbit <auth@mail.example.test>",
    to: "seller@example.test",
    subject: "Verify your Flash Orbit account",
    template: {
      id: "template_test",
      variables: {
        USER_NAME: "Flash Orbit Seller",
        VERIFICATION_URL: emailInput.url,
      },
    },
  });
});

test("Resend retries transient application errors without logging the address or verification URL", async (context) => {
  let attempts = 0;
  const logs: string[] = [];
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  console.info = (line: string) => logs.push(line);
  console.warn = (line: string) => logs.push(line);
  console.error = (line: string) => logs.push(line);
  context.after(() => {
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
  });
  const { server, baseUrl } = await startServer(async (request, response) => {
    attempts += 1;
    await readBody(request);
    if (attempts < 3) {
      response.writeHead(503, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        statusCode: null,
        name: "application_error",
        message: "Unable to fetch data. The request could not be resolved.",
      }));
      return;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ id: "email_recovered_id" }));
  });
  context.after(() => closeServer(server));

  const emailId = await sendVerificationEmail(emailInput, config(baseUrl));
  const logText = logs.join("\n");

  assert.equal(emailId, "email_recovered_id");
  assert.equal(attempts, 3);
  assert.ok(logText.includes('"recipientDomain":"example.test"'));
  assert.ok(logText.includes("Retrying transient Resend verification failure"));
  assert.ok(!logText.includes(emailInput.email));
  assert.ok(!logText.includes(emailInput.url));
  assert.ok(!logText.includes("private-token"));
});

test("Resend retries a rate-limited verification send with the same idempotency key", async (context) => {
  let attempts = 0;
  const keys: Array<string | string[] | undefined> = [];
  const { server, baseUrl } = await startServer(async (request, response) => {
    attempts += 1;
    keys.push(request.headers["idempotency-key"]);
    await readBody(request);
    if (attempts === 1) {
      response.writeHead(429, {
        "Content-Type": "application/json",
        "Retry-After": "0",
      });
      response.end(JSON.stringify({
        statusCode: 429,
        name: "rate_limit_exceeded",
        message: "Too many requests",
      }));
      return;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ id: "email_retry_id" }));
  });
  context.after(() => closeServer(server));

  const emailId = await sendVerificationEmail(emailInput, config(baseUrl));

  assert.equal(emailId, "email_retry_id");
  assert.equal(attempts, 2);
  assert.equal(keys[0], keys[1]);
});

test("Resend does not retry non-retryable client errors", async (context) => {
  let attempts = 0;
  const { server, baseUrl } = await startServer(async (request, response) => {
    attempts += 1;
    await readBody(request);
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      statusCode: 400,
      name: "invalid_from_address",
      message: "Invalid sender",
    }));
  });
  context.after(() => closeServer(server));

  await assert.rejects(
    sendVerificationEmail(emailInput, config(baseUrl)),
    /Verification email could not be sent/,
  );
  assert.equal(attempts, 1);
});

test("Resend configuration requires the app sending key, sender, and published template", () => {
  assert.throws(
    () => getResendEmailConfig({ RESEND_SETUP_API_KEY: "full-access-key" }),
    /RESEND_API_KEY, RESEND_FROM_EMAIL, and RESEND_VERIFICATION_TEMPLATE_ID/,
  );
});
