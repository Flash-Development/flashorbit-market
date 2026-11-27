import { NextResponse } from "next/server";
import { createVariant } from "@/lib/catalog/service";
import {
  catalogError,
  getCatalogContext,
  parseCatalogBody,
} from "@/lib/catalog/api";

export async function POST(
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
    if (
      typeof body.name !== "string" ||
      typeof body.sku !== "string" ||
      (typeof body.price !== "string" && typeof body.price !== "number")
    ) {
      return NextResponse.json(
        { error: "Variant name, SKU and price are required." },
        { status: 400 },
      );
    }
    const variant = await createVariant(
      context.userId,
      context.workspace.id,
      productId,
      { name: body.name, sku: body.sku, price: body.price },
    );
    return NextResponse.json({
      ...variant,
      price: variant.price.toString(),
    }, { status: 201 });
  } catch (error) {
    return catalogError(error);
  }
}
