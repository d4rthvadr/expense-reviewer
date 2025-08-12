/* eslint-disable no-unused-vars */

import { convertNullToUndefined, convertToFamilyType } from './utils';
import { ExpenseItemEntity } from '../expense.repository';
import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseItemModel } from '@domain/models/expense-item.model';

export function mapExpense(entity: ExpenseItemEntity): ExpenseItemModel;
export function mapExpense(entity: null): null;
export function mapExpense(
  entity: ExpenseItemEntity | null
): ExpenseItemModel | null;
export function mapExpense(
  entity: ExpenseItemEntity | null
): ExpenseItemModel | null {
  if (!entity) {
    return null;
  }

  return new ExpenseItemModel({
    id: entity.id,
    description: convertNullToUndefined(entity.description),
    name: entity.name,
    category: convertToFamilyType(entity.category, Category),
    currency: convertToFamilyType(
      convertNullToUndefined(entity.currency),
      Currency
    ),
    amount: entity.amount,
    amountUsd: entity.amountUsd,
    qty: convertNullToUndefined(entity.qty),
    createdAt: entity.createdAt,
  });
}
