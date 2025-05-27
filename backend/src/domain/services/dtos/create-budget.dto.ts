import { Category } from '@domain/models/enum/category.enum';

export interface CreateBudgetDto {
  name?: string;
  userId?: string;
  amount: number;
  description?: string;
  category: Category;
}
