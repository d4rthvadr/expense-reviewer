import { ExpenseItem, ExpenseModel } from '@domain/models/expense.model';

interface ExpenseCreateDataDto {
  name?: string;
  type: string;
  userId?: string;
  items: ExpenseItem[];
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
    const { name, type, items } = data;

    const user: ExpenseModel = new ExpenseModel({
      name,
      type,
      userId,
      items,
    });

    return user;
  }
}
