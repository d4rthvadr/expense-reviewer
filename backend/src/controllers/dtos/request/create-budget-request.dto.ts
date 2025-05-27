import { Category } from '@domain/models/enum/category.enum';

export interface CreateBudgetRequestDto {
  name?: string;
  amount: number;
  description?: string;
  category: Category;
}
