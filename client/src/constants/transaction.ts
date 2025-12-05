import { Category } from "./category.enum";
import { Currency } from "./currency.enum";

export type TransactionType = "EXPENSE" | "INCOME";

export type Transaction = {
  id?: string;
  name?: string;
  description?: string;
  currency?: Currency | string;
  category: Category;
  amount: number;
  qty: number;
  type: TransactionType;
  createdAt: string;
  updatedAt?: string;
};

export const CategoryValues: Category[] = Object.values(Category);

export const TransactionTypeValues: TransactionType[] = ["EXPENSE", "INCOME"];
