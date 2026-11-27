import "server-only";
import type { MembershipRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { roleCan } from "@/lib/authz/permissions";
import {
  WorkspaceAuthorizationError,
  WorkspaceNotFoundError,
} from "@/lib/workspaces/errors";
import { resolveMembership } from "@/lib/workspaces/access";
import type { WorkspaceClient } from "@/lib/workspaces/client";

export async function changeMembershipRole(
  actorUserId: string,
  workspaceSlug: string,
  targetUserId: string,
  nextRole: MembershipRole,
  client: WorkspaceClient = prisma,
) {
  return client.$transaction(async (tx) => {
    const resolved = await resolveMembership(actorUserId, workspaceSlug, tx);
    if (!roleCan(resolved.membership.role, "membership:update")) {
      throw new WorkspaceAuthorizationError();
    }
    const target = await tx.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: resolved.workspace.id,
        },
      },
    });
    if (!target) throw new WorkspaceNotFoundError();
    if (target.status !== "ACTIVE") throw new WorkspaceAuthorizationError();
    const targetUser = await tx.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser || targetUser.status !== "ACTIVE") {
      throw new WorkspaceAuthorizationError();
    }
    if (target.role === "OWNER" || nextRole === "OWNER") {
      throw new WorkspaceAuthorizationError();
    }
    if (resolved.membership.role === "ADMIN" &&
        (target.role === "ADMIN" || nextRole === "ADMIN")) {
      throw new WorkspaceAuthorizationError();
    }
    const ownerCount = await tx.membership.count({
      where: {
        workspaceId: resolved.workspace.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });
    if (ownerCount !== 1) throw new WorkspaceAuthorizationError();
    const updated = await tx.membership.update({
      where: { id: target.id },
      data: { role: nextRole },
    });
    await tx.auditLog.create({
      data: {
        workspaceId: resolved.workspace.id,
        actorUserId,
        action: "membership.role_changed",
        targetType: "membership",
        targetId: target.id,
        metadata: { previousRole: target.role, nextRole },
      },
    });
    return updated;
  });
}

export async function listWorkspaceMembers(
  userId: string,
  slug: string,
  client: WorkspaceClient = prisma,
) {
  const resolved = await resolveMembership(userId, slug, client);
  if (!roleCan(resolved.membership.role, "membership:read")) {
    throw new WorkspaceAuthorizationError();
  }
  const members = await client.membership.findMany({
    where: { workspaceId: resolved.workspace.id, status: "ACTIVE" },
    include: { user: { include: { profile: true } } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  return members.map(({ user, ...membership }) => ({
    ...membership,
    email: user.email,
    name: user.profile?.name ?? "",
  }));
}

export async function removeWorkspaceMember(
  actorUserId: string,
  slug: string,
  targetUserId: string,
  client: WorkspaceClient = prisma,
) {
  return client.$transaction(async (tx) => {
    const resolved = await resolveMembership(actorUserId, slug, tx);
    if (!roleCan(resolved.membership.role, "membership:remove")) {
      throw new WorkspaceAuthorizationError();
    }
    const target = await tx.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: resolved.workspace.id,
        },
      },
    });
    if (!target || target.status !== "ACTIVE" || target.role === "OWNER") {
      throw new WorkspaceAuthorizationError();
    }
    if (resolved.membership.role === "ADMIN" && target.role === "ADMIN") {
      throw new WorkspaceAuthorizationError();
    }
    const updated = await tx.membership.update({
      where: { id: target.id },
      data: { status: "REMOVED" },
    });
    await tx.auditLog.create({
      data: {
        workspaceId: resolved.workspace.id,
        actorUserId,
        action: "membership.removed",
        targetType: "membership",
        targetId: target.id,
      },
    });
    const user = await tx.user.findUnique({ where: { id: targetUserId } });
    if (user?.workspaceId === resolved.workspace.id) {
      const next = await tx.membership.findFirst({
        where: { userId: targetUserId, status: "ACTIVE", workspaceId: { not: resolved.workspace.id } },
        orderBy: { createdAt: "asc" },
      });
      await tx.user.update({
        where: { id: targetUserId },
        data: { workspaceId: next?.workspaceId ?? null },
      });
    }
    return updated;
  });
}
