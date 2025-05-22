import { ExpenseItemModel } from '../../domain/models/expense-item.model';

interface ExpenseItemCreateDataDto {
  name: string;
  amount: number;
  description?: string;
  qty?: number;
}
export class ExpenseItemFactory {
  /**
   * Creates a new UserModel instance from the provided data.
   * @param data - The data to create the user model.
   * @returns A new UserModel instance.
   */
  static createExpenseItem(data: ExpenseItemCreateDataDto): ExpenseItemModel {
    const { name, amount, description, qty } = data;

    const user: ExpenseItemModel = new ExpenseItemModel({
      name,
      amount,
      qty,
      description,
    });

    return user;
  }
}
