import { z } from "zod";

export const workspaceSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.")
  .min(3)
  .max(63);

export const reservedWorkspaceSlugs = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "flash",
  "flash-orbit",
  "help",
  "login",
  "onboarding",
  "settings",
  "signup",
  "static",
  "support",
  "www",
]);

export function normalizeWorkspaceSlug(value: string) {
  return workspaceSlugSchema.safeParse(
    value.normalize("NFKC").replace(/[^a-zA-Z0-9]+/g, "-"),
  );
}

export function generateWorkspaceSlug(name: string) {
  const normalized = normalizeWorkspaceSlug(name);
  if (!normalized.success) return "flash-orbit-store";
  return normalized.data;
}

export function assertAvailableWorkspaceSlug(value: string) {
  const normalized = normalizeWorkspaceSlug(value);
  if (!normalized.success) {
    return { success: false as const, error: "Enter a valid workspace slug." };
  }
  if (reservedWorkspaceSlugs.has(normalized.data)) {
    return { success: false as const, error: "This workspace slug is reserved." };
  }
  return { success: true as const, slug: normalized.data };
}
