import assert from "node:assert/strict";
import test from "node:test";
import { assertAvailableWorkspaceSlug } from "../lib/workspaces/slugs";
import {
  createOnboardingWorkspace,
  getActiveWorkspaceContext,
  getAuthenticatedWorkspaceContext,
  recoverStaleWorkspaceSelection,
} from "../lib/workspaces/onboarding";
import { testClient } from "./test-client";

test("reserved slug rejection happens before onboarding writes", () => {
  assert.equal(
    assertAvailableWorkspaceSlug("admin").success,
    false,
  );
  assert.equal(
    assertAvailableWorkspaceSlug("www").success,
    false,
  );
});

test("onboarding rejects duplicate slugs and existing users skip a second workspace", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const principal = {
    userId: `onboard-${suffix}`,
    email: `onboard-${suffix}@flash-orbit.test`,
  };
  const first = await createOnboardingWorkspace(
    principal.userId,
    principal.email,
    "Onboard Store",
    `onboard-${suffix}`,
  );
  await assert.rejects(
    createOnboardingWorkspace(
      `second-${suffix}`,
      `second-${suffix}@flash-orbit.test`,
      "Duplicate Store",
      first.slug,
    ),
  );
  const workspaces = await getAuthenticatedWorkspaceContext(principal.userId);
  assert.equal(workspaces.length, 1);
  assert.equal(workspaces[0]?.slug, first.slug);
  await assert.rejects(
    (async () => {
      if ((await getAuthenticatedWorkspaceContext(principal.userId)).length > 0) {
        throw new Error("The user already belongs to a workspace.");
      }
      await createOnboardingWorkspace(
        principal.userId,
        principal.email,
        "Second Store",
        `second-store-${suffix}`,
      );
    })(),
  );
  await prisma.workspace.delete({ where: { id: first.id } });
});

test("createWorkspace rejects a second workspace for the same principal", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const principal = {
    userId: `one-workspace-${suffix}`,
    email: `one-workspace-${suffix}@flash-orbit.test`,
  };
  await createOnboardingWorkspace(
    principal.userId,
    principal.email,
    "First Workspace",
    `first-workspace-${suffix}`,
  );
  await assert.rejects(
    createOnboardingWorkspace(
      principal.userId,
      principal.email,
      "Second Workspace",
      `second-workspace-${suffix}`,
    ),
  );
  const workspaces = await getAuthenticatedWorkspaceContext(principal.userId);
  assert.equal(workspaces.length, 1);
  await prisma.workspace.delete({ where: { id: workspaces[0].id } });
});

test("active workspace context follows the selected membership rather than creation order", async (context) => {
  const prisma = testClient();
  const suffix = crypto.randomUUID().slice(0, 8);
  const firstUserId = `active-first-${suffix}`;
  const secondUserId = `active-second-${suffix}`;
  const first = await createOnboardingWorkspace(
    firstUserId,
    `${firstUserId}@flash-orbit.test`,
    "First Active Context",
    `first-active-${suffix}`,
  );
  const second = await createOnboardingWorkspace(
    secondUserId,
    `${secondUserId}@flash-orbit.test`,
    "Second Active Context",
    `second-active-${suffix}`,
  );
  context.after(async () => {
    await prisma.workspace.deleteMany({ where: { id: { in: [first.id, second.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [firstUserId, secondUserId] } } });
    await prisma.$disconnect();
  });

  await prisma.membership.create({
    data: { userId: firstUserId, workspaceId: second.id, role: "STAFF" },
  });
  await prisma.user.update({
    where: { id: firstUserId },
    data: { workspaceId: second.id },
  });

  const memberships = await getAuthenticatedWorkspaceContext(firstUserId);
  assert.equal(memberships[0]?.id, first.id);
  assert.equal((await getActiveWorkspaceContext(firstUserId))?.id, second.id);

  await prisma.membership.updateMany({
    where: { userId: firstUserId, workspaceId: second.id },
    data: { status: "REMOVED" },
  });
  assert.equal(await getActiveWorkspaceContext(firstUserId), null);
  const remainingMemberships = await getAuthenticatedWorkspaceContext(firstUserId);
  assert.equal(
    (await recoverStaleWorkspaceSelection(firstUserId, remainingMemberships))?.id,
    first.id,
  );
  assert.equal((await getActiveWorkspaceContext(firstUserId))?.id, first.id);

  await prisma.membership.updateMany({
    where: { userId: firstUserId, workspaceId: second.id },
    data: { status: "ACTIVE" },
  });
  await prisma.user.update({
    where: { id: firstUserId },
    data: { workspaceId: second.id },
  });
  await prisma.workspace.update({
    where: { id: second.id },
    data: { status: "SUSPENDED" },
  });
  assert.equal(await getActiveWorkspaceContext(firstUserId), null);
  assert.equal(
    (await recoverStaleWorkspaceSelection(
      firstUserId,
      await getAuthenticatedWorkspaceContext(firstUserId),
    ))?.id,
    first.id,
  );

  await prisma.user.update({
    where: { id: firstUserId },
    data: { workspaceId: null },
  });
  assert.equal((await getActiveWorkspaceContext(firstUserId))?.id, first.id);
});

test("concurrent workspace creation is reduced to one result", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const principal = {
    userId: `concurrent-${suffix}`,
    email: `concurrent-${suffix}@flash-orbit.test`,
  };
  const outcomes = await Promise.allSettled([
    createOnboardingWorkspace(
      principal.userId,
      principal.email,
      "Concurrent One",
      `concurrent-one-${suffix}`,
    ),
    createOnboardingWorkspace(
      principal.userId,
      principal.email,
      "Concurrent Two",
      `concurrent-two-${suffix}`,
    ),
  ]);
  assert.equal(
    outcomes.filter((outcome) => outcome.status === "fulfilled").length,
    1,
  );
  const workspaces = await getAuthenticatedWorkspaceContext(principal.userId);
  assert.equal(workspaces.length, 1);
  await prisma.workspace.delete({ where: { id: workspaces[0].id } });
});
