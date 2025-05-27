-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'EDUCATION';
ALTER TYPE "Category" ADD VALUE 'SHOPPING';
ALTER TYPE "Category" ADD VALUE 'MISCELLANEOUS';
ALTER TYPE "Category" ADD VALUE 'PERSONAL_AND_LIFESTYLE';
ALTER TYPE "Category" ADD VALUE 'TRAVEL';
ALTER TYPE "Category" ADD VALUE 'GIFTS_OR_DONATIONS';
ALTER TYPE "Category" ADD VALUE 'HOUSING';
ALTER TYPE "Category" ADD VALUE 'SAVINGS_OR_INVESTMENTS';
ALTER TYPE "Category" ADD VALUE 'INSURANCE';
