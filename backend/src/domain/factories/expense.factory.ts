import { ExpenseStatus } from '@domain/enum/expense-status.enum';
import { ExpenseItem, ExpenseModel } from '@domain/models/expense.model';

interface ExpenseCreateDataDto {
  name?: string;
  type: string;
  status: ExpenseStatus;
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
    const { name, type, status, items } = data;

    const user: ExpenseModel = new ExpenseModel({
      name,
      type,
      status,
      userId,
      items,
    });

    return user;
  }
}
