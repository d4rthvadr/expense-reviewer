import { Category } from "./category.enum";
import { Currency } from "./currency.enum";

export type ExpenseItem = {
  id?: string;
  name: string;
  description?: string;
  currency?: Currency | string;
  category: Category;
  amount: number;
  qty: number;
  createdAt: string;
};

export const CategoryValues: Category[] = Object.values(Category);
