import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  createOnboardingWorkspace,
  getAuthenticatedWorkspaceContext,
} from "@/lib/workspaces/onboarding";
import { Prisma } from "@/generated/prisma/client";
import { isTrustedRequestOrigin } from "@/lib/auth/trusted-origins";
import {
  WorkspaceAuthorizationError,
  WorkspaceConflictError,
  WorkspaceInputError,
} from "@/lib/workspaces/errors";
import { createLogger, getRequestId } from "@/lib/logging/logger";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const logger = createLogger({
    requestId,
    method: request.method,
    path: new URL(request.url).pathname,
  });
  const startedAt = Date.now();
  const authenticated = await requireAuthenticatedUser();
  if (!authenticated) {
    logger.warn("Workspace creation rejected: authentication required");
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (!isTrustedRequestOrigin(request.headers.get("origin"))) {
    logger.warn("Workspace creation rejected: untrusted origin");
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }
  try {
    let body: { name?: unknown; slug?: unknown };
    try {
      body = await request.json();
    } catch {
      logger.warn("Workspace creation rejected: malformed JSON");
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }
    const existing = await getAuthenticatedWorkspaceContext(
      authenticated.localUser.id,
    );
    if (existing.length > 0) {
      logger.warn("Workspace creation rejected: user already has a workspace");
      return NextResponse.json(
        { error: "The user already belongs to a workspace.", slug: existing[0].slug },
        { status: 409 },
      );
    }
    if (typeof body.name !== "string" || typeof body.slug !== "string") {
      logger.warn("Workspace creation rejected: missing required fields");
      return NextResponse.json(
        { error: "Workspace name and slug are required." },
        { status: 400 },
      );
    }
    const workspace = await createOnboardingWorkspace(
      authenticated.localUser.id,
      authenticated.localUser.email,
      body.name,
      body.slug,
    );
    logger.info("Workspace created", {
      durationMs: Date.now() - startedAt,
      workspaceId: workspace.id,
    });
    return NextResponse.json({
      id: workspace.id,
      slug: workspace.slug,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof WorkspaceConflictError) {
      logger.warn("Workspace creation conflict");
      return NextResponse.json(
        { error: error.message },
        { status: 409 },
      );
    }
    if (error instanceof WorkspaceInputError) {
      logger.warn("Workspace creation input rejected");
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }
    if (error instanceof WorkspaceAuthorizationError) {
      logger.warn("Workspace creation denied by authorization");
      return NextResponse.json(
        { error: "Workspace access denied." },
        { status: 403 },
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002") {
      logger.warn("Workspace creation slug conflict", { prismaCode: error.code });
      return NextResponse.json(
        { error: "That workspace or store slug is already in use." },
        { status: 409 },
      );
    }
    logger.error("Workspace creation failed", {
      durationMs: Date.now() - startedAt,
      error,
    });
    return NextResponse.json(
      { error: "Workspace creation failed. Please try again." },
      { status: 500 },
    );
  }
}
