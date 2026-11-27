import { NextResponse } from "next/server";
import { updateCategory } from "@/lib/catalog/service";
import {
  catalogError,
  getCatalogContext,
  parseCatalogBody,
} from "@/lib/catalog/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const context = await getCatalogContext(request);
  if (!context) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const { categoryId } = await params;
    const body = await parseCatalogBody(request) as Record<string, unknown>;
    const category = await updateCategory(
      context.userId,
      context.workspace.id,
      categoryId,
      {
        name: typeof body.name === "string" ? body.name : undefined,
        slug: typeof body.slug === "string" ? body.slug : undefined,
        description: typeof body.description === "string" ? body.description : undefined,
        status: body.status === "ACTIVE" || body.status === "ARCHIVED"
          ? body.status
          : undefined,
      },
    );
    return NextResponse.json(category);
  } catch (error) {
    return catalogError(error);
  }
}
