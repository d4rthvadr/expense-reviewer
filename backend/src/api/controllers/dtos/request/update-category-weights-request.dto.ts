import { Category } from '@domain/enum/category.enum';

export interface CategoryWeightItemDto {
  category: Category;
  weight: number;
}

export interface UpdateCategoryWeightsRequestDto {
  weights: CategoryWeightItemDto[];
}
