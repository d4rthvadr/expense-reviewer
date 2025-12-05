/* eslint-disable no-unused-vars */

import { convertNullToUndefined, convertToFamilyType } from './utils';
import { TransactionEntity } from '../transaction.repository';
import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { TransactionType } from '@domain/enum/transaction-type.enum';
import { TransactionModel } from '@domain/models/transaction.model';

export function mapTransaction(entity: TransactionEntity): TransactionModel;
export function mapTransaction(entity: null): null;
export function mapTransaction(
  entity: TransactionEntity | null
): TransactionModel | null;
export function mapTransaction(
  entity: TransactionEntity | null
): TransactionModel | null {
  if (!entity) {
    return null;
  }

  return new TransactionModel({
    id: entity.id,
    description: convertNullToUndefined(entity.description),
    name: convertNullToUndefined(entity.name),
    category: convertToFamilyType(entity.category, Category),
    currency: convertToFamilyType(
      convertNullToUndefined(entity.currency),
      Currency
    ),
    type: convertToFamilyType(entity.type, TransactionType),
    amount: entity.amount,
    amountUsd: entity.amountUsd,
    qty: convertNullToUndefined(entity.qty),
    createdAt: entity.createdAt,
    userId: convertNullToUndefined(entity.userId),
  });
}
