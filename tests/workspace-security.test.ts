import assert from "node:assert/strict";
import test from "node:test";
import {
  changeMembershipRole,
  createWorkspace,
  resolveMembership,
} from "../lib/workspaces/service";
import { testClient } from "./test-client";

test("suspended and deleted users and workspaces are denied", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const workspace = await createWorkspace(
    { userId: `blocked-${suffix}`, email: `blocked-${suffix}@flash-orbit.test` },
    { name: "Blocked Store", slug: `blocked-${suffix}` },
    prisma,
  );
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { status: "SUSPENDED" },
  });
  await assert.rejects(
    resolveMembership(`blocked-${suffix}`, workspace.slug, prisma),
  );
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { status: "DELETED" },
  });
  await assert.rejects(
    resolveMembership(`blocked-${suffix}`, workspace.slug, prisma),
  );
  await prisma.workspace.delete({ where: { id: workspace.id } });
});

test("suspended principals cannot create workspaces", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  await prisma.user.create({
    data: {
      id: `suspended-owner-${suffix}`,
      email: `suspended-owner-${suffix}@flash-orbit.test`,
      status: "SUSPENDED",
    },
  });
  await assert.rejects(
    createWorkspace(
      {
        userId: `suspended-owner-${suffix}`,
        email: `suspended-owner-${suffix}@flash-orbit.test`,
      },
      { name: "Blocked Store", slug: `blocked-store-${suffix}` },
      prisma,
    ),
  );
});

test("role changes reject inactive targets and owner promotion", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID().slice(0, 8);
  const workspace = await createWorkspace(
    { userId: `target-owner-${suffix}`, email: `target-owner-${suffix}@flash-orbit.test` },
    { name: "Target Store", slug: `target-store-${suffix}` },
    prisma,
  );
  await prisma.user.create({
    data: {
      id: `target-user-${suffix}`,
      email: `target-user-${suffix}@flash-orbit.test`,
      status: "ACTIVE",
    },
  });
  await prisma.membership.create({
    data: {
      userId: `target-user-${suffix}`,
      workspaceId: workspace.id,
      role: "STAFF",
      status: "SUSPENDED",
    },
  });
  await assert.rejects(
    changeMembershipRole(
      `target-owner-${suffix}`,
      workspace.slug,
      `target-user-${suffix}`,
      "MANAGER",
      prisma,
    ),
  );
  await assert.rejects(
    changeMembershipRole(
      `target-owner-${suffix}`,
      workspace.slug,
      `target-user-${suffix}`,
      "OWNER",
      prisma,
    ),
  );
  await prisma.workspace.delete({ where: { id: workspace.id } });
});
