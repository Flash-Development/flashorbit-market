import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/workspaces/onboarding";
import { roleCan } from "@/lib/authz/permissions";
import { getWorkspaceOperations } from "@/lib/workspaces/settings";
import { WorkspaceSettingsManager } from "@/components/workspaces/settings-manager";

export default async function SettingsPage() {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) redirect("/sign-in");
  const workspace = await getActiveWorkspaceContext(authenticated.localUser.id);
  if (!workspace) redirect("/onboarding");
  const operations = await getWorkspaceOperations(
    authenticated.localUser.id,
    workspace.slug,
  );
  const role = workspace.memberships[0]?.role ?? "STAFF";
  return (
    <WorkspaceSettingsManager
      workspace={operations.workspace}
      subscription={operations.subscription}
      usage={operations.usage}
      auditLogs={operations.auditLogs}
      canManage={roleCan(role, "workspace:update")}
      canReadAudit={roleCan(role, "audit:read")}
    />
  );
}
