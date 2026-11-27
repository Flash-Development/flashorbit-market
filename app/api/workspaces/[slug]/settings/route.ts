import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import { invalidJsonResponse, workspaceErrorResponse } from "@/lib/workspaces/api";
import { getWorkspaceOperations, updateWorkspaceSettings } from "@/lib/workspaces/settings";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { slug } = await params;
    return NextResponse.json(await getWorkspaceOperations(authenticated.localUser.id, slug));
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isTrustedRequestOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }
  let body: { name?: unknown; country?: unknown; currency?: unknown; timezone?: unknown };
  try { body = await request.json(); } catch { return invalidJsonResponse(); }
  if ([body.name, body.country, body.currency, body.timezone].some((value) => typeof value !== "string")) {
    return NextResponse.json({ error: "All workspace settings are required." }, { status: 400 });
  }
  try {
    const { slug } = await params;
    const workspace = await updateWorkspaceSettings(
      authenticated.localUser.id,
      slug,
      body as { name: string; country: string; currency: string; timezone: string },
    );
    return NextResponse.json({ workspace });
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
