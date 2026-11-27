import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import type { MembershipRole } from "@/generated/prisma/client";
import { invalidJsonResponse, workspaceErrorResponse } from "@/lib/workspaces/api";
import { createWorkspaceInvitation, listWorkspaceInvitations } from "@/lib/workspaces/invitations";

type RouteContext = { params: Promise<{ slug: string }> };
const roles = new Set<MembershipRole>(["ADMIN", "MANAGER", "STAFF"]);

export async function GET(_request: Request, { params }: RouteContext) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { slug } = await params;
    return NextResponse.json({
      invitations: await listWorkspaceInvitations(authenticated.localUser.id, slug),
    });
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isTrustedRequestOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }
  let body: { email?: unknown; role?: unknown };
  try { body = await request.json(); } catch { return invalidJsonResponse(); }
  if (typeof body.email !== "string" || typeof body.role !== "string" ||
      !roles.has(body.role as MembershipRole)) {
    return NextResponse.json({ error: "A valid email and role are required." }, { status: 400 });
  }
  try {
    const { slug } = await params;
    const invitation = await createWorkspaceInvitation(
      authenticated.localUser.id,
      slug,
      body.email,
      body.role as MembershipRole,
    );
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
