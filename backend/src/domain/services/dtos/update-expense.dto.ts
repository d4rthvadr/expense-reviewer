import { ExpenseItem } from './create-expense.dto';

export interface UpdateExpenseDto {
  name?: string;
  type: string;
  items: ExpenseItem[];
}
