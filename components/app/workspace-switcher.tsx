"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type WorkspaceOption = { id: string; name: string; slug: string };

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function switchWorkspace(workspaceId: string) {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/workspaces/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Workspace could not be changed.");
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Workspace could not be changed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="workspace-switcher">
      <label className="workspace-switcher-label" htmlFor="active-workspace">
        Current workspace
      </label>
      <select
        id="active-workspace"
        value={activeWorkspaceId}
        disabled={pending || workspaces.length < 2}
        onChange={(event) => void switchWorkspace(event.currentTarget.value)}
      >
        {workspaces.map((workspace) => (
          <option value={workspace.id} key={workspace.id}>
            {workspace.name} · {workspace.slug}
          </option>
        ))}
      </select>
      {error ? <span className="app-signout-error" role="alert">{error}</span> : null}
    </div>
  );
}
