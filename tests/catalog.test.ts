import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import { testClient } from "./test-client";
import { createWorkspace } from "../lib/workspaces/service";
import {
  createCategory,
  createProduct,
  createVariant,
  listCatalog,
  updateProduct,
} from "../lib/catalog/service";
import {
  CatalogAuthorizationError,
  CatalogConflictError,
  CatalogInputError,
} from "../lib/catalog/errors";

test("catalog creates categories products variants within a workspace", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const principal = {
    userId: `catalog-owner-${suffix}`,
    email: `catalog-owner-${suffix}@flash-orbit.test`,
  };
  const workspace = await createWorkspace(
    principal,
    { name: `Catalog Store ${suffix}`, slug: `catalog-${suffix}` },
    prisma,
  );

  const category = await createCategory(
    principal.userId,
    workspace.id,
    { name: "Beverages", slug: `beverages-${suffix}` },
    prisma,
  );
  const product = await createProduct(
    principal.userId,
    workspace.id,
    {
      name: "Orange Drink",
      slug: `orange-drink-${suffix}`,
      basePrice: "2500.50",
      categoryId: category.id,
    },
    prisma,
  );
  const variant = await createVariant(
    principal.userId,
    workspace.id,
    product.id,
    { name: "Large", sku: `OD-${suffix.toUpperCase()}`, price: "3000" },
    prisma,
  );
  const catalog = await listCatalog(principal.userId, workspace.id, prisma);

  assert.equal(catalog.categories.length, 1);
  assert.equal(catalog.products.length, 1);
  assert.equal(catalog.products[0]?.variants[0]?.id, variant.id);
  assert.equal(catalog.products[0]?.category?.id, category.id);
  await prisma.workspace.delete({ where: { id: workspace.id } });
});

test("catalog rejects cross-workspace and invalid mutations", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const owner = {
    userId: `catalog-owner-a-${suffix}`,
    email: `catalog-owner-a-${suffix}@flash-orbit.test`,
  };
  const workspace = await createWorkspace(
    owner,
    { name: `Catalog A ${suffix}`, slug: `catalog-a-${suffix}` },
    prisma,
  );
  const category = await createCategory(
    owner.userId,
    workspace.id,
    { name: "Groceries", slug: `groceries-${suffix}` },
    prisma,
  );

  await assert.rejects(
    createCategory(
      `catalog-other-${suffix}`,
      workspace.id,
      { name: "Other", slug: `other-${suffix}` },
      prisma,
    ),
    CatalogAuthorizationError,
  );
  await assert.rejects(
    createProduct(
      owner.userId,
      workspace.id,
      { name: "Invalid Price", slug: `invalid-${suffix}`, basePrice: "-10" },
      prisma,
    ),
    CatalogInputError,
  );
  await assert.rejects(
    createCategory(
      owner.userId,
      workspace.id,
      { name: "Groceries", slug: `different-${suffix}` },
      prisma,
    ),
    CatalogConflictError,
  );

  await updateProduct(
    owner.userId,
    workspace.id,
    (
      await createProduct(
        owner.userId,
        workspace.id,
        {
          name: "Rice",
          slug: `rice-${suffix}`,
          basePrice: "12000",
          categoryId: category.id,
        },
        prisma,
      )
    ).id,
    { status: "ACTIVE" },
    prisma,
  );
  await prisma.workspace.delete({ where: { id: workspace.id } });
});
