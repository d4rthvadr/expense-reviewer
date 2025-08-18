import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';

interface Expense {
  name: string;
  description?: string;
  currency?: Currency;
  category: Category;
  amount: number;
  amountUsd: number;
  userId?: string;
  qty: number;
  createdAt?: string;
}

export interface CreateExpenseDto
  extends Omit<Expense, 'amountUsd' | 'createdAt'> {
  createdAt?: string; // Allow Date or ISO string
}
