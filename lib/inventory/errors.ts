export class InventoryAuthorizationError extends Error {
  constructor() { super("Inventory access denied."); }
}

export class InventoryInputError extends Error {
  constructor(message: string) { super(message); }
}
