/* eslint-disable no-unused-vars */

import { ExpenseModel } from '../../../domain/models/expense.model';
import { convertNullToUndefined } from './utils';
import { ExpenseEntityFull, ExpenseItemEntity } from '../expense.repository';

const mapExpenseItem = (item: ExpenseItemEntity) => ({
  id: item.id,
  description: convertNullToUndefined(item.description),
  name: item.name,
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
    items: entity.expenseItem.map(mapExpenseItem),
    createdAt: entity.createdAt,
    userId: convertNullToUndefined(entity.userId),
    updatedAt: entity.updatedAt,
  });
}
