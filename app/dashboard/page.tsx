import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/workspaces/onboarding";
import { listCatalog } from "@/lib/catalog/service";
import { listInventory } from "@/lib/inventory/service";

export default async function DashboardPage() {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) redirect("/sign-in");
  const workspace = await getActiveWorkspaceContext(authenticated.localUser.id);
  if (!workspace) redirect("/onboarding");
  const catalog = await listCatalog(authenticated.localUser.id, workspace.id);
  const inventory = await listInventory(authenticated.localUser.id, workspace.id);
  return (
    <div className="dashboard-overview">
      <div className="dashboard-overview-head">
        <div>
          <span className="app-eyebrow">Overview</span>
          <h1>Good to see you.</h1>
        </div>
        <span className="app-status">Workspace ready</span>
      </div>
      <section className="app-kpi-grid" aria-label="Workspace summary">
        <article><span>Products</span><strong>{catalog.products.length}</strong><small>{catalog.categories.length} categories</small></article>
        <article><span>Inventory units</span><strong>{inventory.reduce((total, balance) => total + balance.quantity, 0)}</strong><small>{inventory.filter((balance) => balance.quantity <= balance.reorderPoint).length} at/below reorder</small></article>
        <article><span>Orders</span><strong>—</strong><small>Not connected yet</small></article>
        <article><span>Finance</span><strong>—</strong><small>Not connected yet</small></article>
      </section>
      <section className="app-empty-state">
        <span>Phases 2B–2C</span>
        <h2>Your catalog and inventory are ready.</h2>
        <p>Manage products, categories, variants, and stock in one workspace. Orders and financial operations are not included yet.</p>
      </section>
    </div>
  );
}
