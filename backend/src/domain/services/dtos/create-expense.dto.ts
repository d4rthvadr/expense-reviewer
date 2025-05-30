import { Category } from '@domain/enum/category.enum';

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
  items: ExpenseItem[];
}
