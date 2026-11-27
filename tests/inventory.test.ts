import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import { testClient } from "./test-client";
import { createWorkspace } from "../lib/workspaces/service";
import {
  createProduct,
  createVariant,
} from "../lib/catalog/service";
import {
  adjustInventory,
  listInventory,
  listInventoryMovements,
} from "../lib/inventory/service";
import {
  InventoryAuthorizationError,
  InventoryInputError,
} from "../lib/inventory/errors";

test("inventory adjustment is atomic and records append-only movements", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const principal = {
    userId: `inventory-owner-${suffix}`,
    email: `inventory-owner-${suffix}@flash-orbit.test`,
  };
  const workspace = await createWorkspace(
    principal,
    { name: `Inventory Store ${suffix}`, slug: `inventory-${suffix}` },
    prisma,
  );
  const product = await createProduct(
    principal.userId,
    workspace.id,
    { name: "Stocked Rice", slug: `stocked-rice-${suffix}`, basePrice: "15000" },
    prisma,
  );
  const variant = await createVariant(
    principal.userId,
    workspace.id,
    product.id,
    { name: "50kg", sku: `RICE-${suffix.toUpperCase()}`, price: "15000" },
    prisma,
  );

  const initial = await adjustInventory(
    principal.userId,
    workspace.id,
    variant.id,
    { delta: 25, reason: "Opening stock", reorderPoint: 5 },
    prisma,
  );
  assert.equal(initial.quantity, 25);
  assert.equal(initial.reorderPoint, 5);

  const outbound = await adjustInventory(
    principal.userId,
    workspace.id,
    variant.id,
    { delta: -7, reason: "Cycle adjustment" },
    prisma,
  );
  assert.equal(outbound.quantity, 18);

  await assert.rejects(
    adjustInventory(
      principal.userId,
      workspace.id,
      variant.id,
      { delta: -19, reason: "Insufficient stock" },
      prisma,
    ),
    InventoryInputError,
  );

  const balances = await listInventory(principal.userId, workspace.id, prisma);
  assert.equal(balances.length, 1);
  assert.equal(balances[0]?.quantity, 18);

  const movements = await listInventoryMovements(
    principal.userId,
    workspace.id,
    variant.id,
    prisma,
  );
  assert.equal(movements.length, 2);
  assert.equal(movements[0]?.quantityBefore, 25);
  assert.equal(movements[0]?.quantityAfter, 18);

  await prisma.workspace.delete({ where: { id: workspace.id } });
});

test("inventory denies cross-tenant adjustment and invalid quantities", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const principal = {
    userId: `inventory-owner-a-${suffix}`,
    email: `inventory-owner-a-${suffix}@flash-orbit.test`,
  };
  const workspace = await createWorkspace(
    principal,
    { name: `Inventory A ${suffix}`, slug: `inventory-a-${suffix}` },
    prisma,
  );
  const product = await createProduct(
    principal.userId,
    workspace.id,
    { name: "Soap", slug: `soap-${suffix}`, basePrice: "900" },
    prisma,
  );
  const variant = await createVariant(
    principal.userId,
    workspace.id,
    product.id,
    { name: "Pack", sku: `SOAP-${suffix.toUpperCase()}`, price: "900" },
    prisma,
  );

  await assert.rejects(
    adjustInventory(
      `inventory-other-${suffix}`,
      workspace.id,
      variant.id,
      { delta: 10 },
      prisma,
    ),
    InventoryAuthorizationError,
  );
  await assert.rejects(
    adjustInventory(
      principal.userId,
      workspace.id,
      variant.id,
      { delta: 1.5 },
      prisma,
    ),
    InventoryInputError,
  );
  await assert.rejects(
    adjustInventory(
      principal.userId,
      workspace.id,
      variant.id,
      { delta: 0 },
      prisma,
    ),
    InventoryInputError,
  );

  await prisma.workspace.delete({ where: { id: workspace.id } });
});
