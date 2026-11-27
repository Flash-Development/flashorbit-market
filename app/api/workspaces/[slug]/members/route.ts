import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import { changeMembershipRole, listWorkspaceMembers, removeWorkspaceMember } from "@/lib/workspaces/membership";
import { invalidJsonResponse, workspaceErrorResponse } from "@/lib/workspaces/api";
import type { MembershipRole } from "@/generated/prisma/client";

type RouteContext = { params: Promise<{ slug: string }> };
const allowedRoles = new Set<MembershipRole>(["ADMIN", "MANAGER", "STAFF"]);

export async function GET(_request: Request, { params }: RouteContext) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { slug } = await params;
    return NextResponse.json({ members: await listWorkspaceMembers(authenticated.localUser.id, slug) });
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
  let body: { userId?: unknown; role?: unknown };
  try { body = await request.json(); } catch { return invalidJsonResponse(); }
  if (typeof body.userId !== "string" || typeof body.role !== "string" ||
      !allowedRoles.has(body.role as MembershipRole)) {
    return NextResponse.json({ error: "A valid member and role are required." }, { status: 400 });
  }
  try {
    const { slug } = await params;
    const membership = await changeMembershipRole(
      authenticated.localUser.id, slug, body.userId, body.role as MembershipRole,
    );
    return NextResponse.json({ membership });
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isTrustedRequestOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }
  let body: { userId?: unknown };
  try { body = await request.json(); } catch { return invalidJsonResponse(); }
  if (typeof body.userId !== "string") {
    return NextResponse.json({ error: "A valid member is required." }, { status: 400 });
  }
  try {
    const { slug } = await params;
    await removeWorkspaceMember(authenticated.localUser.id, slug, body.userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
