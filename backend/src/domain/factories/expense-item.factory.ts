import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseItemModel } from '@domain/models/expense-item.model';

interface ExpenseItemCreateDataDto {
  name: string;
  amount: number;
  amountUsd: number;
  description?: string;
  category: Category;
  currency?: Currency;
  qty?: number;
}
export class ExpenseItemFactory {
  /**
   * Creates a new ExpenseModel instance from the provided data.
   * @param data - The data to create the expense model.
   * @returns A new ExpenseModel instance.
   */
  static createExpenseItem(data: ExpenseItemCreateDataDto): ExpenseItemModel {
    const { name, amount, amountUsd, description, category, currency, qty } =
      data;

    const user: ExpenseItemModel = new ExpenseItemModel({
      name,
      amount,
      qty,
      currency,
      amountUsd,
      category,
      description,
    });

    return user;
  }
}
