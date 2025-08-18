/*
  Warnings:

  - The `ExpenseItem` table is being renamed to `Expense` if it exists

*/
-- Rename the table from ExpenseItem to Expense only if ExpenseItem exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ExpenseItem') THEN
        ALTER TABLE "ExpenseItem" RENAME TO "Expense";
    END IF;
END $$;

-- The foreign key constraints should be automatically maintained during the rename
