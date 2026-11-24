import type { MembershipRole } from "@/generated/prisma/client";

export type Capability =
  | "workspace:read"
  | "workspace:update"
  | "workspace:delete"
  | "workspace:transfer"
  | "membership:read"
  | "membership:invite"
  | "membership:update"
  | "membership:remove";

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
  ]),
  ADMIN: new Set([
    "workspace:read",
    "workspace:update",
    "membership:read",
    "membership:invite",
    "membership:update",
    "membership:remove",
  ]),
  MANAGER: new Set(["workspace:read", "membership:read"]),
  STAFF: new Set(["workspace:read", "membership:read"]),
};

export function roleCan(role: MembershipRole, capability: Capability) {
  return permissions[role].has(capability);
}
