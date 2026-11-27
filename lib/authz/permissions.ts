import type { MembershipRole } from "@/generated/prisma/client";

export type Capability =
  | "workspace:read"
  | "workspace:update"
  | "workspace:delete"
  | "workspace:transfer"
  | "membership:read"
  | "membership:invite"
  | "membership:update"
  | "membership:remove"
  | "catalog:read"
  | "catalog:manage"
  | "inventory:read"
  | "inventory:manage"
  | "audit:read"
  | "subscription:read";

const permissions: Record<MembershipRole, ReadonlySet<Capability>> = {
  OWNER: new Set([
    "workspace:read",
    "workspace:update",
    "workspace:delete",
    "workspace:transfer",
    "membership:read",
    "membership:invite",
    "membership:update",
    "membership:remove",
    "catalog:read",
    "catalog:manage",
    "inventory:read",
    "inventory:manage",
    "audit:read",
    "subscription:read",
  ]),
  ADMIN: new Set([
    "workspace:read",
    "workspace:update",
    "membership:read",
    "membership:invite",
    "membership:update",
    "membership:remove",
    "catalog:read",
    "catalog:manage",
    "inventory:read",
    "inventory:manage",
    "audit:read",
    "subscription:read",
  ]),
  MANAGER: new Set(["workspace:read", "membership:read", "catalog:read", "catalog:manage", "inventory:read", "inventory:manage", "audit:read", "subscription:read"]),
  STAFF: new Set(["workspace:read", "membership:read", "catalog:read", "inventory:read"]),
};

export function roleCan(role: MembershipRole, capability: Capability) {
  return permissions[role].has(capability);
}
