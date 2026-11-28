import assert from "node:assert/strict";
import test from "node:test";
import { createWorkspace } from "../lib/workspaces/create";
import {
  createWorkspaceInvitation,
  revokeWorkspaceInvitation,
} from "../lib/workspaces/invitations";
import { acceptWorkspaceInvitation } from "../lib/workspaces/invitation-acceptance";
import { testClient } from "./test-client";

test("invitation expiry, replacement, and delivery failure are recorded", async (context) => {
  const prisma = testClient();
  const suffix = crypto.randomUUID().slice(0, 8);
  const ownerId = `invite-owner-${suffix}`;
  const owner = await createWorkspace(
    { userId: ownerId, email: `${ownerId}@flash-orbit.test` },
    { name: "Invitation Owner", slug: `invite-owner-${suffix}` },
    prisma,
  );
  context.after(async () => {
    await prisma.workspace.delete({ where: { id: owner.id } });
    await prisma.user.delete({ where: { id: ownerId } });
    await prisma.$disconnect();
  });

  const expired = await createWorkspaceInvitation(
    ownerId, owner.slug, `expired-${suffix}@flash-orbit.test`, "STAFF", prisma, async () => {},
  );
  await prisma.workspaceInvitation.update({
    where: { id: expired.id },
    data: { expiresAt: new Date(Date.now() - 1_000) },
  });
  await assert.rejects(
    revokeWorkspaceInvitation(ownerId, owner.slug, expired.id, prisma),
    /Invitation has expired/,
  );
  assert.equal(
    (await prisma.workspaceInvitation.findUnique({ where: { id: expired.id } }))?.status,
    "EXPIRED",
  );

  const replacementEmail = `replacement-${suffix}@flash-orbit.test`;
  const replaced = await createWorkspaceInvitation(
    ownerId, owner.slug, replacementEmail, "STAFF", prisma, async () => {},
  );
  const replacement = await createWorkspaceInvitation(
    ownerId, owner.slug, replacementEmail, "MANAGER", prisma, async () => {},
  );
  assert.equal((await prisma.workspaceInvitation.findUnique({ where: { id: replaced.id } }))?.status, "REVOKED");
  assert.equal((await prisma.workspaceInvitation.findUnique({ where: { id: replacement.id } }))?.status, "PENDING");

  await assert.rejects(
    createWorkspaceInvitation(
      ownerId,
      owner.slug,
      `delivery-failure-${suffix}@flash-orbit.test`,
      "STAFF",
      prisma,
      async () => { throw new Error("Email delivery failed."); },
    ),
    /Email delivery failed/,
  );
  const audits = await prisma.auditLog.findMany({ where: { workspaceId: owner.id } });
  assert.ok(audits.some((entry) => entry.action === "invitation.expired"));
  assert.ok(audits.some((entry) => entry.action === "invitation.replaced"));
  assert.ok(audits.some((entry) => entry.action === "invitation.delivery_failed"));
});

test("concurrent invitation acceptance and revocation grant access only when acceptance wins", async (context) => {
  const prisma = testClient();
  const suffix = crypto.randomUUID().slice(0, 8);
  const ownerId = `race-owner-${suffix}`;
  const inviteeId = `race-invitee-${suffix}`;
  const owner = await createWorkspace(
    { userId: ownerId, email: `${ownerId}@flash-orbit.test` },
    { name: "Invitation Race Owner", slug: `race-owner-${suffix}` },
    prisma,
  );
  const invitee = await createWorkspace(
    { userId: inviteeId, email: `${inviteeId}@flash-orbit.test` },
    { name: "Invitation Race Invitee", slug: `race-invitee-${suffix}` },
    prisma,
  );
  context.after(async () => {
    await prisma.workspace.deleteMany({ where: { id: { in: [owner.id, invitee.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, inviteeId] } } });
    await prisma.$disconnect();
  });

  let inviteUrl = "";
  const invitation = await createWorkspaceInvitation(
    ownerId,
    owner.slug,
    `${inviteeId}@flash-orbit.test`,
    "STAFF",
    prisma,
    async ({ url }) => { inviteUrl = url; },
  );
  const token = new URL(inviteUrl).searchParams.get("token");
  assert.ok(token);

  const outcomes = await Promise.allSettled([
    acceptWorkspaceInvitation(inviteeId, `${inviteeId}@flash-orbit.test`, token, prisma),
    revokeWorkspaceInvitation(ownerId, owner.slug, invitation.id, prisma),
  ]);
  assert.equal(outcomes.filter((outcome) => outcome.status === "fulfilled").length, 1);
  assert.equal(outcomes.filter((outcome) => outcome.status === "rejected").length, 1);

  const savedInvitation = await prisma.workspaceInvitation.findUnique({
    where: { id: invitation.id },
  });
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: inviteeId, workspaceId: owner.id } },
  });
  if (outcomes[0].status === "fulfilled") {
    assert.equal(savedInvitation?.status, "ACCEPTED");
    assert.equal(membership?.status, "ACTIVE");
    assert.equal(membership?.role, "STAFF");
  } else {
    assert.equal(savedInvitation?.status, "REVOKED");
    assert.equal(membership, null);
  }
});
