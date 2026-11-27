import { NextResponse } from "next/server";
import { updateProduct } from "@/lib/catalog/service";
import {
  catalogError,
  getCatalogContext,
  parseCatalogBody,
} from "@/lib/catalog/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const context = await getCatalogContext(request);
  if (!context) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const { productId } = await params;
    const body = await parseCatalogBody(request) as Record<string, unknown>;
    const product = await updateProduct(
      context.userId,
      context.workspace.id,
      productId,
      {
        name: typeof body.name === "string" ? body.name : undefined,
        slug: typeof body.slug === "string" ? body.slug : undefined,
        description: typeof body.description === "string" ? body.description : undefined,
        basePrice: typeof body.basePrice === "string" || typeof body.basePrice === "number"
          ? body.basePrice
          : undefined,
        categoryId: typeof body.categoryId === "string"
          ? body.categoryId
          : body.categoryId === null
            ? null
            : undefined,
        status: body.status === "DRAFT" || body.status === "ACTIVE" || body.status === "ARCHIVED"
          ? body.status
          : undefined,
      },
    );
    return NextResponse.json({
      ...product,
      basePrice: product.basePrice.toString(),
    });
  } catch (error) {
    return catalogError(error);
  }
}
