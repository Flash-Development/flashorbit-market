import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function ensureApplicationUser(
  userId: string,
  email: string,
  client: { user: PrismaClient["user"] } = prisma,
) {
  const normalizedEmail = email.trim().toLowerCase();
  return client.user.upsert({
    where: { id: userId },
    update: { email: normalizedEmail },
    create: { id: userId, email: normalizedEmail, profile: { create: {} } },
  });
}
