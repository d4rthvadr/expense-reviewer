-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GHS');

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "currency" "Currency" DEFAULT 'USD';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "currency" "Currency" DEFAULT 'USD';

-- AlterTable
ALTER TABLE "ExpenseItem" ADD COLUMN     "currency" "Currency" DEFAULT 'USD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currency" "Currency" DEFAULT 'USD';

-- Backfill: Update currency to USD where null
UPDATE "Expense" SET "currency" = 'USD' WHERE "currency" IS NULL;
UPDATE "Budget" SET "currency" = 'USD' WHERE "currency" IS NULL;
UPDATE "ExpenseItem" SET "currency" = 'USD' WHERE "currency" IS NULL;
UPDATE "User" SET "currency" = 'USD' WHERE "currency" IS NULL;
