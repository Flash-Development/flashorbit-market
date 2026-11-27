import { NextResponse } from "next/server";
import { createProduct } from "@/lib/catalog/service";
import {
  catalogError,
  getCatalogContext,
  parseCatalogBody,
} from "@/lib/catalog/api";

export async function POST(request: Request) {
  const context = await getCatalogContext(request);
  if (!context) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const body = await parseCatalogBody(request) as Record<string, unknown>;
    if (
      typeof body.name !== "string" ||
      (typeof body.basePrice !== "string" && typeof body.basePrice !== "number")
    ) {
      return NextResponse.json(
        { error: "Product name and base price are required." },
        { status: 400 },
      );
    }
    const product = await createProduct(
      context.userId,
      context.workspace.id,
      {
        name: body.name,
        slug: typeof body.slug === "string" ? body.slug : undefined,
        description: typeof body.description === "string" ? body.description : undefined,
        basePrice: body.basePrice,
        categoryId: typeof body.categoryId === "string" ? body.categoryId : undefined,
      },
    );
    return NextResponse.json({
      ...product,
      basePrice: product.basePrice.toString(),
    }, { status: 201 });
  } catch (error) {
    return catalogError(error);
  }
}
