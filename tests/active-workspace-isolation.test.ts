import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import { createProduct, createVariant, listCatalog } from "../lib/catalog/service";
import { CatalogAuthorizationError } from "../lib/catalog/errors";
import { adjustInventory, listInventory } from "../lib/inventory/service";
import { InventoryAuthorizationError } from "../lib/inventory/errors";
import { createWorkspace } from "../lib/workspaces/service";
import { getActiveWorkspaceContext } from "../lib/workspaces/onboarding";
import { testClient } from "./test-client";

test("catalog and inventory use the selected workspace for reads and writes", async (context) => {
  const prisma = testClient();
  const suffix = crypto.randomUUID().slice(0, 8);
  const ownerId = `active-scope-owner-${suffix}`;
  const staffId = `active-scope-staff-${suffix}`;
  const ownerWorkspace = await createWorkspace(
    { userId: ownerId, email: `${ownerId}@flash-orbit.test` },
    { name: `Owner Scope ${suffix}`, slug: `owner-scope-${suffix}` },
    prisma,
  );
  const staffWorkspace = await createWorkspace(
    { userId: staffId, email: `${staffId}@flash-orbit.test` },
    { name: `Staff Scope ${suffix}`, slug: `staff-scope-${suffix}` },
    prisma,
  );
  context.after(async () => {
    await prisma.workspace.deleteMany({
      where: { id: { in: [ownerWorkspace.id, staffWorkspace.id] } },
    });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, staffId] } } });
    await prisma.$disconnect();
  });

  const ownerProduct = await createProduct(
    ownerId,
    ownerWorkspace.id,
    { name: "Owner-only item", slug: `owner-item-${suffix}`, basePrice: "100" },
    prisma,
  );
  const ownerVariant = await createVariant(
    ownerId,
    ownerWorkspace.id,
    ownerProduct.id,
    { name: "Owner pack", sku: `OWNER-${suffix}`, price: "100" },
    prisma,
  );
  await adjustInventory(ownerId, ownerWorkspace.id, ownerVariant.id, { delta: 5 }, prisma);

  const staffProduct = await createProduct(
    staffId,
    staffWorkspace.id,
    { name: "Staff workspace item", slug: `staff-item-${suffix}`, basePrice: "200" },
    prisma,
  );
  const staffVariant = await createVariant(
    staffId,
    staffWorkspace.id,
    staffProduct.id,
    { name: "Staff pack", sku: `STAFF-${suffix}`, price: "200" },
    prisma,
  );
  await adjustInventory(staffId, staffWorkspace.id, staffVariant.id, { delta: 7 }, prisma);

  await prisma.membership.create({
    data: { userId: ownerId, workspaceId: staffWorkspace.id, role: "STAFF" },
  });
  await prisma.user.update({
    where: { id: ownerId },
    data: { workspaceId: staffWorkspace.id },
  });

  const activeWorkspace = await getActiveWorkspaceContext(ownerId);
  assert.equal(activeWorkspace?.id, staffWorkspace.id);
  const catalog = await listCatalog(ownerId, activeWorkspace!.id, prisma);
  assert.deepEqual(catalog.products.map(({ name }) => name), ["Staff workspace item"]);
  const balances = await listInventory(ownerId, activeWorkspace!.id, prisma);
  assert.deepEqual(
    balances.map(({ variantId, quantity }) => ({ variantId, quantity })),
    [{ variantId: staffVariant.id, quantity: 7 }],
  );

  await assert.rejects(
    createProduct(
      ownerId,
      activeWorkspace.id,
      { name: "Misrouted write", slug: `misrouted-${suffix}`, basePrice: "300" },
      prisma,
    ),
    CatalogAuthorizationError,
  );
  await assert.rejects(
    adjustInventory(ownerId, activeWorkspace.id, staffVariant.id, { delta: 1 }, prisma),
    InventoryAuthorizationError,
  );
  assert.equal(
    (await prisma.inventoryBalance.findFirst({
      where: { workspaceId: ownerWorkspace.id, variantId: ownerVariant.id },
    }))?.quantity,
    5,
  );
});
