import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getAuthenticatedWorkspaceContext } from "@/lib/workspaces/onboarding";
import { AppShell } from "@/components/app/app-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) redirect("/sign-in");
  const workspaces = await getAuthenticatedWorkspaceContext(authenticated.localUser.id);
  if (workspaces.length === 0) redirect("/onboarding");
  const workspace = workspaces[0];
  const role = workspace.memberships[0]?.role ?? "STAFF";
  return (
    <AppShell
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      role={role}
    >
      {children}
    </AppShell>
  );
}
