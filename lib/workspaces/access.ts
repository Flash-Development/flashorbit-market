import "server-only";
import { prisma } from "@/lib/db/prisma";
import { roleCan, type Capability } from "@/lib/authz/permissions";
import {
  WorkspaceAuthorizationError,
  WorkspaceNotFoundError,
} from "@/lib/workspaces/errors";
import type { WorkspaceClient } from "@/lib/workspaces/client";

export async function resolveMembership(
  userId: string,
  workspaceSlug: string,
  client: WorkspaceClient = prisma,
) {
  const workspace = await client.workspace.findUnique({
    where: { slug: workspaceSlug },
  });
  if (!workspace) throw new WorkspaceNotFoundError();
  if (workspace.status !== "ACTIVE") throw new WorkspaceAuthorizationError();
  const user = await client.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE") throw new WorkspaceAuthorizationError();
  const membership = await client.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId: workspace.id } },
  });
  if (!membership || membership.status !== "ACTIVE") {
    throw new WorkspaceAuthorizationError();
  }
  return { workspace, membership };
}

export async function requireWorkspaceCapability(
  userId: string,
  workspaceSlug: string,
  capability: Capability,
  client: WorkspaceClient = prisma,
) {
  const resolved = await resolveMembership(userId, workspaceSlug, client);
  if (!roleCan(resolved.membership.role, capability)) {
    throw new WorkspaceAuthorizationError();
  }
  return resolved;
}

export async function listUserWorkspaces(
  userId: string,
  client: WorkspaceClient = prisma,
) {
  const user = await client.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE") return [];
  return client.workspace.findMany({
    where: {
      memberships: { some: { userId, status: "ACTIVE" } },
      status: "ACTIVE",
    },
    include: {
      memberships: {
        where: { userId },
        select: { role: true, status: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}
