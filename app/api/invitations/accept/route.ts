import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import { invalidJsonResponse, workspaceErrorResponse } from "@/lib/workspaces/api";
import { acceptWorkspaceInvitation } from "@/lib/workspaces/invitation-acceptance";

export async function POST(request: Request) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isTrustedRequestOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }
  let body: { token?: unknown };
  try { body = await request.json(); } catch { return invalidJsonResponse(); }
  if (typeof body.token !== "string") {
    return NextResponse.json({ error: "Invitation token is required." }, { status: 400 });
  }
  try {
    const result = await acceptWorkspaceInvitation(
      authenticated.localUser.id,
      authenticated.localUser.email,
      body.token,
    );
    return NextResponse.json({ workspaceId: result.workspaceId });
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
