import { ExpenseStatus } from '@domain/enum/expense-status.enum';
import { ExpenseItem } from './create-expense.dto';
import { Currency } from '@domain/enum/currency.enum';

export interface UpdateExpenseDto {
  name?: string;
  type: string;
  currency?: Currency;
  review?: string;
  status: ExpenseStatus;
  items: ExpenseItem[];
}
