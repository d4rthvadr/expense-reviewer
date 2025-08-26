import { TransactionReview as TransactionReviewEntity } from '../../../generated/prisma';
import {
  ExpenseItem,
  ExpenseReviewModel,
} from '@domain/models/expense-review.model';
import { log } from '@infra/logger';
import { mapTransactionReview } from './helpers/map-transaction-review';
import { Database } from '@infra/db/database';
import { TransactionReviewModel } from '@domain/models/transaction-review.model';

interface FindExpenseReviewsDto {
  userId: string;
  dateFrom: Date;
  dateTo: Date;
  limit: number;
  offset: number;
  includeExpenses: boolean;
}

export type ExpenseReviewFullEntity = TransactionReviewEntity & {
  expenses?: ExpenseItem[];
};

export class TransactionReviewRepository extends Database {
  async findById(
    expenseReviewId: string,
    userId: string
  ): Promise<TransactionReviewModel | null> {
    try {
      const expenseReview: ExpenseReviewFullEntity | null =
        await this.transactionReview.findFirst({
          where: {
            id: expenseReviewId,
            userId,
          },
        });

      return mapTransactionReview(expenseReview);
    } catch (error) {
      log.error({
        message: `An error occurred while fetching expense review with ID ${expenseReviewId}:`,
        error,
        code: 'EXPENSE_REVIEW_FIND_BY_ID_ERROR',
      });

      throw error;
    }
  }

  async find(
    data: FindExpenseReviewsDto
  ): Promise<{ data: TransactionReviewModel[]; total: number }> {
    log.info(`Finding expense reviews with data: ${JSON.stringify(data)}`);
    const { userId, dateFrom, dateTo, limit, offset, includeExpenses } = data;

    try {
      const where = {
        userId,
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      };

      const include = includeExpenses
        ? {
            transactions: {
              select: {
                category: true,
                qty: true,
                currency: true,
                amount: true,
              },
            },
          }
        : undefined;

      const [records, total]: [ExpenseReviewFullEntity[], number] =
        await this.$transaction([
          this.transactionReview.findMany({
            where,
            include,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          this.transactionReview.count({ where }),
        ]);

      log.info(`Found ${records.length} expense reviews out of ${total} total`);

      return { data: records.map((item) => mapTransactionReview(item)), total };
    } catch (error) {
      log.error({
        message: 'An error occurred while finding expense reviews:',
        error,
        code: 'EXPENSE_REVIEW_FIND_ERROR',
      });

      throw error;
    }
  }

  async save(data: ExpenseReviewModel): Promise<TransactionReviewModel> {
    try {
      const expenseReview = await this.transactionReview.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          reviewText: data.reviewText,
          userId: data.userId,
        },
        update: {
          reviewText: data.reviewText,
          userId: data.userId,
        },
      });

      return mapTransactionReview(expenseReview);
    } catch (error) {
      log.error({
        message: 'An error occurred while saving expense review:',
        error,
        code: 'EXPENSE_REVIEW_SAVE_ERROR',
      });

      throw error;
    }
  }
}

const transactionReviewRepository = new TransactionReviewRepository();
export { transactionReviewRepository };
