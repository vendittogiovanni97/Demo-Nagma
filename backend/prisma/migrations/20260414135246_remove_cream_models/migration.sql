/*
  Warnings:

  - You are about to drop the `Cream` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreamSale` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CreamSale" DROP CONSTRAINT "CreamSale_creamId_fkey";

-- DropForeignKey
ALTER TABLE "CreamSale" DROP CONSTRAINT "CreamSale_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CreamSale" DROP CONSTRAINT "CreamSale_sellerId_fkey";

-- DropTable
DROP TABLE "Cream";

-- DropTable
DROP TABLE "CreamSale";
