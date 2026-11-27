import assert from "node:assert/strict";
import test from "node:test";
import { createWorkspaceInvitation } from "../lib/workspaces/invitations";
import { acceptWorkspaceInvitation } from "../lib/workspaces/invitation-acceptance";
import { createWorkspace } from "../lib/workspaces/create";
import { changeMembershipRole, removeWorkspaceMember } from "../lib/workspaces/membership";
import { getWorkspaceOperations, updateWorkspaceSettings } from "../lib/workspaces/settings";
import { WorkspaceAuthorizationError } from "../lib/workspaces/errors";
import { testClient } from "./test-client";

test("invitations authorize roles, require matching email, and add cross-workspace members", async (context) => {
  const prisma = testClient();
  const suffix = crypto.randomUUID().slice(0, 8);
  const ownerId = `ops-owner-${suffix}`;
  const targetId = `ops-target-${suffix}`;
  const owner = await createWorkspace(
    { userId: ownerId, email: `${ownerId}@flash-orbit.test` },
    { name: "Operations Owner", slug: `ops-owner-${suffix}` },
    prisma,
  );
  const other = await createWorkspace(
    { userId: targetId, email: `${targetId}@flash-orbit.test` },
    { name: "Operations Target", slug: `ops-target-${suffix}` },
    prisma,
  );
  let inviteUrl = "";
  context.after(async () => {
    await prisma.workspace.deleteMany({ where: { id: { in: [owner.id, other.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, targetId] } } });
    await prisma.$disconnect();
  });
  await assert.rejects(
    changeMembershipRole(ownerId, owner.slug, targetId, "OWNER", prisma),
    WorkspaceAuthorizationError,
  );
  const invite = await createWorkspaceInvitation(
    ownerId,
    owner.slug,
    `${targetId}@flash-orbit.test`,
    "MANAGER",
    prisma,
    async ({ url }) => { inviteUrl = url; },
  );
  const token = new URL(inviteUrl).searchParams.get("token");
  assert.ok(token);
  const saved = await prisma.workspaceInvitation.findUnique({ where: { id: invite.id } });
  assert.ok(saved);
  assert.notEqual(saved.tokenHash, token);
  await assert.rejects(
    acceptWorkspaceInvitation(targetId, "wrong@flash-orbit.test", token, prisma),
    WorkspaceAuthorizationError,
  );
  await acceptWorkspaceInvitation(targetId, `${targetId}@flash-orbit.test`, token, prisma);
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: targetId, workspaceId: owner.id } },
  });
  assert.equal(membership?.role, "MANAGER");
  assert.equal((await prisma.user.findUnique({ where: { id: targetId } }))?.workspaceId, owner.id);
  assert.equal((await prisma.workspaceInvitation.findUnique({ where: { id: invite.id } }))?.status, "ACCEPTED");
  assert.equal((await prisma.membership.count({ where: { userId: targetId, status: "ACTIVE" } })), 2);
});

test("settings and member removal enforce workspace role boundaries and write audit events", async (context) => {
  const prisma = testClient();
  const suffix = crypto.randomUUID().slice(0, 8);
  const ownerId = `settings-owner-${suffix}`;
  const staffId = `settings-staff-${suffix}`;
  const workspace = await createWorkspace(
    { userId: ownerId, email: `${ownerId}@flash-orbit.test` },
    { name: "Settings Store", slug: `settings-${suffix}` },
    prisma,
  );
  await prisma.user.create({
    data: { id: staffId, email: `${staffId}@flash-orbit.test` },
  });
  await prisma.membership.create({
    data: { userId: staffId, workspaceId: workspace.id, role: "STAFF" },
  });
  context.after(async () => {
    await prisma.workspace.delete({ where: { id: workspace.id } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, staffId] } } });
    await prisma.$disconnect();
  });
  await assert.rejects(
    updateWorkspaceSettings(staffId, workspace.slug, {
      name: "Changed Store", country: "NG", currency: "NGN", timezone: "Africa/Lagos",
    }, prisma),
    WorkspaceAuthorizationError,
  );
  await assert.rejects(
    removeWorkspaceMember(staffId, workspace.slug, ownerId, prisma),
    WorkspaceAuthorizationError,
  );
  await updateWorkspaceSettings(ownerId, workspace.slug, {
    name: "Updated Store", country: "GH", currency: "GHS", timezone: "Africa/Accra",
  }, prisma);
  await assert.rejects(
    updateWorkspaceSettings(ownerId, "another-tenant", {
      name: "Cross Tenant", country: "NG", currency: "NGN", timezone: "Africa/Lagos",
    }, prisma),
    WorkspaceAuthorizationError,
  );
  const operations = await getWorkspaceOperations(staffId, workspace.slug, prisma);
  assert.equal(operations.workspace.name, "Updated Store");
  assert.ok(operations.subscription.entitlements);
  assert.equal(operations.usage.length, 3);
  assert.equal(operations.auditLogs.length, 0);
  await removeWorkspaceMember(ownerId, workspace.slug, staffId, prisma);
  assert.equal((await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: staffId, workspaceId: workspace.id } },
  }))?.status, "REMOVED");
  const audit = await prisma.auditLog.findMany({ where: { workspaceId: workspace.id } });
  assert.ok(audit.some((entry) => entry.action === "workspace.settings_updated"));
  assert.ok(audit.some((entry) => entry.action === "membership.removed"));
});

test("admins cannot invite admin roles and owners cannot be removed", async (context) => {
  const prisma = testClient();
  const suffix = crypto.randomUUID().slice(0, 8);
  const ownerId = `admin-owner-${suffix}`;
  const adminId = `admin-user-${suffix}`;
  const workspace = await createWorkspace(
    { userId: ownerId, email: `${ownerId}@flash-orbit.test` },
    { name: "Admin Guard Store", slug: `admin-guard-${suffix}` },
    prisma,
  );
  await prisma.user.create({ data: { id: adminId, email: `${adminId}@flash-orbit.test` } });
  await prisma.membership.create({
    data: { userId: adminId, workspaceId: workspace.id, role: "ADMIN" },
  });
  context.after(async () => {
    await prisma.workspace.delete({ where: { id: workspace.id } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, adminId] } } });
    await prisma.$disconnect();
  });
  await assert.rejects(
    createWorkspaceInvitation(
      adminId, workspace.slug, "new-admin@flash-orbit.test", "ADMIN", prisma,
      async () => assert.fail("Unauthorized invitation must not send email."),
    ),
    WorkspaceAuthorizationError,
  );
  await assert.rejects(
    removeWorkspaceMember(ownerId, workspace.slug, ownerId, prisma),
    WorkspaceAuthorizationError,
  );
});
