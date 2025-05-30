import { Currency } from '@domain/enum/currency.enum';
import { ExpenseItem } from '@domain/models/expense.model';

export interface ExpenseResponseDto {
  id: string;
  name?: string;
  type: string;
  currency?: Currency;
  items: ExpenseItem[];
  userId?: string;
  updatedAt: Date;
  createdAt: Date;
}
