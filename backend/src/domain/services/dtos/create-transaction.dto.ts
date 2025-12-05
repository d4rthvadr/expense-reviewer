import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { TransactionType } from '@domain/enum/transaction-type.enum';

interface Transaction {
  name?: string;
  description?: string;
  currency: Currency;
  category: Category;
  amount: number;
  amountUsd: number;
  type: TransactionType;
  userId?: string;
  qty?: number;
  createdAt?: string;
}

export interface CreateTransactionDto
  extends Omit<Transaction, 'amountUsd' | 'createdAt'> {
  createdAt?: string; // Allow Date or ISO string
}
