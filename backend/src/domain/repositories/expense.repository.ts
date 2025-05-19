import { ExpenseModel } from 'domain/models/expense.model';
import { Database } from '../../db/database';
import { Expense as ExpenseEntity } from '../../../generated/prisma';
import { log } from '../../libs/logger';
import { mapExpense } from './helpers/map-expense';

interface listExpenseDto {
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
  userId?: string | null;
  description?: string | null;
  qty?: number | null;
}

export interface ExpenseEntityFull extends ExpenseEntity {
  expenseItem: ExpenseItemEntity[];
}

const createExpenseItem = (item: ExpenseEntityFull['expenseItem'][number]) => ({
  id: item.id,
  name: item.name,
  amount: item.amount,
  description: item.description,
  userId: item.userId,
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
    data: listExpenseDto
  ): Promise<{ data: ExpenseModel[]; total: number }> {
    log.info(`Finding expenses with filters: ${JSON.stringify(data)}`);
    let { filters, limit, offset } = data;

    if (offset > 0) {
      offset = offset * limit;
    }

    try {
      const [records, total]: [ExpenseEntityFull[], number] =
        await this.$transaction([
          this.expense.findMany({
            where: filters,
            take: limit,
            skip: offset,
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
      console.error('An error occurred while fetching expenses:', error);
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
          userId: data.userId,
          expenseItem: {
            createMany: {
              data: data.items.map(createExpenseItem),
              skipDuplicates: true,
            },
          },
        },
        update: {
          type: data.type,
          total_amount: 0,
          userId: data.userId,
          expenseItem: {
            upsert: data.items.map((item) => ({
              where: { id: item.id },
              create: createExpenseItem(item),
              update: createExpenseItem(item),
            })),
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
