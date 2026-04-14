/*
  Warnings:

  - You are about to drop the column `duration` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "duration",
DROP COLUMN "type";
