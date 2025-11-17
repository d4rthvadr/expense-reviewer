import { Category } from '@domain/enum/category.enum';

export interface CategoryWeightResponseDto {
  category: Category;
  weight: number;
  isCustom: boolean;
}

export interface GetCategoryWeightsResponseDto {
  weights: CategoryWeightResponseDto[];
  totalCategories: number;
  customCount: number;
}
