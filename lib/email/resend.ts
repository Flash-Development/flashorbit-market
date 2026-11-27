import "server-only";
import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import { createLogger } from "@/lib/logging/logger";

export type ResendEmailConfig = {
  apiKey: string;
  from: string;
  verificationTemplateId: string;
  baseUrl?: string;
};

type VerificationEmail = {
  email: string;
  name: string;
  url: string;
};

const maxAttempts = 3;

export function getResendEmailConfig(
  env: Record<string, string | undefined> = process.env,
): ResendEmailConfig {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.RESEND_FROM_EMAIL?.trim();
  const verificationTemplateId = env.RESEND_VERIFICATION_TEMPLATE_ID?.trim();
  if (!apiKey || !from || !verificationTemplateId) {
    throw new Error(
      "Resend email delivery requires RESEND_API_KEY, RESEND_FROM_EMAIL, and RESEND_VERIFICATION_TEMPLATE_ID.",
    );
  }
  return { apiKey, from, verificationTemplateId };
}

function isRetryableStatus(status: number | null) {
  return status === 429 || (status !== null && status >= 500 && status < 600);
}

function isRetryableError(error: { name: string; statusCode: number | null }) {
  return isRetryableStatus(error.statusCode) ||
    (error.name === "application_error" && error.statusCode === null);
}

function retryDelay(headers: Record<string, string> | null, attempt: number) {
  const retryAfter = headers?.["retry-after"];
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) {
      return Math.min(5_000, Math.max(0, seconds * 1_000));
    }
    const dateDelay = Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(dateDelay)) {
      return Math.min(5_000, Math.max(0, dateDelay));
    }
  }
  return Math.min(2_000, 250 * 2 ** attempt);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function sendVerificationEmail(
  email: VerificationEmail,
  config: ResendEmailConfig = getResendEmailConfig(),
) {
  const recipientDomain = email.email.split("@").at(-1)?.toLowerCase() ?? "unknown";
  const logger = createLogger({
    component: "resend-email",
    recipientDomain,
    templateId: config.verificationTemplateId,
  });
  logger.info("Verification email requested");
  const client = new Resend(
    config.apiKey,
    config.baseUrl ? { baseUrl: config.baseUrl } : undefined,
  );
  const payload = {
    from: config.from,
    to: email.email,
    subject: "Verify your Flash Orbit account",
    template: {
      id: config.verificationTemplateId,
      variables: {
        USER_NAME: email.name || "there",
        VERIFICATION_URL: email.url,
      },
    },
  };
  const idempotencyKey = `verify-email/${randomUUID()}`;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response: Awaited<ReturnType<Resend["emails"]["send"]>>;
    try {
      response = await client.emails.send(payload, {
        idempotencyKey,
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        logger.error("Resend verification request failed", {
          attempt: attempt + 1,
          errorType: error instanceof Error ? error.name : "UnknownError",
        });
        throw new Error("Verification email could not be sent.");
      }
      await wait(250 * 2 ** attempt);
      continue;
    }

    if (!response.error) {
      logger.info("Resend accepted a verification email", {
        emailId: response.data.id,
        attempt: attempt + 1,
      });
      return response.data.id;
    }

    if (!isRetryableError(response.error) || attempt === maxAttempts - 1) {
      logger.error("Resend rejected a verification email", {
        code: response.error.name,
        statusCode: response.error.statusCode,
        failureType: response.error.statusCode === null
          ? "network_or_timeout"
          : "provider_rejected",
        attempt: attempt + 1,
      });
      throw new Error("Verification email could not be sent.");
    }
    logger.warn("Retrying transient Resend verification failure", {
      code: response.error.name,
      statusCode: response.error.statusCode,
      attempt: attempt + 1,
    });
    await wait(retryDelay(response.headers, attempt));
  }

  throw new Error("Verification email could not be sent.");
}
