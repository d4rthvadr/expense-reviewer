import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';

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
  items: ExpenseItem[];
}
