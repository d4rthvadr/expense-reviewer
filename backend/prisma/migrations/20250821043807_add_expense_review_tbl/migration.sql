-- AlterTable
ALTER TABLE "Expense" RENAME CONSTRAINT "ExpenseItem_pkey" TO "Expense_pkey";

ALTER TABLE "Expense" ADD COLUMN "expenseReviewId" TEXT;

-- CreateTable
CREATE TABLE "ExpenseReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "reviewText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseReview_pkey" PRIMARY KEY ("id")
);

-- RenameForeignKey
ALTER TABLE "Expense" RENAME CONSTRAINT "ExpenseItem_userId_fkey" TO "Expense_userId_fkey";

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_expenseReviewId_fkey" FOREIGN KEY ("expenseReviewId") REFERENCES "ExpenseReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseReview" ADD CONSTRAINT "ExpenseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
