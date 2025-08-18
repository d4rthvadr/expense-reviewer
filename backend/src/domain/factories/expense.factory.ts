import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseModel } from '@domain/models/expense.model';

interface ExpenseCreateDataDto {
  name: string;
  description?: string;
  currency?: Currency;
  category: Category;
  amount: number;
  amountUsd: number;
  userId?: string;
  qty?: number;
  createdAt?: string;
}
export class ExpenseFactory {
  /**
   * Creates a new UserModel instance from the provided data.
   * @param data - The data to create the user model.
   * @returns A new UserModel instance.
   */
  static createExpense(
    data: ExpenseCreateDataDto,
    userId?: string
  ): ExpenseModel {
    const expense = new ExpenseModel({
      ...data,
      qty: data?.qty ?? 1,
      createdAt:
        typeof data.createdAt === 'string'
          ? new Date(data.createdAt)
          : data.createdAt,
    });

    return expense;
  }
}
