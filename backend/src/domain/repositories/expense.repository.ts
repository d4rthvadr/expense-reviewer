import { ExpenseModel } from 'domain/models/expense.model';
import { Database } from '../../db/database';
import { Expense as ExpenseEntity } from '../../../generated/prisma';
import { log } from '../../libs/logger';
import { mapExpense } from './helpers/map-expense';

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
            create: data.items.map(createExpenseItem),
          },
        },
        update: {
          name: data.name,
          type: data.type,
          total_amount: 0,
          userId: data.userId,
          expenseItem: {
            create: data.items.map(createExpenseItem),
          },
        },
        include: {
          expenseItem: true, // Ensure expenseItem is included in the result
        },
      });

      return mapExpense(expense);
    } catch (error) {
      log.error('An error occurred while saving expense:', error);

      throw error;
    }
  }
}
