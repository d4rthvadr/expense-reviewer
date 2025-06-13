import { Currency } from '@domain/enum/currency.enum';
import { ExpenseStatus } from '@domain/enum/expense-status.enum';
import { ExpenseItem } from '@domain/models/expense.model';

export interface ExpenseResponseDto {
  id: string;
  name?: string;
  type: string;
  status: ExpenseStatus;
  review?: string;
  currency?: Currency;
  items: ExpenseItem[];
  userId?: string;
  updatedAt: Date;
  createdAt: Date;
}
