-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "review" TEXT,
ADD COLUMN     "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING';

-- Backfill: Set default status for existing expenses
UPDATE "Expense" SET "status" = 'PENDING' WHERE "status" IS NULL;