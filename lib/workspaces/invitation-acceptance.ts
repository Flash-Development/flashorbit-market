import "server-only";
import { prisma } from "@/lib/db/prisma";
import { hashInvitationToken } from "@/lib/workspaces/invitation-token";
import { WorkspaceAuthorizationError, WorkspaceConflictError, WorkspaceInputError } from "@/lib/workspaces/errors";
import type { WorkspaceClient } from "@/lib/workspaces/client";

export async function acceptWorkspaceInvitation(
  userId: string,
  email: string,
  token: string,
  client: WorkspaceClient = prisma,
) {
  if (!token || token.length > 200) throw new WorkspaceInputError("Invitation link is invalid.");
  const tokenHash = hashInvitationToken(token);
  const result = await client.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      tokenHash,
    );
    const invitation = await tx.workspaceInvitation.findUnique({ where: { tokenHash } });
    if (!invitation || invitation.status !== "PENDING") {
      throw new WorkspaceInputError("Invitation is invalid or no longer active.");
    }
    if (invitation.expiresAt <= new Date()) {
      await tx.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return { expired: true as const };
    }
    if (invitation.email !== email.trim().toLowerCase()) {
      throw new WorkspaceAuthorizationError();
    }
    await tx.$executeRawUnsafe(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      `${invitation.workspaceId}:${invitation.email}`,
    );
    const currentInvitation = await tx.workspaceInvitation.findUnique({
      where: { tokenHash },
    });
    if (!currentInvitation || currentInvitation.status !== "PENDING") {
      throw new WorkspaceInputError("Invitation is invalid or no longer active.");
    }
    if (currentInvitation.expiresAt <= new Date()) {
      await tx.workspaceInvitation.update({
        where: { id: currentInvitation.id },
        data: { status: "EXPIRED" },
      });
      return { expired: true as const };
    }
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== "ACTIVE") throw new WorkspaceAuthorizationError();
    const existing = await tx.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: invitation.workspaceId } },
    });
    if (existing && existing.status !== "REMOVED") {
      throw new WorkspaceConflictError();
    }
    const membership = await tx.membership.upsert({
      where: { userId_workspaceId: { userId, workspaceId: invitation.workspaceId } },
      update: { status: "ACTIVE", role: invitation.role },
      create: {
        userId,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
        status: "ACTIVE",
      },
    });
    const accepted = await tx.workspaceInvitation.updateMany({
      where: { id: invitation.id, status: "PENDING" },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
    if (accepted.count !== 1) {
      throw new WorkspaceInputError("Invitation is invalid or no longer active.");
    }
    await tx.user.update({
      where: { id: userId },
      data: { workspaceId: invitation.workspaceId },
    });
    await tx.auditLog.create({
      data: {
        workspaceId: invitation.workspaceId,
        actorUserId: userId,
        action: "invitation.accepted",
        targetType: "membership",
        targetId: membership.id,
      },
    });
    return { expired: false as const, workspaceId: invitation.workspaceId };
  });
  if (result.expired) throw new WorkspaceInputError("Invitation has expired.");
  return result;
}
