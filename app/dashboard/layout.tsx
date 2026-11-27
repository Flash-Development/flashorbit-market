import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  getActiveWorkspaceContext,
  getAuthenticatedWorkspaceContext,
} from "@/lib/workspaces/onboarding";
import { AppShell } from "@/components/app/app-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) redirect("/sign-in");
  const [workspaces, workspace] = await Promise.all([
    getAuthenticatedWorkspaceContext(authenticated.localUser.id),
    getActiveWorkspaceContext(authenticated.localUser.id),
  ]);
  if (!workspace) redirect("/onboarding");
  const role = workspace.memberships[0]?.role ?? "STAFF";
  return (
    <AppShell
      workspaceName={workspace.name}
      role={role}
      workspaces={workspaces.map(({ id, name, slug }) => ({ id, name, slug }))}
      activeWorkspaceId={workspace.id}
    >
      {children}
    </AppShell>
  );
}
