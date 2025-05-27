import { Category } from '@domain/models/enum/category.enum';

export interface BudgetResponseDto {
  id: string;
  name?: string;
  description?: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}
