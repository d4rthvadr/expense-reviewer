import { Category, Currency, TransactionType } from '../../../generated/prisma';
import { log } from '@infra/logger';
import { mapTransaction } from './helpers/map-transaction';
import { TransactionModel } from '@domain/models/transaction.model';
import { Database } from '@infra/db/database';
import { QueryParams } from '@domain/services/interfaces/query-params';
import { TransactionFindFilters } from '@domain/services/interfaces/transaction-filters';

export interface TransactionEntity {
  id?: string;
  name: string;
  amount: number;
  amountUsd: number;
  category: string;
  currency?: Currency | null;
  type: string;
  userId?: string | null;
  description?: string | null;
  qty?: number | null;
  createdAt: Date;
}

export class TransactionRepository extends Database {
  constructor() {
    super();
  }

  async findById(transactionId: string): Promise<TransactionModel | null> {
    try {
      const transaction: TransactionEntity | null =
        await this.transaction.findFirst({
          where: {
            id: transactionId,
          },
        });

      return mapTransaction(transaction);
    } catch (error) {
      log.error({
        message: 'An error occurred while fetching transaction:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async find(
    data: QueryParams<TransactionFindFilters>,
    userId: string
  ): Promise<{ data: TransactionModel[]; total: number }> {
    log.info(`Finding transactions with filters: ${JSON.stringify(data)}`);
    const { filters, limit, offset } = data;

    const whereQuery = {
      ...filters,
      userId,
    };

    try {
      const [records, total]: [TransactionEntity[], number] =
        await this.$transaction([
          this.transaction.findMany({
            where: whereQuery,
            take: limit,
            skip: offset,
            orderBy: {
              [data.sort.sortBy]: data.sort.sortDir,
            },
          }),
          this.transaction.count({
            where: whereQuery,
          }),
        ]);

      return {
        data: records.map((transaction: TransactionEntity) =>
          mapTransaction(transaction)
        ),
        total,
      };
    } catch (error) {
      log.error({
        message: 'An error occurred while fetching transactions:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async save(data: TransactionModel): Promise<TransactionModel> {
    try {
      const transaction: TransactionEntity = await this.transaction.upsert({
        where: {
          id: data.id,
        },
        create: {
          id: data.id,
          name: data.name!,
          amount: data.amount,
          amountUsd: data.amountUsd,
          category: data.category as unknown as Category,
          type: data.type as unknown as TransactionType,
          description: data.description,
          userId: data.userId,
          qty: data.qty,
          currency: data.currency,
          createdAt: data.createdAt,
        },
        update: {
          name: data.name,
          amount: data.amount,
          amountUsd: data.amountUsd,
          category: data.category as unknown as Category,
          type: data.type as unknown as TransactionType,
          description: data.description,
          userId: data.userId,
          qty: data.qty,
          currency: data.currency,
          createdAt: data.createdAt,
        },
      });

      return mapTransaction(transaction);
    } catch (error) {
      log.error({
        message: 'An error occurred while saving transaction:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async delete(id: string): Promise<TransactionModel | null> {
    try {
      const deletedTransaction = await this.transaction.delete({
        where: {
          id,
        },
      });

      return mapTransaction(deletedTransaction);
    } catch (error) {
      log.error({
        message: 'An error occurred while deleting transaction:',
        error,
        code: '',
      });

      throw error;
    }
  }
}
