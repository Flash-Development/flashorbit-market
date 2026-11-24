import { NextResponse } from "next/server";
import { createLogger, getRequestId } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const requestId = getRequestId(request);
  createLogger({ requestId, component: "health" }).info("Health check");
  const response = NextResponse.json(
    {
      status: "ok",
      service: "flash",
    },
    { status: 200 },
  );
  response.headers.set("x-request-id", requestId);
  return response;
}
