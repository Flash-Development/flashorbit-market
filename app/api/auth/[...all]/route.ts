import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/better-auth";
import { getRequestId } from "@/lib/logging/logger";
import { normalizeVerificationEmailResponse } from "@/lib/auth/verification-response";

const handlers = toNextJsHandler(auth);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const response = await handlers.POST(request);
  const isVerificationSend =
    new URL(request.url).pathname.endsWith("/send-verification-email");

  return isVerificationSend
    ? normalizeVerificationEmailResponse(response, requestId)
    : response;
}
