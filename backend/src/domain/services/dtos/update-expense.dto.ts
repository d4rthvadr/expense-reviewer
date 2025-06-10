import { ExpenseStatus } from '@domain/enum/expense-status.enum';
import { ExpenseItem } from './create-expense.dto';

export interface UpdateExpenseDto {
  name?: string;
  type: string;
  status: ExpenseStatus;
  items: ExpenseItem[];
}
