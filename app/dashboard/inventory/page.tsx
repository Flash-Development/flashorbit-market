import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/workspaces/onboarding";
import { listInventoryVariants } from "@/lib/inventory/service";
import { InventoryManager } from "@/components/inventory/inventory-manager";
import { roleCan } from "@/lib/authz/permissions";

export default async function InventoryPage() {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) redirect("/sign-in");
  const workspace = await getActiveWorkspaceContext(authenticated.localUser.id);
  if (!workspace) redirect("/onboarding");
  const variants = await listInventoryVariants(
    authenticated.localUser.id,
    workspace.id,
  );
  return (
    <InventoryManager
      canManage={roleCan(workspace.memberships[0]?.role ?? "STAFF", "inventory:manage")}
      initial={variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        product: { name: variant.product.name },
        inventoryBalance: variant.inventoryBalance
          ? {
              quantity: variant.inventoryBalance.quantity,
              reservedQuantity: variant.inventoryBalance.reservedQuantity,
              reorderPoint: variant.inventoryBalance.reorderPoint,
            }
          : null,
      }))}
    />
  );
}
