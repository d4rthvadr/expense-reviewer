/*
  Warnings:

  - Safe migration: Renaming Expense to Transaction and ExpenseReview to TransactionReview
  - Adding TransactionType enum with default EXPENSE for existing records
  - Preserving all existing data during column renames

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'INCOME');

-- Step 1: Add new columns without dropping old ones yet
ALTER TABLE "Expense" ADD COLUMN "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE';
ALTER TABLE "Expense" ADD COLUMN "transactionReviewId" TEXT;

-- Step 2: Copy data from old column to new column
UPDATE "Expense" SET "transactionReviewId" = "expenseReviewId" WHERE "expenseReviewId" IS NOT NULL;

-- Step 3: Drop the old foreign key constraint
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_expenseReviewId_fkey";

-- Step 4: Drop the old column (now that data is safely copied)
ALTER TABLE "Expense" DROP COLUMN "expenseReviewId";

-- Step 5: Add new foreign key constraint
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_transactionReviewId_fkey" FOREIGN KEY ("transactionReviewId") REFERENCES "ExpenseReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 6: Rename tables to match new schema
ALTER TABLE "ExpenseReview" RENAME TO "TransactionReview";
ALTER TABLE "Expense" RENAME TO "Transaction";

-- Step 7: Update foreign key constraint name to reflect new table names
ALTER TABLE "Transaction" DROP CONSTRAINT "Expense_transactionReviewId_fkey";
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transactionReviewId_fkey" FOREIGN KEY ("transactionReviewId") REFERENCES "TransactionReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
