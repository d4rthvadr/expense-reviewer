import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseStatus } from '@domain/enum/expense-status.enum';

export interface ExpenseItem {
  name: string;
  amount: number;
  currency: Currency;
  description?: string;
  category: Category;
  qty?: number;
}

export interface CreateExpenseRequestDto {
  name?: string;
  type: string;
  status: ExpenseStatus;
  items: ExpenseItem[];
  createdAt: string; // ISO 8601 date string
}
