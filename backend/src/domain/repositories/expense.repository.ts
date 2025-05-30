import { ExpenseModel } from 'domain/models/expense.model';
import { Database } from '../../db/database';
import {
  Category,
  Currency,
  Expense as ExpenseEntity,
} from '../../../generated/prisma';
import { log } from '@libs/logger';
import { mapExpense } from './helpers/map-expense';
import { ExpenseItemFactory } from '@domain/factories/expense-item.factory';
import { ExpenseItemModel } from '@domain/models/expense-item.model';

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
  category: string;
  currency?: Currency | null;
  userId?: string | null;
  description?: string | null;
  qty?: number | null;
}

export interface ExpenseEntityFull extends ExpenseEntity {
  expenseItem: ExpenseItemEntity[];
}

const createExpenseItem = (item: ExpenseItemModel) => ({
  id: item.id,
  name: item.name,
  amount: item.amount,
  category: item.category as unknown as Category,
  description: item.description,
  qty: item.qty,
});
export class ExpenseRepository extends Database {
  constructor() {
    super();
  }

  async findById(expenseId: string): Promise<ExpenseModel | null> {
    try {
      const expense: ExpenseEntityFull | null = await this.expense.findFirst({
        where: {
          id: expenseId,
        },
        include: {
          expenseItem: true,
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
      const [records, total]: [ExpenseEntityFull[], number] =
        await this.$transaction([
          this.expense.findMany({
            where: filters,
            take: limit,
            skip: offset * limit,
            include: {
              expenseItem: true,
            },
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

      const expenses = records.map((expense: ExpenseEntityFull) =>
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
      const expense: ExpenseEntityFull = await this.expense.upsert({
        where: {
          id: data.id,
        },
        create: {
          id: data.id,
          name: data.name!, // TODO: Fix this
          type: data.type,
          total_amount: 0,
          currency: data.currency,
          userId: data.userId,
          expenseItem: {
            createMany: {
              data: data.items.map((item) =>
                createExpenseItem(ExpenseItemFactory.createExpenseItem(item))
              ),
              skipDuplicates: true,
            },
          },
        },
        update: {
          name: data.name,
          type: data.type,
          total_amount: 0,
          currency: data.currency,
          userId: data.userId,
          expenseItem: {
            deleteMany: {
              expenseId: data.id,
            },
            createMany: {
              data: data.items.map((item) =>
                createExpenseItem(ExpenseItemFactory.createExpenseItem(item))
              ),
              skipDuplicates: true,
            },
          },
        },
        include: {
          expenseItem: true, // Ensure expenseItem is included in the result
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

  async delete(id: string): Promise<ExpenseModel> {
    try {
      const deletedExpense = await this.expense.delete({
        where: {
          id,
        },
        include: {
          expenseItem: true, // Ensure expenseItem is included in the result
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
