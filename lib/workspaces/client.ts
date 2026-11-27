import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";

export type WorkspaceClient = {
  user: PrismaClient["user"];
  workspace: PrismaClient["workspace"];
  membership: PrismaClient["membership"];
  store: PrismaClient["store"];
  profile: PrismaClient["profile"];
  product: PrismaClient["product"];
  productVariant: PrismaClient["productVariant"];
  auditLog: PrismaClient["auditLog"];
  workspaceInvitation: PrismaClient["workspaceInvitation"];
  workspaceSubscription: PrismaClient["workspaceSubscription"];
  workspaceUsage: PrismaClient["workspaceUsage"];
  $transaction: PrismaClient["$transaction"];
};

export type AuthenticatedPrincipal = {
  userId: string;
  email: string;
};
