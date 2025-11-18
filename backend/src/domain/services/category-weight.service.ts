import { Category } from '@domain/enum/category.enum';
import { log } from '@infra/logger';
import {
  CategoryWeightRepository,
  categoryWeightRepository,
  CategoryWeightData,
} from '@domain/repositories/category-weight.repository';
import {
  DefaultCategoryWeightModel,
  UserCategoryWeightModel,
} from '@domain/models/category-weight.model';
import {
  DEFAULT_CATEGORY_WEIGHTS,
  getDefaultWeight,
  validateWeightsSum,
} from '@config/default-category-weights';
import {
  GetCategoryWeightsResponseDto,
  CategoryWeightResponseDto,
} from '@api/controllers/dtos/response/category-weights-response.dto';

export interface EffectiveCategoryWeight {
  category: Category;
  weight: number;
  isCustom: boolean; // true if user override exists
}

export class CategoryWeightService {
  #repository: CategoryWeightRepository;

  constructor(repository: CategoryWeightRepository) {
    this.#repository = repository;
  }

  /**
   * Get effective weights for a user as response DTO
   */
  async getEffectiveWeightsDto(
    userId: string
  ): Promise<GetCategoryWeightsResponseDto> {
    const effectiveWeights = await this.getEffectiveWeights(userId);
    return this.#toResponseDto(effectiveWeights);
  }

  /**
   * Get effective weights for a user, merging defaults with user overrides
   * User overrides take precedence over defaults
   */
  async getEffectiveWeights(
    userId: string
  ): Promise<EffectiveCategoryWeight[]> {
    try {
      log.info(`Getting effective category weights for userId: ${userId}`);

      // Fetch defaults from DB (fallback to static config if DB is empty)
      const dbDefaults = await this.#repository.findAllDefaults();
      const defaults =
        dbDefaults.length > 0
          ? this.#toWeightMap(dbDefaults)
          : DEFAULT_CATEGORY_WEIGHTS;

      // Fetch user overrides
      const userOverrides = await this.#repository.findUserWeights(userId);
      const overridesMap = this.#toWeightMap(userOverrides);

      // Merge: user overrides take precedence
      const effectiveWeights: EffectiveCategoryWeight[] = [];

      for (const category of Object.values(Category)) {
        const hasOverride = category in overridesMap;
        const weight = hasOverride
          ? overridesMap[category]
          : (defaults[category] ?? 0);

        effectiveWeights.push({
          category,
          weight,
          isCustom: hasOverride,
        });
      }

      return effectiveWeights;
    } catch (error) {
      log.error({
        message: `Error getting effective weights for userId: ${userId}`,
        error,
        code: 'GET_EFFECTIVE_WEIGHTS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Update user category weights (partial update supported)
   * Returns the complete effective weights after update as DTO
   */
  async updateUserWeights(
    userId: string,
    weights: CategoryWeightData[]
  ): Promise<GetCategoryWeightsResponseDto> {
    try {
      log.info(
        `Updating ${weights.length} category weights for userId: ${userId}`
      );

      // Validate weights sum (if all categories are provided)
      if (weights.length === Object.keys(Category).length) {
        this.#validateWeightsSum(weights);
      }

      // Upsert user weights
      await this.#repository.upsertUserWeights(userId, weights);

      // Return updated effective weights as DTO
      return await this.getEffectiveWeightsDto(userId);
    } catch (error) {
      log.error({
        message: `Error updating user weights for userId: ${userId}`,
        error,
        code: 'UPDATE_USER_WEIGHTS_ERROR',
      });
      throw error;
    }
  }

  /**
   * Get default weight for a specific category
   */
  getDefaultWeightForCategory(category: Category): number {
    return getDefaultWeight(category);
  }

  /**
   * Convert array of weights to a map for easy lookup
   */
  #toWeightMap(
    weights:
      | DefaultCategoryWeightModel[]
      | UserCategoryWeightModel[]
      | CategoryWeightData[]
  ): Record<string, number> {
    return weights.reduce(
      (map, item) => {
        map[item.category] = item.weight;
        return map;
      },
      {} as Record<string, number>
    );
  }

  /**
   * Map effective weights to response DTO
   */
  #toResponseDto(
    effectiveWeights: EffectiveCategoryWeight[]
  ): GetCategoryWeightsResponseDto {
    const customCount = effectiveWeights.filter((w) => w.isCustom).length;

    return {
      weights: effectiveWeights.map(
        (w): CategoryWeightResponseDto => ({
          category: w.category,
          weight: w.weight,
          isCustom: w.isCustom,
        })
      ),
      totalCategories: effectiveWeights.length,
      customCount,
    };
  }

  /**
   * Validate that weights sum to approximately 1.0 (100%)
   */
  #validateWeightsSum(weights: CategoryWeightData[]): void {
    const sum = weights.reduce((acc, item) => acc + item.weight, 0);

    if (!validateWeightsSum(sum)) {
      throw new Error(
        `Category weights must sum to 1.0 (100%). Current sum: ${sum.toFixed(4)}`
      );
    }
  }
}

export const categoryWeightService = new CategoryWeightService(
  categoryWeightRepository
);
