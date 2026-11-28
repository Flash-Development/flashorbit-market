import "server-only";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/workspaces/onboarding";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import {
  InventoryAuthorizationError,
  InventoryInputError,
} from "@/lib/inventory/errors";

export async function getInventoryContext(request: Request, requireOrigin = true) {
  if (requireOrigin && !isTrustedRequestOrigin(request.headers.get("origin"))) return null;
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return null;
  const workspace = await getActiveWorkspaceContext(authenticated.localUser.id);
  if (!workspace) return null;
  return { userId: authenticated.localUser.id, workspace };
}

export function inventoryError(error: unknown) {
  if (error instanceof InventoryAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof InventoryInputError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(
    { error: "Inventory request could not be completed." },
    { status: 500 },
  );
}

export async function parseInventoryBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new InventoryInputError("Invalid JSON request body.");
  }
}
