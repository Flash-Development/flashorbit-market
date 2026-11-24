export class WorkspaceAuthorizationError extends Error {
  constructor() {
    super("Workspace access denied.");
    this.name = "WorkspaceAuthorizationError";
  }
}

export class WorkspaceNotFoundError extends Error {
  constructor() {
    super("Workspace not found.");
    this.name = "WorkspaceNotFoundError";
  }
}

export class WorkspaceConflictError extends Error {
  constructor() {
    super("The user already belongs to a workspace.");
    this.name = "WorkspaceConflictError";
  }
}

export class WorkspaceInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceInputError";
  }
}
