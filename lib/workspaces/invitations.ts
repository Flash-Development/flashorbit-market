import "server-only";
import type { MembershipRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { roleCan } from "@/lib/authz/permissions";
import { sendWorkspaceInvitation } from "@/lib/email/invitation";
import { resolveMembership } from "@/lib/workspaces/access";
import type { WorkspaceClient } from "@/lib/workspaces/client";
import { createInvitationToken } from "@/lib/workspaces/invitation-token";
import { WorkspaceAuthorizationError, WorkspaceConflictError, WorkspaceInputError } from "@/lib/workspaces/errors";

const invitationLifetime = 7 * 24 * 60 * 60 * 1000;
const roles = new Set<MembershipRole>(["ADMIN", "MANAGER", "STAFF"]);

function canInvite(actorRole: MembershipRole, inviteRole: MembershipRole) {
  if (!roleCan(actorRole, "membership:invite") || !roles.has(inviteRole)) return false;
  return actorRole === "OWNER" || (inviteRole !== "ADMIN" && actorRole === "ADMIN");
}

export async function createWorkspaceInvitation(
  actorUserId: string,
  slug: string,
  rawEmail: string,
  role: MembershipRole,
  client: WorkspaceClient = prisma,
  sendEmail: typeof sendWorkspaceInvitation = sendWorkspaceInvitation,
) {
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new WorkspaceInputError("Enter a valid email address.");
  }
  const { workspace, membership } = await resolveMembership(actorUserId, slug, client);
  if (!canInvite(membership.role, role)) throw new WorkspaceAuthorizationError();
  const existingUser = await client.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMembership = await client.membership.findUnique({
      where: { userId_workspaceId: { userId: existingUser.id, workspaceId: workspace.id } },
    });
    if (existingMembership?.status === "ACTIVE") throw new WorkspaceConflictError();
  }
  const { token, tokenHash } = createInvitationToken();
  const expiresAt = new Date(Date.now() + invitationLifetime);
  const invitation = await client.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      `${workspace.id}:${email}`,
    );
    await tx.workspaceInvitation.updateMany({
      where: { workspaceId: workspace.id, email, status: "PENDING" },
      data: { status: "REVOKED" },
    });
    const created = await tx.workspaceInvitation.create({
      data: {
        workspaceId: workspace.id,
        email,
        role,
        tokenHash,
        invitedByUserId: actorUserId,
        expiresAt,
      },
    });
    await tx.auditLog.create({
      data: {
        workspaceId: workspace.id,
        actorUserId,
        action: "invitation.created",
        targetType: "invitation",
        targetId: created.id,
        metadata: { role },
      },
    });
    return created;
  });
  const baseUrl = process.env.BETTER_AUTH_URL;
  if (!baseUrl) throw new Error("Invitation URL is not configured.");
  try {
    await sendEmail({
      email,
      workspaceName: workspace.name,
      role,
      url: `${baseUrl}/invitations/accept?token=${encodeURIComponent(token)}`,
    });
  } catch (error) {
    await client.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: "REVOKED" },
    });
    throw error;
  }
  return { id: invitation.id, email, role, expiresAt };
}

export async function listWorkspaceInvitations(
  userId: string,
  slug: string,
  client: WorkspaceClient = prisma,
) {
  const { workspace, membership } = await resolveMembership(userId, slug, client);
  if (!roleCan(membership.role, "membership:read")) throw new WorkspaceAuthorizationError();
  return client.workspaceInvitation.findMany({
    where: { workspaceId: workspace.id, status: "PENDING" },
    select: { id: true, email: true, role: true, status: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeWorkspaceInvitation(
  actorUserId: string,
  slug: string,
  invitationId: string,
  client: WorkspaceClient = prisma,
) {
  return client.$transaction(async (tx) => {
    const { workspace, membership } = await resolveMembership(actorUserId, slug, tx);
    if (!roleCan(membership.role, "membership:invite")) {
      throw new WorkspaceAuthorizationError();
    }
    const invitation = await tx.workspaceInvitation.findFirst({
      where: { id: invitationId, workspaceId: workspace.id },
    });
    if (!invitation || invitation.status !== "PENDING") {
      throw new WorkspaceInputError("Invitation is not pending.");
    }
    const updated = await tx.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: "REVOKED" },
    });
    await tx.auditLog.create({
      data: {
        workspaceId: workspace.id,
        actorUserId,
        action: "invitation.revoked",
        targetType: "invitation",
        targetId: invitation.id,
      },
    });
    return updated;
  });
}
