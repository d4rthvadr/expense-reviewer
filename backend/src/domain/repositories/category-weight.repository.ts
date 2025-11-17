import {
  DefaultCategoryWeight as DefaultCategoryWeightEntity,
  UserCategoryWeight as UserCategoryWeightEntity,
} from '../../../generated/prisma';
import { Category } from '@domain/enum/category.enum';
import { log } from '@infra/logger';
import { Database } from '@infra/db/database';
import {
  DefaultCategoryWeightModel,
  UserCategoryWeightModel,
} from '@domain/models/category-weight.model';
import {
  mapDefaultCategoryWeight,
  mapUserCategoryWeight,
} from './helpers/map-category-weight';

export interface CategoryWeightData {
  category: Category;
  weight: number;
}

export class CategoryWeightRepository extends Database {
  /**
   * Get all default category weights from the database
   */
  async findAllDefaults(): Promise<DefaultCategoryWeightModel[]> {
    try {
      const defaults: DefaultCategoryWeightEntity[] =
        await this.defaultCategoryWeight.findMany({
          orderBy: { category: 'asc' },
        });

      return defaults.map((entity) => mapDefaultCategoryWeight(entity));
    } catch (error) {
      log.error({
        message: 'Error fetching default category weights',
        error,
        code: 'FETCH_DEFAULTS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Get user-specific weight overrides
   */
  async findUserWeights(userId: string): Promise<UserCategoryWeightModel[]> {
    try {
      const userWeights: UserCategoryWeightEntity[] =
        await this.userCategoryWeight.findMany({
          where: { userId },
          orderBy: { category: 'asc' },
        });

      return userWeights.map((entity) => mapUserCategoryWeight(entity));
    } catch (error) {
      log.error({
        message: `Error fetching user category weights for userId: ${userId}`,
        error,
        code: 'FETCH_USER_WEIGHTS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Get a single user weight override for a specific category
   */
  async findUserWeightByCategory(
    userId: string,
    category: Category
  ): Promise<UserCategoryWeightModel | null> {
    try {
      const userWeight: UserCategoryWeightEntity | null =
        await this.userCategoryWeight.findUnique({
          where: {
            userId_category: {
              userId,
              category,
            },
          },
        });

      if (!userWeight) {
        return null;
      }

      return mapUserCategoryWeight(userWeight);
    } catch (error) {
      log.error({
        message: `Error fetching user weight for category ${category}, userId: ${userId}`,
        error,
        code: 'FETCH_USER_WEIGHT_ERROR',
      });
      throw error;
    }
  }

  /**
   * Upsert (create or update) user category weights
   * Supports partial updates - only provided categories will be affected
   */
  async upsertUserWeights(
    userId: string,
    weights: CategoryWeightData[]
  ): Promise<UserCategoryWeightModel[]> {
    try {
      log.info(
        `Upserting ${weights.length} category weights for userId: ${userId}`
      );

      // Use transaction to ensure atomicity
      const result = await this.$transaction(
        weights.map((item) =>
          this.userCategoryWeight.upsert({
            where: {
              userId_category: {
                userId,
                category: item.category,
              },
            },
            create: {
              userId,
              category: item.category,
              weight: item.weight.toString(),
            },
            update: {
              weight: item.weight.toString(),
            },
          })
        )
      );

      return result.map((entity) => mapUserCategoryWeight(entity));
    } catch (error) {
      log.error({
        message: `Error upserting user category weights for userId: ${userId}`,
        error,
        code: 'UPSERT_USER_WEIGHTS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Delete a specific user weight override (will fall back to default)
   */
  async deleteUserWeight(userId: string, category: Category): Promise<boolean> {
    try {
      await this.userCategoryWeight.delete({
        where: {
          userId_category: {
            userId,
            category,
          },
        },
      });

      log.info(
        `Deleted user weight for category ${category}, userId: ${userId}`
      );
      return true;
    } catch (error) {
      log.error({
        message: `Error deleting user weight for category ${category}, userId: ${userId}`,
        error,
        code: 'DELETE_USER_WEIGHT_ERROR',
      });
      return false;
    }
  }

  /**
   * Delete all user weight overrides for a user
   */
  async deleteAllUserWeights(userId: string): Promise<number> {
    try {
      const result = await this.userCategoryWeight.deleteMany({
        where: { userId },
      });

      log.info(`Deleted ${result.count} user weights for userId: ${userId}`);
      return result.count;
    } catch (error) {
      log.error({
        message: `Error deleting all user weights for userId: ${userId}`,
        error,
        code: 'DELETE_ALL_USER_WEIGHTS_ERROR',
      });
      throw error;
    }
  }
}

export const categoryWeightRepository = new CategoryWeightRepository();
