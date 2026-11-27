CREATE TYPE "InventoryMovementType" AS ENUM ('INITIAL', 'INBOUND', 'OUTBOUND', 'ADJUSTMENT');

CREATE TABLE "InventoryBalance" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InventoryBalance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "quantityBefore" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InventoryBalance_variantId_key" ON "InventoryBalance"("variantId");
CREATE UNIQUE INDEX "InventoryBalance_workspaceId_variantId_key" ON "InventoryBalance"("workspaceId", "variantId");
CREATE INDEX "InventoryBalance_workspaceId_quantity_idx" ON "InventoryBalance"("workspaceId", "quantity");
CREATE INDEX "InventoryMovement_workspaceId_variantId_createdAt_idx" ON "InventoryMovement"("workspaceId", "variantId", "createdAt");
CREATE INDEX "InventoryMovement_workspaceId_type_idx" ON "InventoryMovement"("workspaceId", "type");

ALTER TABLE "InventoryBalance"
ADD CONSTRAINT "InventoryBalance_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InventoryBalance"
ADD CONSTRAINT "InventoryBalance_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InventoryBalance"
ADD CONSTRAINT "InventoryBalance_quantity_check" CHECK ("quantity" >= 0),
ADD CONSTRAINT "InventoryBalance_reserved_check" CHECK ("reservedQuantity" >= 0),
ADD CONSTRAINT "InventoryBalance_reorder_check" CHECK ("reorderPoint" >= 0);

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_quantity_before_check" CHECK ("quantityBefore" >= 0),
ADD CONSTRAINT "InventoryMovement_quantity_after_check" CHECK ("quantityAfter" >= 0);
