-- AlterTable
ALTER TABLE "Transaction" RENAME CONSTRAINT "Expense_pkey" TO "Transaction_pkey";

-- AlterTable
ALTER TABLE "TransactionReview" RENAME CONSTRAINT "ExpenseReview_pkey" TO "TransactionReview_pkey";

-- CreateTable
CREATE TABLE "DefaultCategoryWeight" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "weight" DECIMAL(5,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultCategoryWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCategoryWeight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "weight" DECIMAL(5,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCategoryWeight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultCategoryWeight_category_key" ON "DefaultCategoryWeight"("category");

-- CreateIndex
CREATE UNIQUE INDEX "UserCategoryWeight_userId_category_key" ON "UserCategoryWeight"("userId", "category");

-- RenameForeignKey
ALTER TABLE "Transaction" RENAME CONSTRAINT "Expense_userId_fkey" TO "Transaction_userId_fkey";

-- RenameForeignKey
ALTER TABLE "TransactionReview" RENAME CONSTRAINT "ExpenseReview_userId_fkey" TO "TransactionReview_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserCategoryWeight" ADD CONSTRAINT "UserCategoryWeight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
