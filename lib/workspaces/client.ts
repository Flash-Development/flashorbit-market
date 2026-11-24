import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";

export type WorkspaceClient = {
  user: PrismaClient["user"];
  workspace: PrismaClient["workspace"];
  membership: PrismaClient["membership"];
  store: PrismaClient["store"];
  $transaction: PrismaClient["$transaction"];
};

export type AuthenticatedPrincipal = {
  userId: string;
  email: string;
};
