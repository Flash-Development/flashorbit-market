import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  assertAvailableWorkspaceSlug,
  generateWorkspaceSlug,
} from "@/lib/workspaces/slugs";
import {
  WorkspaceAuthorizationError,
  WorkspaceConflictError,
  WorkspaceInputError,
} from "@/lib/workspaces/errors";
import { ensureApplicationUser } from "@/lib/workspaces/user";
import type {
  AuthenticatedPrincipal,
  WorkspaceClient,
} from "@/lib/workspaces/client";

export async function createWorkspace(
  principal: AuthenticatedPrincipal,
  input: { name: string; slug?: string },
  client: WorkspaceClient = prisma,
) {
  if (!principal.userId || !principal.email) {
    throw new WorkspaceAuthorizationError();
  }
  const name = input.name.trim();
  if (name.length < 2 || name.length > 100) {
    throw new WorkspaceInputError(
      "Workspace name must be between 2 and 100 characters.",
    );
  }
  let slug = input.slug?.trim();
  if (!slug) slug = generateWorkspaceSlug(name);
  const validation = assertAvailableWorkspaceSlug(slug);
  if (!validation.success) throw new WorkspaceInputError(validation.error);

  return client.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      principal.userId,
    );
    const existingMembership = await tx.membership.findFirst({
      where: {
        userId: principal.userId,
        status: "ACTIVE",
      },
    });
    if (existingMembership) {
      throw new WorkspaceConflictError();
    }
    const user = await ensureApplicationUser(
      principal.userId,
      principal.email,
      tx,
    );
    if (user.status !== "ACTIVE") throw new WorkspaceAuthorizationError();
    const workspace = await tx.workspace.create({
      data: {
        name,
        slug: validation.slug,
        country: "NG",
        currency: "NGN",
        timezone: "Africa/Lagos",
      },
    });
    const membership = await tx.membership.create({
      data: {
        userId: principal.userId,
        workspaceId: workspace.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });
    const store = await tx.store.create({
      data: {
        workspaceId: workspace.id,
        ownerId: principal.userId,
        name,
        slug: validation.slug,
        status: "DRAFT",
      },
    });
    await tx.user.update({
      where: { id: principal.userId },
      data: { workspaceId: workspace.id },
    });
    return { ...workspace, memberships: [membership], stores: [store] };
  }, {
    maxWait: 10_000,
    timeout: 15_000,
  });
}
