import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedWorkspaceContext } from "@/lib/workspaces/onboarding";

export async function GET() {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const [user, workspaces] = await Promise.all([
    prisma.user.findUnique({
      where: { id: authenticated.localUser.id },
      select: { workspaceId: true },
    }),
    getAuthenticatedWorkspaceContext(authenticated.localUser.id),
  ]);
  return NextResponse.json({
    activeWorkspaceId: user?.workspaceId ?? workspaces[0]?.id ?? null,
    workspaces: workspaces.map(({ id, name, slug, memberships }) => ({
      id,
      name,
      slug,
      role: memberships[0]?.role ?? "STAFF",
    })),
  });
}

export async function POST(request: Request) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isTrustedRequestOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }
  let body: { workspaceId?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }
  if (typeof body.workspaceId !== "string") {
    return NextResponse.json({ error: "Workspace is required." }, { status: 400 });
  }
  const membership = await prisma.membership.findFirst({
    where: {
      userId: authenticated.localUser.id,
      workspaceId: body.workspaceId,
      status: "ACTIVE",
      workspace: { status: "ACTIVE" },
    },
    select: { workspaceId: true },
  });
  if (!membership) return NextResponse.json({ error: "Workspace access denied." }, { status: 403 });
  await prisma.user.update({
    where: { id: authenticated.localUser.id },
    data: { workspaceId: membership.workspaceId },
  });
  return new Response(null, { status: 204 });
}
