import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';

export interface ExpenseResponseDto {
  id: string;
  name: string;
  description?: string;
  currency?: Currency;
  category: Category;
  amount: number;
  amountUsd: number;
  userId?: string;
  qty?: number;
  createdAt: Date;
}
