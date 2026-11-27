import "server-only";
import { prisma } from "@/lib/db/prisma";
import { roleCan, type Capability } from "@/lib/authz/permissions";
import {
  InventoryAuthorizationError,
  InventoryInputError,
} from "@/lib/inventory/errors";

type InventoryClient = typeof prisma;

async function requireInventoryAccess(
  userId: string,
  workspaceId: string,
  capability: Capability,
  client: InventoryClient,
) {
  const membership = await client.membership.findFirst({
    where: { userId, workspaceId, status: "ACTIVE" },
  });
  if (!membership || !roleCan(membership.role, capability)) {
    throw new InventoryAuthorizationError();
  }
  const workspace = await client.workspace.findFirst({
    where: { id: workspaceId, status: "ACTIVE" },
  });
  if (!workspace) throw new InventoryAuthorizationError();
  return workspace;
}

export async function listInventory(
  userId: string,
  workspaceId: string,
  client: InventoryClient = prisma,
) {
  await requireInventoryAccess(userId, workspaceId, "inventory:read", client);
  return client.inventoryBalance.findMany({
    where: { workspaceId },
    include: {
      variant: {
        include: { product: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listInventoryVariants(
  userId: string,
  workspaceId: string,
  client: InventoryClient = prisma,
) {
  await requireInventoryAccess(userId, workspaceId, "inventory:read", client);
  return client.productVariant.findMany({
    where: { workspaceId, status: { not: "ARCHIVED" } },
    include: {
      product: true,
      inventoryBalance: true,
    },
    orderBy: [{ product: { name: "asc" } }, { name: "asc" }],
  });
}

export async function listInventoryMovements(
  userId: string,
  workspaceId: string,
  variantId: string,
  client: InventoryClient = prisma,
) {
  await requireInventoryAccess(userId, workspaceId, "inventory:read", client);
  const variant = await client.productVariant.findFirst({
    where: { id: variantId, workspaceId, status: { not: "ARCHIVED" } },
  });
  if (!variant) throw new InventoryInputError("Variant not found.");
  return client.inventoryMovement.findMany({
    where: { workspaceId, variantId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function adjustInventory(
  userId: string,
  workspaceId: string,
  variantId: string,
  input: { delta: number; reason?: string; reorderPoint?: number },
  client: InventoryClient = prisma,
) {
  await requireInventoryAccess(userId, workspaceId, "inventory:manage", client);
  if (!Number.isInteger(input.delta)) {
    throw new InventoryInputError("Quantity change must be a whole number.");
  }
  if (input.delta === 0) {
    throw new InventoryInputError("Quantity change cannot be zero.");
  }
  if (input.delta < -999999999 || input.delta > 999999999) {
    throw new InventoryInputError("Quantity change is outside the supported range.");
  }
  if (input.reorderPoint !== undefined &&
      (!Number.isInteger(input.reorderPoint) ||
       input.reorderPoint < 0 ||
       input.reorderPoint > 999999999)) {
    throw new InventoryInputError("Reorder point must be a whole number from 0 to 999999999.");
  }
  const reason = input.reason?.trim();
  if (reason && reason.length > 500) {
    throw new InventoryInputError("Reason must be 500 characters or fewer.");
  }

  return client.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
      `${workspaceId}:${variantId}`,
    );
    const variant = await tx.productVariant.findFirst({
      where: { id: variantId, workspaceId, status: { not: "ARCHIVED" } },
    });
    if (!variant) throw new InventoryInputError("Variant not found.");

    const existing = await tx.inventoryBalance.findUnique({
      where: { variantId },
    });
    const before = existing?.quantity ?? 0;
    const after = before + input.delta;
    if (after < 0) {
      throw new InventoryInputError("Adjustment would make quantity negative.");
    }

    const balance = existing
      ? await tx.inventoryBalance.update({
          where: { id: existing.id },
          data: {
            quantity: after,
            ...(input.reorderPoint !== undefined
              ? { reorderPoint: input.reorderPoint }
              : {}),
          },
        })
      : await tx.inventoryBalance.create({
          data: {
            workspaceId,
            variantId,
            quantity: after,
            reservedQuantity: 0,
            reorderPoint: input.reorderPoint ?? 0,
          },
        });

    await tx.inventoryMovement.create({
      data: {
        workspaceId,
        variantId,
        type: existing ? "ADJUSTMENT" : "INITIAL",
        delta: input.delta,
        quantityBefore: before,
        quantityAfter: after,
        reason: reason || null,
        createdBy: userId,
      },
    });
    await tx.auditLog.create({
      data: {
        workspaceId,
        actorUserId: userId,
        action: "inventory.adjusted",
        targetType: "product_variant",
        targetId: variantId,
        metadata: {
          delta: input.delta,
          quantityBefore: before,
          quantityAfter: after,
        },
      },
    });
    return balance;
  }, { maxWait: 10_000, timeout: 15_000 });
}
