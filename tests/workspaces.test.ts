import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkspace,
  listUserWorkspaces,
  requireWorkspaceCapability,
  resolveMembership,
} from "../lib/workspaces/service";
import { WorkspaceAuthorizationError } from "../lib/workspaces/errors";
import { testClient } from "./test-client";

test("workspace creation is atomic and creates OWNER membership", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const workspace = await createWorkspace(
    { userId: `test-owner-${suffix}`, email: `owner-${suffix}@flash.test` },
    { name: `Test Store ${suffix}` },
    prisma,
  );
  assert.equal(workspace.country, "NG");
  assert.equal(workspace.currency, "NGN");
  assert.equal(workspace.timezone, "Africa/Lagos");
  assert.equal(workspace.memberships[0]?.role, "OWNER");
  assert.equal(workspace.memberships[0]?.status, "ACTIVE");
  assert.equal(workspace.stores.length, 1);
  await prisma.workspace.delete({ where: { id: workspace.id } });
});

test("duplicate slugs fail and workspace isolation is enforced", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const first = await createWorkspace(
    { userId: `owner-a-${suffix}`, email: `owner-a-${suffix}@flash.test` },
    { name: "Isolation Store", slug: `isolation-${suffix}` },
    prisma,
  );
  await assert.rejects(
    createWorkspace(
      { userId: `owner-b-${suffix}`, email: `owner-b-${suffix}@flash.test` },
      { name: "Other Store", slug: first.slug },
      prisma,
    ),
  );
  await assert.rejects(
    resolveMembership(`other-${suffix}`, first.slug, prisma),
    WorkspaceAuthorizationError,
  );
  await assert.rejects(
    requireWorkspaceCapability(`other-${suffix}`, first.slug, "workspace:update", prisma),
    WorkspaceAuthorizationError,
  );
  const workspaces = await listUserWorkspaces(`owner-a-${suffix}`, prisma);
  assert.equal(workspaces[0]?.slug, first.slug);
  await prisma.workspace.delete({ where: { id: first.id } });
});
