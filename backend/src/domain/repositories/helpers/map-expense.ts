/* eslint-disable no-unused-vars */

import { ExpenseModel } from '@domain/models/expense.model';
import { convertNullToUndefined, convertToFamilyType } from './utils';
import { ExpenseEntityFull, ExpenseItemEntity } from '../expense.repository';
import { Category } from '@domain/enum/category.enum';
import { Currency } from '@domain/enum/currency.enum';
import { ExpenseStatus } from '@domain/enum/expense-status.enum';

const mapExpenseItem = (item: ExpenseItemEntity) => ({
  id: item.id,
  description: convertNullToUndefined(item.description),
  name: item.name,
  category: convertToFamilyType(item.category, Category),
  currency: convertToFamilyType(
    convertNullToUndefined(item.currency),
    Currency
  ),
  amount: item.amount,
  qty: convertNullToUndefined(item.qty),
});

export function mapExpense(entity: ExpenseEntityFull): ExpenseModel;
export function mapExpense(entity: null): null;
export function mapExpense(
  entity: ExpenseEntityFull | null
): ExpenseModel | null;
export function mapExpense(
  entity: ExpenseEntityFull | null
): ExpenseModel | null {
  if (!entity) {
    return null;
  }

  return new ExpenseModel({
    id: entity.id,
    name: convertNullToUndefined(entity.name),
    type: entity.type,
    status: convertToFamilyType(entity.status, ExpenseStatus),
    review: convertNullToUndefined(entity.review),
    currency: convertToFamilyType(
      convertNullToUndefined(entity.currency),
      Currency
    ),
    items: entity.expenseItem.map(mapExpenseItem),
    createdAt: entity.createdAt,
    userId: convertNullToUndefined(entity.userId),
    updatedAt: entity.updatedAt,
  });
}
