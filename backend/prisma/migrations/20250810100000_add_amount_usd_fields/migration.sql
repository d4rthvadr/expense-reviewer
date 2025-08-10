-- Add amountUsd fields to Budget and ExpenseItem tables
ALTER TABLE "Budget" ADD COLUMN "amountUsd" FLOAT;
ALTER TABLE "ExpenseItem" ADD COLUMN "amountUsd" FLOAT;

-- Backfill existing data (assuming current data is in USD for now)
-- This can be updated later when the currency conversion service is active
UPDATE "Budget" SET "amountUsd" = amount WHERE "amountUsd" IS NULL;
UPDATE "ExpenseItem" SET "amountUsd" = amount WHERE "amountUsd" IS NULL;

-- Make columns NOT NULL after backfill
ALTER TABLE "Budget" ALTER COLUMN "amountUsd" SET NOT NULL;
ALTER TABLE "ExpenseItem" ALTER COLUMN "amountUsd" SET NOT NULL;
