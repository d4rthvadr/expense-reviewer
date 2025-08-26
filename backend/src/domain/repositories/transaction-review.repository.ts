import { TransactionReview as TransactionReviewEntity } from '../../../generated/prisma';
import { TransactionReviewModel } from '@domain/models/transaction-review.model';
import { log } from '@infra/logger';
import { mapTransactionReview } from './helpers/map-transaction-review';
import { Database } from '@infra/db/database';

interface FindTransactionReviewsDto {
  userId: string;
  dateFrom: Date;
  dateTo: Date;
  limit: number;
  offset: number;
  includeTransactions: boolean;
}

export type TransactionReviewFullEntity = TransactionReviewEntity & {
  transactions?: unknown[];
};

export class TransactionReviewRepository extends Database {
  async findById(
    transactionReviewId: string
  ): Promise<TransactionReviewModel | null> {
    try {
      const transactionReview: TransactionReviewFullEntity | null =
        await this.transactionReview.findFirst({
          where: {
            id: transactionReviewId,
          },
          include: {
            transactions: true,
          },
        });

      return mapTransactionReview(transactionReview);
    } catch (error) {
      log.error({
        message: 'An error occurred while fetching transaction review:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async find(
    data: FindTransactionReviewsDto
  ): Promise<{ data: TransactionReviewModel[]; total: number }> {
    const { userId, dateFrom, dateTo, limit, offset, includeTransactions } =
      data;

    try {
      const [records, total]: [TransactionReviewFullEntity[], number] =
        await this.$transaction([
          this.transactionReview.findMany({
            where: {
              userId,
              createdAt: {
                gte: dateFrom,
                lte: dateTo,
              },
            },
            take: limit,
            skip: offset,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              transactions: includeTransactions,
            },
          }),
          this.transactionReview.count({
            where: {
              userId,
              createdAt: {
                gte: dateFrom,
                lte: dateTo,
              },
            },
          }),
        ]);

      return {
        data: records.map((review: TransactionReviewFullEntity) =>
          mapTransactionReview(review)
        ),
        total,
      };
    } catch (error) {
      log.error({
        message: 'An error occurred while fetching transaction reviews:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async save(data: TransactionReviewModel): Promise<TransactionReviewModel> {
    try {
      const transactionReview: TransactionReviewFullEntity =
        await this.transactionReview.upsert({
          where: {
            id: data.id,
          },
          create: {
            id: data.id,
            reviewText: data.reviewText,
            userId: data.userId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          },
          update: {
            reviewText: data.reviewText,
            updatedAt: data.updatedAt,
          },
          include: {
            transactions: true,
          },
        });

      return mapTransactionReview(transactionReview);
    } catch (error) {
      log.error({
        message: 'An error occurred while saving transaction review:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async delete(id: string): Promise<TransactionReviewModel | null> {
    try {
      const deletedTransactionReview = await this.transactionReview.delete({
        where: {
          id,
        },
        include: {
          transactions: true,
        },
      });

      return mapTransactionReview(deletedTransactionReview);
    } catch (error) {
      log.error({
        message: 'An error occurred while deleting transaction review:',
        error,
        code: '',
      });

      throw error;
    }
  }
}

// Create singleton instance
const transactionReviewRepository = new TransactionReviewRepository();

export { transactionReviewRepository };
