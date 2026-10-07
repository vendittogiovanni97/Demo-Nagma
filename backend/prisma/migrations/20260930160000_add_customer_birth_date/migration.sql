-- AlterTable
ALTER TABLE "customers" ADD COLUMN "birthDate" DATE;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customers_deletedAt_birthDate_idx" ON "customers"("deletedAt", "birthDate");
