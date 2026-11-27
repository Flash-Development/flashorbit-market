import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/workspaces/onboarding";
import { roleCan } from "@/lib/authz/permissions";
import { listWorkspaceMembers } from "@/lib/workspaces/membership";
import { listWorkspaceInvitations } from "@/lib/workspaces/invitations";
import { TeamManager } from "@/components/workspaces/team-manager";

export default async function TeamPage() {
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) redirect("/sign-in");
  const workspace = await getActiveWorkspaceContext(authenticated.localUser.id);
  if (!workspace) redirect("/onboarding");
  const role = workspace.memberships[0]?.role ?? "STAFF";
  const [members, invitations] = await Promise.all([
    listWorkspaceMembers(authenticated.localUser.id, workspace.slug),
    listWorkspaceInvitations(authenticated.localUser.id, workspace.slug),
  ]);
  return (
    <TeamManager
      workspaceSlug={workspace.slug}
      currentUserId={authenticated.localUser.id}
      members={members}
      invitations={invitations}
      canInvite={roleCan(role, "membership:invite")}
      canManageRoles={roleCan(role, "membership:update")}
      canRemoveMembers={roleCan(role, "membership:remove")}
      actorRole={role}
    />
  );
}
