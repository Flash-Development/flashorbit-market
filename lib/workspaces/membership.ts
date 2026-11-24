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
    return tx.membership.update({
      where: { id: target.id },
      data: { role: nextRole },
    });
  });
}
