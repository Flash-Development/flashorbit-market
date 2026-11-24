import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  flashPrisma?: PrismaClient;
};

export function createPrismaClient(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

export const prisma =
  process.env.DATABASE_URL
    ? globalForPrisma.flashPrisma ?? createPrismaClient()
    : undefined as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.flashPrisma = prisma;
}
