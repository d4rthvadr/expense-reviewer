/* eslint-disable no-unused-vars */

import {
  DefaultCategoryWeightModel,
  UserCategoryWeightModel,
} from '@domain/models/category-weight.model';
import {
  DefaultCategoryWeight as DefaultCategoryWeightEntity,
  UserCategoryWeight as UserCategoryWeightEntity,
} from '../../../../generated/prisma';
import { Category } from '@domain/enum/category.enum';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convert Prisma Decimal to JavaScript number
 */
function toNumber(decimal: Decimal): number {
  return parseFloat(decimal.toString());
}

// Overloads for mapDefaultCategoryWeight
export function mapDefaultCategoryWeight(
  entity: DefaultCategoryWeightEntity
): DefaultCategoryWeightModel;
export function mapDefaultCategoryWeight(entity: null): null;
export function mapDefaultCategoryWeight(
  entity: DefaultCategoryWeightEntity | null
): DefaultCategoryWeightModel | null;
export function mapDefaultCategoryWeight(
  entity: DefaultCategoryWeightEntity | null
): DefaultCategoryWeightModel | null {
  if (!entity) {
    return null;
  }

  return new DefaultCategoryWeightModel({
    id: entity.id,
    category: entity.category as Category,
    weight: toNumber(entity.weight),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}

// Overloads for mapUserCategoryWeight
export function mapUserCategoryWeight(
  entity: UserCategoryWeightEntity
): UserCategoryWeightModel;
export function mapUserCategoryWeight(entity: null): null;
export function mapUserCategoryWeight(
  entity: UserCategoryWeightEntity | null
): UserCategoryWeightModel | null;
export function mapUserCategoryWeight(
  entity: UserCategoryWeightEntity | null
): UserCategoryWeightModel | null {
  if (!entity) {
    return null;
  }

  return new UserCategoryWeightModel({
    id: entity.id,
    userId: entity.userId,
    category: entity.category as Category,
    weight: toNumber(entity.weight),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}
