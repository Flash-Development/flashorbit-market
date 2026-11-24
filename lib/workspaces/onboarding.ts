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
