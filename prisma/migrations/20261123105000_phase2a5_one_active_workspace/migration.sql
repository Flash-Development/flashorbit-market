ALTER TABLE "User" ADD COLUMN "workspaceId" TEXT;

CREATE UNIQUE INDEX "User_workspaceId_key" ON "User"("workspaceId");

ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
