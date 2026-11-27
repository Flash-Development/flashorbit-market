export class CatalogAuthorizationError extends Error {
  constructor() {
    super("Catalog access denied.");
  }
}

export class CatalogInputError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class CatalogConflictError extends Error {
  constructor(message = "A catalog record with that value already exists.") {
    super(message);
  }
}
