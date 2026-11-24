import assert from "node:assert/strict";
import test from "node:test";
import { assertAvailableWorkspaceSlug } from "../lib/workspaces/slugs";
import { createOnboardingWorkspace, getAuthenticatedWorkspaceContext } from "../lib/workspaces/onboarding";
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
    email: `onboard-${suffix}@flash.test`,
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
      `second-${suffix}@flash.test`,
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
    email: `one-workspace-${suffix}@flash.test`,
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

test("concurrent workspace creation is reduced to one result", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const principal = {
    userId: `concurrent-${suffix}`,
    email: `concurrent-${suffix}@flash.test`,
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
