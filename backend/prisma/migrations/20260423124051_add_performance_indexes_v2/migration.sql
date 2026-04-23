/*
  Warnings:

  - You are about to drop the column `changedBy` on the `BookingHistory` table. All the data in the column will be lost.
  - You are about to drop the column `artistId` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BookingHistory" DROP COLUMN "changedBy",
ADD COLUMN     "changedById" INTEGER;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "artistId";

-- CreateTable
CREATE TABLE "CreamTattoo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Crema Protettiva Tattoo',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreamTattoo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreamSale" (
    "id" SERIAL NOT NULL,
    "creamId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreamSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreamSale_creamId_soldAt_idx" ON "CreamSale"("creamId", "soldAt");

-- CreateIndex
CREATE INDEX "CreamSale_artistId_soldAt_idx" ON "CreamSale"("artistId", "soldAt");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "BookingHistory_changedById_idx" ON "BookingHistory"("changedById");

-- CreateIndex
CREATE INDEX "Staff_type_idx" ON "Staff"("type");

-- CreateIndex
CREATE INDEX "Staff_createdAt_idx" ON "Staff"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_createdById_idx" ON "WhatsAppMessageLog"("createdById");

-- AddForeignKey
ALTER TABLE "CreamSale" ADD CONSTRAINT "CreamSale_creamId_fkey" FOREIGN KEY ("creamId") REFERENCES "CreamTattoo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreamSale" ADD CONSTRAINT "CreamSale_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingHistory" ADD CONSTRAINT "BookingHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
