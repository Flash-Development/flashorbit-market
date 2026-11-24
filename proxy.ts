import { NextResponse, type NextRequest } from "next/server";
import { createLogger, getRequestId } from "@/lib/logging/logger";

const protectedPrefixes = ["/dashboard", "/onboarding"];

export function proxy(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const logger = createLogger({
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
  });
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname === prefix ||
    request.nextUrl.pathname.startsWith(`${prefix}/`)
  );
  if (!isProtected) {
    const response = NextResponse.next();
    response.headers.set("x-request-id", requestId);
    response.headers.set("x-content-type-options", "nosniff");
    return response;
  }
  const hasSessionCookie =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");
  if (!hasSessionCookie) {
    logger.info("Protected route denied without a session", {
      durationMs: Date.now() - startedAt,
    });
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", request.nextUrl.pathname);
    const response = NextResponse.redirect(signIn);
    response.headers.set("x-request-id", requestId);
    return response;
  }
  logger.info("Protected route authorized", {
    durationMs: Date.now() - startedAt,
  });
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  return response;
}
