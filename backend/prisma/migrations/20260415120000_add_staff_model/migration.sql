-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_artistId_fkey";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "artistId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
