import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseStatus } from '@domain/enum/expense-status.enum';

export interface ExpenseItem {
  name: string;
  description?: string;
  category: Category;
  currency: Currency;
  amount: number;
  amountUsd: number;
  qty?: number;
}

export type ExpenseItemWithOutUsd = Omit<ExpenseItem, 'amountUsd'>;

export interface CreateExpenseDto {
  name?: string;
  type: string;
  status: ExpenseStatus;
  items: ExpenseItemWithOutUsd[];
  createdAt: string; // ISO 8601 date string
}
