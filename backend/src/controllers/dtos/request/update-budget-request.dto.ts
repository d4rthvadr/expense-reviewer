import { Category } from '@domain/models/enum/category.enum';

export interface UpdateBudgetRequestDto {
  name?: string;
  amount: number;
  description?: string;
  category: Category;
}
