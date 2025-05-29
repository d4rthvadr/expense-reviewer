import { Category } from '@domain/models/enum/category.enum';

export interface ExpenseItem {
  name: string;
  amount: number;
  description?: string;
  category: Category;
  qty?: number;
}

export interface CreateExpenseRequestDto {
  name?: string;
  type: string;
  items: ExpenseItem[];
}
