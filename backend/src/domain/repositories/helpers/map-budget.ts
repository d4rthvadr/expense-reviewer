/* eslint-disable no-unused-vars */
import { BudgetModel } from '../../models/budget.model';
import { Budget as BudgetEntity } from '../../../../generated/prisma';
import { convertNullToUndefined, convertToFamilyType } from './utils';
import { Category } from '@domain/enum/category.enum';

export function mapBudget(entity: BudgetEntity): BudgetModel;
export function mapBudget(entity: null): null;
export function mapBudget(entity: BudgetEntity | null): BudgetModel | null;
export function mapBudget(entity: BudgetEntity | null): BudgetModel | null {
  if (!entity) {
    return null;
  }

  return new BudgetModel({
    id: entity.id,
    name: convertNullToUndefined(entity.name),
    amount: entity.amount,
    category: convertToFamilyType(entity.category, Category),
    userId: convertNullToUndefined(entity.userId),
    description: convertNullToUndefined(entity.description),
    isRecurring: entity.isRecurring,
    recurringTemplateId: convertNullToUndefined(entity.recurringTemplateId),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}
