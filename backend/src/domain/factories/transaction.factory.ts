import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { TransactionType } from '@domain/enum/transaction-type.enum';
import { TransactionModel } from '@domain/models/transaction.model';

interface TransactionCreateDataDto {
  name?: string;
  description?: string;
  currency?: Currency;
  category: Category;
  amount: number;
  amountUsd: number;
  type: TransactionType;
  userId?: string;
  qty?: number;
  createdAt?: string;
}

export class TransactionFactory {
  /**
   * Creates a new TransactionModel instance from the provided data.
   * @param data - The data to create the transaction model.
   * @returns A new TransactionModel instance.
   */
  static createTransaction(
    data: TransactionCreateDataDto,
    userId?: string
  ): TransactionModel {
    const transaction = new TransactionModel({
      ...data,
      qty: data?.qty ?? 1,
      createdAt:
        typeof data.createdAt === 'string'
          ? new Date(data.createdAt)
          : data.createdAt,
      userId,
    });

    return transaction;
  }
}
