-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'ENTRATA';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'USCITA';

-- Update existing rows if any
UPDATE "transactions" SET "type" = 'ENTRATA' WHERE "type"::text = 'INCOME';
UPDATE "transactions" SET "type" = 'USCITA' WHERE "type"::text = 'EXPENSE';
