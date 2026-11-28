"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  timezone: string;
};
type Usage = { id: string; metric: string; quantity: number; periodStart: Date };
type AuditEntry = {
  id: string;
  action: string;
  targetType: string;
  actorName: string;
  createdAt: Date;
};
type EntitlementFeatures = { features?: unknown };

const usageDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "short",
  timeZone: "UTC",
});
const auditDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "UTC",
});

export function WorkspaceSettingsManager({
  workspace: initialWorkspace,
  subscription,
  usage,
  auditLogs,
  canManage,
  canReadAudit,
}: {
  workspace: Workspace;
  subscription: { planCode: string; status: string; entitlements: unknown } | null;
  usage: Usage[];
  auditLogs: AuditEntry[];
  canManage: boolean;
  canReadAudit: boolean;
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const entitlements = subscription?.entitlements;
  const featureValues = entitlements && typeof entitlements === "object" &&
    "features" in entitlements
    ? (entitlements as EntitlementFeatures).features
    : null;
  const features = Array.isArray(featureValues)
    ? featureValues.filter((feature): feature is string => typeof feature === "string")
    : [];

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspace.slug)}/settings`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Settings could not be saved.");
      setWorkspace(result.workspace);
      setNotice("Workspace settings saved.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Settings could not be saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="workspace-operations">
      <header className="catalog-head">
        <div><span className="app-eyebrow">Workspace</span><h1>Settings</h1></div>
        <span className="app-status">{workspace.slug}</span>
      </header>
      {error ? <p className="catalog-error" role="alert">{error}</p> : null}
      {notice ? <p className="catalog-success" role="status">{notice}</p> : null}
      <form className="catalog-panel workspace-settings-form" onSubmit={save}>
        <h2>Business details</h2>
        <label><span>Workspace name</span><input name="name" required minLength={2} maxLength={100} defaultValue={workspace.name} disabled={!canManage} /></label>
        <label><span>Country code</span><input name="country" required minLength={2} maxLength={2} defaultValue={workspace.country} disabled={!canManage} /></label>
        <label><span>Currency code</span><input name="currency" required minLength={3} maxLength={3} defaultValue={workspace.currency} disabled={!canManage} /></label>
        <label><span>Time zone</span><input name="timezone" required maxLength={100} defaultValue={workspace.timezone} disabled={!canManage} /></label>
        {canManage ? <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button> : <p className="catalog-read-only" role="status">You have read-only access to workspace settings.</p>}
      </form>
      {subscription ? (
        <section className="workspace-ops-panel">
          <h2>Subscription foundation</h2>
          <p><strong>{subscription.planCode}</strong> · {subscription.status}</p>
          <p>No billing provider or usage limits are configured. Usage is measured for planning and is not quota-enforced.</p>
          <ul className="workspace-entitlement-list">
            {features.map((feature) => <li key={feature}>{feature.replaceAll("_", " ")}</li>)}
          </ul>
        </section>
      ) : <p className="catalog-read-only" role="status">Subscription details are available to workspace administrators.</p>}
      <section className="workspace-ops-panel">
        <h2>Usage history</h2>
        {usage.length ? usage.map((entry) => (
          <p className="workspace-history-row" key={entry.id}>
            <span>{entry.metric.replaceAll("_", " ")}</span>
            <strong>{entry.quantity}</strong>
            <time dateTime={new Date(entry.periodStart).toISOString()}>{usageDateFormatter.format(new Date(entry.periodStart))}</time>
          </p>
        )) : <p>No usage snapshots yet.</p>}
      </section>
      {canReadAudit ? (
        <section className="workspace-ops-panel">
          <h2>Recent activity</h2>
          {auditLogs.length ? auditLogs.map((entry) => (
            <p className="workspace-history-row" key={entry.id}>
              <span>{entry.actorName}: {entry.action.replaceAll(".", " ")}</span>
              <time dateTime={new Date(entry.createdAt).toISOString()}>{auditDateTimeFormatter.format(new Date(entry.createdAt))}</time>
            </p>
          )) : <p>No workspace activity recorded yet.</p>}
        </section>
      ) : <p className="catalog-read-only" role="status">Activity history is available to workspace administrators.</p>}
    </div>
  );
}
