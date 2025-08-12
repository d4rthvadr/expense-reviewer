import { Category } from "./category.enum";

export const CategoryValues = Object.values(Category);

export interface Budget {
  id: string;
  name?: string;
  amount: number;
  userId?: string;
  category: Category;
  currency?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
