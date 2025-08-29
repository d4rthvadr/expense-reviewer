import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { TransactionType } from '@domain/enum/transaction-type.enum';

export interface TransactionResponseDto {
  id: string;
  name: string;
  description?: string;
  currency?: Currency;
  category: Category;
  amount: number;
  amountUsd: number;
  type: TransactionType;
  userId?: string;
  qty?: number;
  createdAt: Date;
}
