import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

if (process.env.NODE_ENV === "production" ||
    process.env.FLASH_DEV_SEED !== "1") {
  throw new Error("Development seed is disabled.");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "owner@flash.local" },
    update: { status: "ACTIVE", profile: { update: { name: "Flash Developer" } } },
    create: {
      id: "dev_owner",
      email: "owner@flash.local",
      profile: { create: { name: "Flash Developer" } },
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "flash-demo" },
    update: {
      name: "Flash Demo",
      country: "NG",
      currency: "NGN",
      timezone: "Africa/Lagos",
      status: "ACTIVE",
    },
    create: {
      id: "flash_demo_workspace",
      name: "Flash Demo",
      slug: "flash-demo",
      country: "NG",
      currency: "NGN",
      timezone: "Africa/Lagos",
      memberships: {
        create: { userId: user.id, role: "OWNER", status: "ACTIVE" },
      },
      stores: {
        create: { name: "Flash Demo", slug: "flash-demo", ownerId: user.id },
      },
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    },
    update: { role: "OWNER", status: "ACTIVE" },
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  await prisma.store.upsert({
    where: { slug: "flash-demo" },
    update: {
      workspaceId: workspace.id,
      ownerId: user.id,
      name: "Flash Demo",
      status: "ACTIVE",
    },
    create: {
      workspaceId: workspace.id,
      ownerId: user.id,
      name: "Flash Demo",
      slug: "flash-demo",
      status: "ACTIVE",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
