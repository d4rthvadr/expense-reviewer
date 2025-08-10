import { ExpenseStatus } from '@domain/enum/expense-status.enum';
import { ExpenseItemWithOutUsd } from './create-expense.dto';
import { Currency } from '@domain/enum/currency.enum';

export interface UpdateExpenseDto {
  name?: string;
  type: string;
  currency?: Currency;
  review?: string;
  status: ExpenseStatus;
  createdAt: string; // ISO 8601 date string
  items: ExpenseItemWithOutUsd[];
}
