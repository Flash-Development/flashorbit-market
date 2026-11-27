import "server-only";
import { prisma } from "@/lib/db/prisma";
import { roleCan } from "@/lib/authz/permissions";
import { WorkspaceAuthorizationError, WorkspaceInputError } from "@/lib/workspaces/errors";
import { resolveMembership } from "@/lib/workspaces/access";
import type { WorkspaceClient } from "@/lib/workspaces/client";

export async function getWorkspaceOperations(
  userId: string,
  slug: string,
  client: WorkspaceClient = prisma,
) {
  const { workspace, membership } = await resolveMembership(userId, slug, client);
  if (!roleCan(membership.role, "workspace:read")) throw new WorkspaceAuthorizationError();
  const [subscription, auditLogs] = await Promise.all([
    client.workspaceSubscription.upsert({
      where: { workspaceId: workspace.id },
      update: {},
      create: {
        workspaceId: workspace.id,
        planCode: "FOUNDATION",
        entitlements: {
          features: ["workspace_settings", "team_management", "audit_log", "catalog", "inventory"],
          limits: {},
        },
      },
    }),
    roleCan(membership.role, "audit:read")
      ? client.auditLog.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { actor: { include: { profile: true } } },
        })
      : Promise.resolve([]),
  ]);
  const periodStart = new Date();
  periodStart.setUTCHours(0, 0, 0, 0);
  const [activeMembers, products, variants] = await Promise.all([
    client.membership.count({ where: { workspaceId: workspace.id, status: "ACTIVE" } }),
    client.product.count({ where: { workspaceId: workspace.id, status: { not: "ARCHIVED" } } }),
    client.productVariant.count({ where: { workspaceId: workspace.id, status: { not: "ARCHIVED" } } }),
  ]);
  const counts = [
    ["ACTIVE_MEMBERS", activeMembers],
    ["ACTIVE_PRODUCTS", products],
    ["ACTIVE_VARIANTS", variants],
  ] as const;
  await Promise.all(counts.map(([metric, quantity]) =>
    client.workspaceUsage.upsert({
      where: {
        workspaceId_metric_periodStart: {
          workspaceId: workspace.id,
          metric,
          periodStart,
        },
      },
      update: { quantity, measuredAt: new Date() },
      create: { workspaceId: workspace.id, metric, periodStart, quantity },
    }),
  ));
  const usage = await client.workspaceUsage.findMany({
    where: { workspaceId: workspace.id },
    orderBy: [{ periodStart: "desc" }, { metric: "asc" }],
    take: 90,
  });
  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      country: workspace.country,
      currency: workspace.currency,
      timezone: workspace.timezone,
    },
    subscription: {
      planCode: subscription.planCode,
      status: subscription.status,
      entitlements: subscription.entitlements,
    },
    usage,
    auditLogs: auditLogs.map(({ actor, ...entry }) => ({
      ...entry,
      actorName: actor?.profile?.name ?? actor?.email ?? "Former member",
    })),
  };
}

export async function updateWorkspaceSettings(
  userId: string,
  slug: string,
  input: { name: string; country: string; currency: string; timezone: string },
  client: WorkspaceClient = prisma,
) {
  const name = input.name.trim();
  const country = input.country.trim().toUpperCase();
  const currency = input.currency.trim().toUpperCase();
  const timezone = input.timezone.trim();
  if (name.length < 2 || name.length > 100) {
    throw new WorkspaceInputError("Workspace name must be between 2 and 100 characters.");
  }
  if (!/^[A-Z]{2}$/.test(country) || !/^[A-Z]{3}$/.test(currency)) {
    throw new WorkspaceInputError("Enter a valid country and currency code.");
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    throw new WorkspaceInputError("Enter a valid time zone.");
  }
  return client.$transaction(async (tx) => {
    const resolved = await resolveMembership(userId, slug, tx);
    if (!roleCan(resolved.membership.role, "workspace:update")) {
      throw new WorkspaceAuthorizationError();
    }
    const updated = await tx.workspace.update({
      where: { id: resolved.workspace.id },
      data: { name, country, currency, timezone },
    });
    await tx.auditLog.create({
      data: {
        workspaceId: updated.id,
        actorUserId: userId,
        action: "workspace.settings_updated",
        targetType: "workspace",
        targetId: updated.id,
        metadata: { name, country, currency, timezone },
      },
    });
    return updated;
  });
}
