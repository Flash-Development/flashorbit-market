import { NextResponse } from "next/server";
import {
  WorkspaceAuthorizationError,
  WorkspaceConflictError,
  WorkspaceInputError,
  WorkspaceNotFoundError,
} from "@/lib/workspaces/errors";

export function workspaceErrorResponse(error: unknown) {
  if (error instanceof WorkspaceAuthorizationError) {
    return NextResponse.json({ error: "Workspace access denied." }, { status: 403 });
  }
  if (error instanceof WorkspaceNotFoundError) {
    return NextResponse.json({ error: "Workspace or member not found." }, { status: 404 });
  }
  if (error instanceof WorkspaceConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  if (error instanceof WorkspaceInputError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Workspace request failed." }, { status: 500 });
}

export function invalidJsonResponse() {
  return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
}
