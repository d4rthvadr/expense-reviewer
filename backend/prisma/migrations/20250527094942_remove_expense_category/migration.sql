/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExpenseCategory" DROP CONSTRAINT "ExpenseCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ExpenseCategory" DROP CONSTRAINT "ExpenseCategory_expenseId_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "ExpenseCategory";
