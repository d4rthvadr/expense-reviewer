import {
  Category,
  Currency,
  Expense as ExpenseEntity,
} from '../../../generated/prisma';
import { log } from '@infra/logger';
import { mapExpense } from './helpers/map-expense';
import { ExpenseItemModel } from '@domain/models/expense-item.model';
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
export interface ExpenseItemEntity {
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

export interface ExpenseEntityFull extends ExpenseEntity {
  expenseItem: ExpenseItemEntity[];
}

export class ExpenseRepository extends Database {
  constructor() {
    super();
  }

  async findById(expenseId: string): Promise<ExpenseItemModel | null> {
    try {
      const expense: ExpenseItemEntity | null =
        await this.expenseItem.findFirst({
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
  ): Promise<{ data: ExpenseItemModel[]; total: number }> {
    log.info(`Finding expenses with filters: ${JSON.stringify(data)}`);
    const { filters, limit, offset } = data;

    try {
      const [records, total]: [ExpenseItemEntity[], number] =
        await this.$transaction([
          this.expenseItem.findMany({
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

      const expenses = records.map((expense: ExpenseItemEntity) =>
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

  async save(data: ExpenseItemModel): Promise<ExpenseItemModel> {
    try {
      const expense: ExpenseItemEntity = await this.expenseItem.upsert({
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

  async delete(id: string): Promise<ExpenseItemModel | null> {
    try {
      const deletedExpense = await this.expenseItem.delete({
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
