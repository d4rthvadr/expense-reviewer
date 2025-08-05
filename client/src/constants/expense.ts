import { Currency } from "./currency.enum";

export enum ExpenseStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ExpenseCategory {
  FOOD = "FOOD",
  TRANSPORT = "TRANSPORT",
  UTILITIES = "UTILITIES",
  ENTERTAINMENT = "ENTERTAINMENT",
  HEALTH = "HEALTH",
  EDUCATION = "EDUCATION",
  SHOPPING = "SHOPPING",
  MISCELLANEOUS = "MISCELLANEOUS",
  PERSONAL_AND_LIFESTYLE = "PERSONAL_AND_LIFESTYLE",
  TRAVEL = "TRAVEL",
  GIFTS_OR_DONATIONS = "GIFTS_OR_DONATIONS",
  HOUSING = "HOUSING",
  SAVINGS_OR_INVESTMENTS = "SAVINGS_OR_INVESTMENTS",
  INSURANCE = "INSURANCE",
  OTHER = "OTHER",
}

export type ExpenseItem = {
  id?: string;
  name: string;
  description?: string;
  currency?: Currency;
  category: ExpenseCategory;
  amount: number;
  qty: number;
};

export type Expense = {
  id: string;
  currency: string;
  name: string;
  totalAmount: number;
  review?: string;
  type?: string;
  status?: ExpenseStatus;
  items: ExpenseItem[];
  createdAt: string;
};

export const ExpenseStatusValues: ExpenseStatus[] =
  Object.values(ExpenseStatus);

export const ExpenseCategoryValues: ExpenseCategory[] =
  Object.values(ExpenseCategory);
