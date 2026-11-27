import { NextResponse } from "next/server";
import { listInventory } from "@/lib/inventory/service";
import { getInventoryContext, inventoryError } from "@/lib/inventory/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getInventoryContext(request, false);
  if (!context) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const balances = await listInventory(context.userId, context.workspace.id);
    return NextResponse.json({
      balances: balances.map((balance) => ({
        id: balance.id,
        variantId: balance.variantId,
        quantity: balance.quantity,
        reservedQuantity: balance.reservedQuantity,
        reorderPoint: balance.reorderPoint,
        updatedAt: balance.updatedAt,
        variant: balance.variant,
      })),
    });
  } catch (error) {
    return inventoryError(error);
  }
}
