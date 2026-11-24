-- CreateTable
CREATE TABLE "external_identity" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_identity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "external_identity_email_idx" ON "external_identity"("email");

-- CreateIndex
CREATE UNIQUE INDEX "external_identity_provider_subject_key" ON "external_identity"("provider", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "external_identity_provider_userId_key" ON "external_identity"("provider", "userId");

-- AddForeignKey
ALTER TABLE "external_identity" ADD CONSTRAINT "external_identity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
