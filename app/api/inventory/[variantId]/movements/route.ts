import { NextResponse } from "next/server";
import {
  adjustInventory,
  listInventoryMovements,
} from "@/lib/inventory/service";
import {
  getInventoryContext,
  inventoryError,
  parseInventoryBody,
} from "@/lib/inventory/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  const context = await getInventoryContext(request, false);
  if (!context) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const { variantId } = await params;
    const movements = await listInventoryMovements(
      context.userId,
      context.workspace.id,
      variantId,
    );
    return NextResponse.json({ movements });
  } catch (error) {
    return inventoryError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  const context = await getInventoryContext(request);
  if (!context) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const { variantId } = await params;
    const body = await parseInventoryBody(request) as Record<string, unknown>;
    if (
      typeof body.delta !== "number" ||
      !Number.isInteger(body.delta)
    ) {
      return NextResponse.json(
        { error: "Inventory change must be a whole number." },
        { status: 400 },
      );
    }
    const balance = await adjustInventory(
      context.userId,
      context.workspace.id,
      variantId,
      {
        delta: body.delta,
        reason: typeof body.reason === "string" ? body.reason : undefined,
        reorderPoint: typeof body.reorderPoint === "number"
          ? body.reorderPoint
          : undefined,
      },
    );
    return NextResponse.json({
      id: balance.id,
      variantId: balance.variantId,
      quantity: balance.quantity,
      reservedQuantity: balance.reservedQuantity,
      reorderPoint: balance.reorderPoint,
    }, { status: 201 });
  } catch (error) {
    return inventoryError(error);
  }
}
