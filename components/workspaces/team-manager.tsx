"use client";

import { useState, type FormEvent } from "react";
import type { MembershipRole } from "@/generated/prisma/client";

type Member = {
  id: string;
  userId: string;
  role: MembershipRole;
  email: string;
  name: string;
};
type Invitation = {
  id: string;
  email: string;
  role: MembershipRole;
  expiresAt: Date;
};

export function TeamManager({
  workspaceSlug,
  currentUserId,
  members: initialMembers,
  invitations: initialInvitations,
  canInvite,
  canManageRoles,
  canRemoveMembers,
  actorRole,
}: {
  workspaceSlug: string;
  currentUserId: string;
  members: Member[];
  invitations: Invitation[];
  canInvite: boolean;
  canManageRoles: boolean;
  canRemoveMembers: boolean;
  actorRole: MembershipRole;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const base = `/api/workspaces/${encodeURIComponent(workspaceSlug)}`;

  async function request(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Workspace request failed.");
    }
    return response.status === 204 ? null : response.json();
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const result = await request(`${base}/invitations`, "POST", data);
      setInvitations((current) => [result.invitation, ...current]);
      event.currentTarget.reset();
      setNotice("Invitation sent.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invitation failed.");
    } finally {
      setPending(false);
    }
  }

  async function updateRole(userId: string, role: MembershipRole) {
    setError("");
    try {
      await request(`${base}/members`, "PATCH", { userId, role });
      setMembers((current) => current.map((member) => member.userId === userId ? { ...member, role } : member));
      setNotice("Member role updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Role update failed.");
    }
  }

  async function removeMember(userId: string) {
    if (!window.confirm("Remove this member from the workspace?")) return;
    setError("");
    try {
      await request(`${base}/members`, "DELETE", { userId });
      setMembers((current) => current.filter((member) => member.userId !== userId));
      setNotice("Member removed.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Member removal failed.");
    }
  }

  async function revokeInvitation(id: string) {
    setError("");
    try {
      await request(`${base}/invitations/${id}`, "DELETE");
      setInvitations((current) => current.filter((invitation) => invitation.id !== id));
      setNotice("Invitation revoked.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invitation revocation failed.");
    }
  }

  const roles: MembershipRole[] = actorRole === "OWNER"
    ? ["ADMIN", "MANAGER", "STAFF"]
    : ["MANAGER", "STAFF"];
  return (
    <div className="workspace-operations">
      <header className="catalog-head">
        <div><span className="app-eyebrow">Workspace</span><h1>Team</h1></div>
        <span className="app-status">{members.length} members</span>
      </header>
      {error ? <p className="catalog-error" role="alert">{error}</p> : null}
      {notice ? <p className="catalog-success" role="status">{notice}</p> : null}
      {canInvite ? (
        <form className="catalog-panel workspace-invite-form" onSubmit={invite}>
          <h2>Invite a teammate</h2>
          <label><span>Email address</span><input name="email" type="email" required maxLength={254} /></label>
          <label><span>Role</span><select name="role" defaultValue="STAFF">{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
          <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send invitation"}</button>
        </form>
      ) : null}
      <section className="workspace-ops-panel" aria-labelledby="team-members-heading">
        <h2 id="team-members-heading">Members</h2>
        {members.map((member) => (
          <article className="workspace-member-row" key={member.id}>
            <div><strong>{member.name || member.email}</strong><small>{member.email}</small></div>
            <span>{member.role}</span>
            {canManageRoles && member.role !== "OWNER" && member.userId !== currentUserId ? (
              <label><span className="sr-only">Role for {member.email}</span><select value={member.role} onChange={(event) => void updateRole(member.userId, event.currentTarget.value as MembershipRole)}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
            ) : null}
            {canRemoveMembers && member.role !== "OWNER" && member.userId !== currentUserId &&
              !(actorRole === "ADMIN" && member.role === "ADMIN") ? (
                <button type="button" className="workspace-secondary-button" onClick={() => void removeMember(member.userId)}>Remove</button>
              ) : null}
          </article>
        ))}
      </section>
      <section className="workspace-ops-panel" aria-labelledby="pending-invitations-heading">
        <h2 id="pending-invitations-heading">Pending invitations</h2>
        {invitations.length ? invitations.map((invitation) => (
          <article className="workspace-member-row" key={invitation.id}>
            <div><strong>{invitation.email}</strong><small>{invitation.role} · Expires {new Date(invitation.expiresAt).toLocaleDateString()}</small></div>
            {canInvite ? <button type="button" className="workspace-secondary-button" onClick={() => void revokeInvitation(invitation.id)}>Revoke</button> : null}
          </article>
        )) : <p>No pending invitations.</p>}
      </section>
    </div>
  );
}
