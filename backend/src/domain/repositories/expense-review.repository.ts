import { ExpenseReview as ExpenseReviewEntity } from '../../../generated/prisma';
import {
  ExpenseItem,
  ExpenseReviewModel,
} from '@domain/models/expense-review.model';
import { log } from '@infra/logger';
import { mapExpenseReview } from './helpers/map-expense-review';
import { Database } from '@infra/db/database';

interface FindExpenseReviewsDto {
  userId: string;
  dateFrom: Date;
  dateTo: Date;
  limit: number;
  offset: number;
  includeExpenses: boolean;
}

export type ExpenseReviewFullEntity = ExpenseReviewEntity & {
  expenses?: ExpenseItem[];
};

export class ExpenseReviewRepository extends Database {
  async findById(
    expenseReviewId: string,
    userId: string
  ): Promise<ExpenseReviewModel | null> {
    try {
      const expenseReview: ExpenseReviewFullEntity | null =
        await this.expenseReview.findFirst({
          where: {
            id: expenseReviewId,
            userId,
          },
        });

      return mapExpenseReview(expenseReview);
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
  ): Promise<{ data: ExpenseReviewModel[]; total: number }> {
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
            expenses: {
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
          this.expenseReview.findMany({
            where,
            include,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          this.expenseReview.count({ where }),
        ]);

      log.info(`Found ${records.length} expense reviews out of ${total} total`);

      return { data: records.map((item) => mapExpenseReview(item)), total };
    } catch (error) {
      log.error({
        message: 'An error occurred while finding expense reviews:',
        error,
        code: 'EXPENSE_REVIEW_FIND_ERROR',
      });

      throw error;
    }
  }

  async save(data: ExpenseReviewModel): Promise<ExpenseReviewModel> {
    try {
      const expenseReview = await this.expenseReview.upsert({
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

      return mapExpenseReview(expenseReview);
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

const expenseReviewRepository = new ExpenseReviewRepository();
export { expenseReviewRepository };
