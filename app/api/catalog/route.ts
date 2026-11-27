import { NextResponse } from "next/server";
import { listCatalog } from "@/lib/catalog/service";
import { getCatalogContext, catalogError } from "@/lib/catalog/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getCatalogContext(request, false);
  if (!context) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const catalog = await listCatalog(context.userId, context.workspace.id);
    return NextResponse.json({
      categories: catalog.categories,
      products: catalog.products.map((product) => ({
        ...product,
        basePrice: product.basePrice.toString(),
        variants: product.variants.map((variant) => ({
          ...variant,
          price: variant.price.toString(),
        })),
      })),
    });
  } catch (error) {
    return catalogError(error);
  }
}
