import "server-only";
import { prisma } from "@/lib/db/prisma";
import { createWorkspace } from "@/lib/workspaces/create";

export async function getAuthenticatedWorkspaceContext(userId: string) {
  return prisma.workspace.findMany({
    where: {
      memberships: { some: { userId, status: "ACTIVE" } },
      status: "ACTIVE",
    },
    include: {
      stores: { where: { status: "ACTIVE" }, take: 1 },
      memberships: {
        where: { userId },
        select: { role: true, status: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export function selectActiveWorkspaceContext<T extends { id: string }>(
  workspaceId: string | null | undefined,
  workspaces: T[],
) {
  if (workspaceId) {
    return workspaces.find((workspace) => workspace.id === workspaceId) ?? null;
  }
  return workspaces[0] ?? null;
}

export async function getActiveWorkspaceContext(userId: string) {
  const [user, workspaces] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true } }),
    getAuthenticatedWorkspaceContext(userId),
  ]);
  return selectActiveWorkspaceContext(user?.workspaceId, workspaces);
}

export async function recoverStaleWorkspaceSelection<T extends { id: string }>(
  userId: string,
  workspaces: T[],
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workspaceId: true },
  });
  const fallback = workspaces[0] ?? null;
  if (!user?.workspaceId || !fallback ||
      workspaces.some((workspace) => workspace.id === user.workspaceId)) {
    return null;
  }
  const result = await prisma.user.updateMany({
    where: { id: userId, workspaceId: user.workspaceId },
    data: { workspaceId: fallback.id },
  });
  return result.count === 1 ? fallback : null;
}

export async function createOnboardingWorkspace(
  userId: string,
  email: string,
  name: string,
  slug?: string,
) {
  return createWorkspace(
    { userId, email },
    { name, slug },
  );
}
