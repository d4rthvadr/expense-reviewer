import { Category } from '@domain/enum/category.enum';
import { ExpenseStatus } from '@domain/enum/expense-status.enum';

export interface ExpenseItem {
  name: string;
  description?: string;
  category: Category;
  amount: number;
  qty?: number;
}

export interface CreateExpenseDto {
  name?: string;
  type: string;
  status: ExpenseStatus;
  items: ExpenseItem[];
}
