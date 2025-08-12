/*
  Warnings:

  - You are about to drop the column `expenseId` on the `ExpenseItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExpenseItem" DROP CONSTRAINT "ExpenseItem_expenseId_fkey";

-- AlterTable
ALTER TABLE "ExpenseItem" DROP COLUMN "expenseId",
ADD COLUMN     "userId" TEXT ;

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
