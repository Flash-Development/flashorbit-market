import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import { workspaceErrorResponse } from "@/lib/workspaces/api";
import { revokeWorkspaceInvitation } from "@/lib/workspaces/invitations";

type RouteContext = { params: Promise<{ slug: string; invitationId: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isTrustedRequestOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }
  try {
    const { slug, invitationId } = await params;
    await revokeWorkspaceInvitation(authenticated.localUser.id, slug, invitationId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
