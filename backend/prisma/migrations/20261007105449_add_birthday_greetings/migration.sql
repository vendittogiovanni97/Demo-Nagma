-- CreateEnum
CREATE TYPE "BirthdayGreetingStatus" AS ENUM ('SENDING', 'SENT');

-- AlterEnum
ALTER TYPE "WhatsAppMessageStatus" ADD VALUE 'AUTO_SENT';

-- CreateTable
CREATE TABLE "birthday_greetings" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "BirthdayGreetingStatus" NOT NULL DEFAULT 'SENDING',
    "channel" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birthday_greetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "birthday_greetings_customerId_year_key" ON "birthday_greetings"("customerId", "year");

-- AddForeignKey
ALTER TABLE "birthday_greetings" ADD CONSTRAINT "birthday_greetings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
