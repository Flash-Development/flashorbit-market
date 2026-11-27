import "server-only";
import { prisma } from "@/lib/db/prisma";
import { roleCan, type Capability } from "@/lib/authz/permissions";
import { normalizeCatalogSlug } from "@/lib/catalog/slugs";
import {
  CatalogAuthorizationError,
  CatalogConflictError,
  CatalogInputError,
} from "@/lib/catalog/errors";

type CatalogClient = typeof prisma;

async function requireCatalogAccess(
  userId: string,
  workspaceId: string,
  capability: Capability,
  client: CatalogClient,
) {
  const membership = await client.membership.findFirst({
    where: { userId, workspaceId, status: "ACTIVE" },
  });
  if (!membership || !roleCan(membership.role, capability)) {
    throw new CatalogAuthorizationError();
  }
  const workspace = await client.workspace.findFirst({
    where: { id: workspaceId, status: "ACTIVE" },
  });
  if (!workspace) throw new CatalogAuthorizationError();
  return workspace;
}

function nameAndSlug(name: string, slug?: string) {
  const cleanName = name.trim();
  if (cleanName.length < 2 || cleanName.length > 120) {
    throw new CatalogInputError("Name must be between 2 and 120 characters.");
  }
  const normalizedSlug = normalizeCatalogSlug(slug?.trim() || cleanName);
  if (!normalizedSlug) throw new CatalogInputError("Enter a valid catalog slug.");
  return { name: cleanName, slug: normalizedSlug };
}

function priceValue(value: string | number) {
  const normalized = typeof value === "number" ? String(value) : value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(normalized)) {
    throw new CatalogInputError("Enter a valid price with up to 2 decimals.");
  }
  const price = Number(normalized);
  if (!Number.isFinite(price) || price < 0 || price > 9999999999.99) {
    throw new CatalogInputError("Price is outside the supported range.");
  }
  return normalized;
}

export async function listCatalog(
  userId: string,
  workspaceId: string,
  client: CatalogClient = prisma,
) {
  await requireCatalogAccess(userId, workspaceId, "catalog:read", client);
  const [categories, products] = await Promise.all([
    client.category.findMany({
      where: { workspaceId, status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
    }),
    client.product.findMany({
      where: { workspaceId, status: { not: "ARCHIVED" } },
      include: { category: true, variants: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);
  return { categories, products };
}

export async function createCategory(
  userId: string,
  workspaceId: string,
  input: { name: string; slug?: string; description?: string },
  client: CatalogClient = prisma,
) {
  await requireCatalogAccess(userId, workspaceId, "catalog:manage", client);
  const value = nameAndSlug(input.name, input.slug);
  const description = input.description?.trim();
  if (description && description.length > 500) {
    throw new CatalogInputError("Description must be 500 characters or fewer.");
  }
  try {
    return await client.category.create({
      data: {
        workspaceId,
        name: value.name,
        slug: value.slug,
        description: description || null,
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new CatalogConflictError("That category name or slug already exists.");
    }
    throw error;
  }
}

export async function createProduct(
  userId: string,
  workspaceId: string,
  input: {
    name: string;
    slug?: string;
    description?: string;
    basePrice: string | number;
    categoryId?: string;
  },
  client: CatalogClient = prisma,
) {
  await requireCatalogAccess(userId, workspaceId, "catalog:manage", client);
  const value = nameAndSlug(input.name, input.slug);
  const description = input.description?.trim();
  if (description && description.length > 1000) {
    throw new CatalogInputError("Description must be 1000 characters or fewer.");
  }
  if (input.categoryId) {
    const category = await client.category.findFirst({
      where: { id: input.categoryId, workspaceId, status: { not: "ARCHIVED" } },
    });
    if (!category) throw new CatalogInputError("Choose a valid category.");
  }
  try {
    return await client.product.create({
      data: {
        workspaceId,
        categoryId: input.categoryId || null,
        name: value.name,
        slug: value.slug,
        description: description || null,
        basePrice: priceValue(input.basePrice),
        currency: "NGN",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new CatalogConflictError("That product name or slug already exists.");
    }
    throw error;
  }
}

export async function createVariant(
  userId: string,
  workspaceId: string,
  productId: string,
  input: { name: string; sku: string; price: string | number },
  client: CatalogClient = prisma,
) {
  await requireCatalogAccess(userId, workspaceId, "catalog:manage", client);
  const product = await client.product.findFirst({
    where: { id: productId, workspaceId, status: { not: "ARCHIVED" } },
  });
  if (!product) throw new CatalogInputError("Product not found.");
  const name = input.name.trim();
  const sku = input.sku.trim().toUpperCase();
  if (name.length < 1 || name.length > 120) {
    throw new CatalogInputError("Variant name must be between 1 and 120 characters.");
  }
  if (!/^[A-Z0-9][A-Z0-9._-]{0,63}$/.test(sku)) {
    throw new CatalogInputError("Enter a valid SKU.");
  }
  try {
    return await client.productVariant.create({
      data: {
        workspaceId,
        productId,
        name,
        sku,
        price: priceValue(input.price),
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new CatalogConflictError("That variant name or SKU already exists.");
    }
    throw error;
  }
}

export async function updateCategory(
  userId: string,
  workspaceId: string,
  categoryId: string,
  input: { name?: string; slug?: string; description?: string; status?: "ACTIVE" | "ARCHIVED" },
  client: CatalogClient = prisma,
) {
  await requireCatalogAccess(userId, workspaceId, "catalog:manage", client);
  const existing = await client.category.findFirst({
    where: { id: categoryId, workspaceId },
  });
  if (!existing) throw new CatalogInputError("Category not found.");
  const value = input.name || input.slug
    ? nameAndSlug(input.name || existing.name, input.slug || existing.slug)
    : null;
  const description = input.description?.trim();
  if (description && description.length > 500) {
    throw new CatalogInputError("Description must be 500 characters or fewer.");
  }
  try {
    return await client.category.update({
      where: { id: categoryId },
      data: {
        ...(value ? { name: value.name, slug: value.slug } : {}),
        ...(input.description !== undefined ? { description: description || null } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new CatalogConflictError("That category name or slug already exists.");
    }
    throw error;
  }
}

export async function updateProduct(
  userId: string,
  workspaceId: string,
  productId: string,
  input: {
    name?: string;
    slug?: string;
    description?: string;
    basePrice?: string | number;
    categoryId?: string | null;
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  },
  client: CatalogClient = prisma,
) {
  await requireCatalogAccess(userId, workspaceId, "catalog:manage", client);
  const existing = await client.product.findFirst({
    where: { id: productId, workspaceId },
  });
  if (!existing) throw new CatalogInputError("Product not found.");
  const value = input.name || input.slug
    ? nameAndSlug(input.name || existing.name, input.slug || existing.slug)
    : null;
  const description = input.description?.trim();
  if (description && description.length > 1000) {
    throw new CatalogInputError("Description must be 1000 characters or fewer.");
  }
  if (input.categoryId) {
    const category = await client.category.findFirst({
      where: { id: input.categoryId, workspaceId, status: { not: "ARCHIVED" } },
    });
    if (!category) throw new CatalogInputError("Choose a valid category.");
  }
  try {
    return await client.product.update({
      where: { id: productId },
      data: {
        ...(value ? { name: value.name, slug: value.slug } : {}),
        ...(input.description !== undefined ? { description: description || null } : {}),
        ...(input.basePrice !== undefined ? { basePrice: priceValue(input.basePrice) } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new CatalogConflictError("That product name or slug already exists.");
    }
    throw error;
  }
}
