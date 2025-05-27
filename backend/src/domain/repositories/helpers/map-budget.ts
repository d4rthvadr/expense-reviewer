/* eslint-disable no-unused-vars */
import { BudgetModel } from '../../models/budget.model';
import { Budget as BudgetEntity } from '../../../../generated/prisma';
import { convertNullToUndefined } from './utils';
import { Category } from '../../../domain/models/enum/category.enum';

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
    category: convertToCategoryType(entity.category),
    userId: convertNullToUndefined(entity.userId),
    description: convertNullToUndefined(entity.description),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}

/**
 * Converts a string to a valid `Category` enum value.
 *
 * @param category - The string representation of the category to convert.
 * @returns The corresponding `Category` enum value.
 * @throws {Error} If the provided category is not a valid `Category` enum value.
 *
 * @example
 * ```typescript
 * const category = convertToCategoryType('FOOD');
 * ```
 */
const convertToCategoryType = (category: string): Category => {
  if (!Object.values(Category).includes(category as Category)) {
    throw new Error(
      `Invalid category: ${category}. Valid categories are: ${Object.values(Category).join(', ')}`
    );
  }

  return category as Category;
};
