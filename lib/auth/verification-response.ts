import { createLogger } from "@/lib/logging/logger";

export function normalizeVerificationEmailResponse(
  response: Response,
  requestId: string,
) {
  if (response.status < 500) return response;

  createLogger({
    requestId,
    component: "auth-api",
    endpoint: "send-verification-email",
  }).error("Verification email endpoint failed", {
    upstreamStatus: response.status,
  });

  return Response.json(
    {
      code: "VERIFICATION_EMAIL_UNAVAILABLE",
      message: "We couldn't send a verification email. Please try again shortly.",
    },
    {
      status: 503,
      headers: {
        "cache-control": "no-store",
        "retry-after": "30",
        "x-request-id": requestId,
      },
    },
  );
}
