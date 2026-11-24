import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function synchronizeApplicationUser(identity: {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}) {
  if (!identity.emailVerified) {
    throw new Error("Email must be verified before identity synchronization.");
  }
  const email = identity.email.trim().toLowerCase();
  return prisma.$transaction(async (tx) => {
    const external = await tx.externalIdentity.findUnique({
      where: {
        provider_subject: {
          provider: "better-auth",
          subject: identity.id,
        },
      },
      include: { user: true },
    });
    if (external) {
      if (external.user.status !== "ACTIVE") return external.user;
      return tx.user.update({
        where: { id: external.userId },
        data: {
          email,
          profile: {
            upsert: {
              create: { name: identity.name || null },
              update: { name: identity.name || null },
            },
          },
        },
        include: { profile: true },
      });
    }
    const existing = await tx.user.findUnique({ where: { email } });
    if (existing) {
      if (!identity.emailVerified) {
        throw new Error("Email identity must be verified before account linking.");
      }
      if (existing.status !== "ACTIVE") return existing;
      const user = await tx.user.update({
        where: { id: existing.id },
        data: {
          email,
          profile: {
            upsert: {
              create: { name: identity.name || null },
              update: { name: identity.name || null },
            },
          },
        },
        include: { profile: true },
      });
      await tx.externalIdentity.create({
        data: {
          provider: "better-auth",
          subject: identity.id,
          userId: existing.id,
          email,
        },
      });
      return user;
    }
    const user = await tx.user.create({
      data: {
        id: identity.id,
        email,
        status: "ACTIVE",
        profile: { create: { name: identity.name || null } },
      },
      include: { profile: true },
    });
    await tx.externalIdentity.create({
      data: {
        provider: "better-auth",
        subject: identity.id,
        userId: user.id,
        email,
      },
    });
    return user;
  });
}
