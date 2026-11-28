import "server-only";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/workspaces/onboarding";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import {
  CatalogAuthorizationError,
  CatalogConflictError,
  CatalogInputError,
} from "@/lib/catalog/errors";

export async function getCatalogContext(request: Request, requireOrigin = true) {
  if (requireOrigin && !isTrustedRequestOrigin(request.headers.get("origin"))) return null;
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) return null;
  const workspace = await getActiveWorkspaceContext(authenticated.localUser.id);
  if (!workspace) return null;
  return {
    userId: authenticated.localUser.id,
    workspace,
  };
}

export function catalogError(error: unknown) {
  if (error instanceof CatalogAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof CatalogConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  if (error instanceof CatalogInputError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(
    { error: "Catalog request could not be completed." },
    { status: 500 },
  );
}

export async function parseCatalogBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new CatalogInputError("Invalid JSON request body.");
  }
}
