import assert from "node:assert/strict";
import test from "node:test";
import { synchronizeApplicationUser } from "../lib/auth/sync-user";
import { testClient } from "./test-client";

test("identity synchronization creates one local user and external identity", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID();
  const identity = {
    id: `provider-${suffix}`,
    email: `identity-${suffix}@flash.test`,
    name: "Sync User",
    emailVerified: true,
  };
  const user = await synchronizeApplicationUser(identity);
  const duplicate = await synchronizeApplicationUser(identity);
  assert.equal(duplicate.id, user.id);
  const mapped = await prisma.externalIdentity.findUnique({
    where: {
      provider_subject: {
        provider: "better-auth",
        subject: identity.id,
      },
    },
  });
  assert.equal(mapped?.userId, user.id);
});

test("unverified identities do not link to existing email identities", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID();
  const email = `unverified-${suffix}@flash.test`;
  await prisma.user.create({
    data: { id: `existing-${suffix}`, email, status: "ACTIVE" },
  });
  const identity = {
    id: `provider-${suffix}`,
    email,
    name: "Unverified User",
    emailVerified: false,
  };
  await assert.rejects(
    synchronizeApplicationUser(identity),
    /verified before identity synchronization/,
  );
  const external = await prisma.externalIdentity.findUnique({
    where: {
      provider_subject: {
        provider: "better-auth",
        subject: identity.id,
      },
    },
  });
  assert.equal(external, null);
});

test("unverified identities cannot create local users", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID();
  const identity = {
    id: `provider-${suffix}`,
    email: `unverified-new-${suffix}@flash.test`,
    name: "Unverified User",
    emailVerified: false,
  };
  await assert.rejects(
    synchronizeApplicationUser(identity),
    /verified before identity synchronization/,
  );
  assert.equal(
    await prisma.user.findUnique({ where: { email: identity.email } }),
    null,
  );
});

test("suspended local users are not reactivated by identity sync", async (context) => {
  const prisma = testClient();
  context.after(() => prisma.$disconnect());
  const suffix = crypto.randomUUID();
  const email = `suspended-${suffix}@flash.test`;
  const existing = await prisma.user.create({
    data: { id: `user-${suffix}`, email, status: "SUSPENDED" },
  });
  const identity = {
    id: `provider-${suffix}`,
    email,
    name: "Suspended User",
    emailVerified: true,
  };
  const synchronized = await synchronizeApplicationUser(identity);
  assert.equal(synchronized.id, existing.id);
  assert.equal(synchronized.status, "SUSPENDED");
});
