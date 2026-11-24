export default function DashboardPage() {
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
        <article><span>Products</span><strong>—</strong><small>Not connected yet</small></article>
        <article><span>Inventory</span><strong>—</strong><small>Not connected yet</small></article>
        <article><span>Orders</span><strong>—</strong><small>Not connected yet</small></article>
        <article><span>Finance</span><strong>—</strong><small>Not connected yet</small></article>
      </section>
      <section className="app-empty-state">
        <span>Phase 2A</span>
        <h2>Your workspace is ready.</h2>
        <p>Commerce operations will appear here in later milestones. Your account, workspace and permissions are now established.</p>
      </section>
    </div>
  );
}
