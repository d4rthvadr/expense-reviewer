-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'HEALTH', 'OTHER');

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "ExpenseItem" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'OTHER';
