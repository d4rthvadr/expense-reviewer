/* eslint-disable no-unused-vars */

import { convertNullToUndefined, convertToFamilyType } from './utils';
import { ExpenseEntity } from '../expense.repository';
import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseModel } from '@domain/models/expense.model';

export function mapExpense(entity: ExpenseEntity): ExpenseModel;
export function mapExpense(entity: null): null;
export function mapExpense(entity: ExpenseEntity | null): ExpenseModel | null;
export function mapExpense(entity: ExpenseEntity | null): ExpenseModel | null {
  if (!entity) {
    return null;
  }

  return new ExpenseModel({
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
