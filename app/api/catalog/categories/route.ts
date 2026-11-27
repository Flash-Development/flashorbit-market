import { NextResponse } from "next/server";
import { createCategory } from "@/lib/catalog/service";
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
    const body = await parseCatalogBody(request) as {
      name?: unknown;
      slug?: unknown;
      description?: unknown;
    };
    if (typeof body.name !== "string") {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }
    const category = await createCategory(
      context.userId,
      context.workspace.id,
      {
        name: body.name,
        slug: typeof body.slug === "string" ? body.slug : undefined,
        description: typeof body.description === "string" ? body.description : undefined,
      },
    );
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return catalogError(error);
  }
}
