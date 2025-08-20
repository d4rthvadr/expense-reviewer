import { Category, Currency } from '../../../generated/prisma';
import { log } from '@infra/logger';
import { mapExpense } from './helpers/map-expense';
import { ExpenseModel } from '@domain/models/expense.model';
import { Database } from '@infra/db/database';

interface ListExpenseDto {
  filters: Record<string, unknown>;
  sort: {
    sortBy: string;
    sortDir: string;
  };
  limit: number;
  offset: number;
}
export interface ExpenseEntity {
  id?: string;
  name: string;
  amount: number;
  amountUsd: number;
  category: string;
  currency?: Currency | null;
  userId?: string | null;
  description?: string | null;
  qty?: number | null;
  createdAt: Date;
}

export class ExpenseRepository extends Database {
  constructor() {
    super();
  }

  async findById(expenseId: string): Promise<ExpenseModel | null> {
    try {
      const expense: ExpenseEntity | null = await this.expense.findFirst({
        where: {
          id: expenseId,
        },
      });

      return mapExpense(expense);
    } catch (error) {
      log.error({
        message: 'An error occurred while fetching expense:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async find(
    data: ListExpenseDto
  ): Promise<{ data: ExpenseModel[]; total: number }> {
    log.info(`Finding expenses with filters: ${JSON.stringify(data)}`);
    const { filters, limit, offset } = data;

    try {
      const [records, total]: [ExpenseEntity[], number] =
        await this.$transaction([
          this.expense.findMany({
            where: filters,
            take: limit,
            skip: offset * limit,
            orderBy: {
              [data.sort.sortBy]: data.sort.sortDir,
            },
          }),
          this.expense.count({
            where: filters,
            take: limit,
            skip: offset,
          }),
        ]);

      const expenses = records.map((expense: ExpenseEntity) =>
        mapExpense(expense)
      );

      return {
        data: expenses,
        total,
      };
    } catch (error) {
      log.error({
        message: 'An error occurred while fetching expenses:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async save(data: ExpenseModel): Promise<ExpenseModel> {
    try {
      const expense: ExpenseEntity = await this.expense.upsert({
        where: {
          id: data.id,
        },
        create: {
          id: data.id,
          name: data.name!,
          amount: data.amount,
          amountUsd: data.amountUsd,
          category: data.category as unknown as Category,
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
          description: data.description,
          userId: data.userId,
          qty: data.qty,
          currency: data.currency,
          createdAt: data.createdAt,
        },
      });

      return mapExpense(expense);
    } catch (error) {
      log.error({
        message: 'An error occurred while saving expense:',
        error,
        code: '',
      });

      throw error;
    }
  }

  async delete(id: string): Promise<ExpenseModel | null> {
    try {
      const deletedExpense = await this.expense.delete({
        where: {
          id,
        },
      });

      return mapExpense(deletedExpense);
    } catch (error) {
      log.error({
        message: 'An error occurred while deleting expense:',
        error,
        code: '',
      });

      throw error;
    }
  }
}
