import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/workspaces/onboarding";
import { listCatalog } from "@/lib/catalog/service";
import { CatalogManager } from "@/components/catalog/catalog-manager";
import { roleCan } from "@/lib/authz/permissions";

export default async function ProductsPage() {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) redirect("/sign-in");
  const workspace = await getActiveWorkspaceContext(authenticated.localUser.id);
  if (!workspace) redirect("/onboarding");
  const catalog = await listCatalog(authenticated.localUser.id, workspace.id);
  return (
    <CatalogManager
      canManage={roleCan(workspace.memberships[0]?.role ?? "STAFF", "catalog:manage")}
      initial={{
        categories: catalog.categories,
        products: catalog.products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          basePrice: product.basePrice.toString(),
          status: product.status,
          category: product.category,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            price: variant.price.toString(),
            status: variant.status,
          })),
        })),
      }}
    />
  );
}
