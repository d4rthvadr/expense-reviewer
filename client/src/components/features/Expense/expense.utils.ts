import { Currency } from "@/constants/currency.enum";
import { ExpenseItem } from "@/constants/expense";

export const normalizeExpense = (
  expense: ExpenseItem | null
): ExpenseItem | null => {
  if (!expense) return null;
  return {
    id: expense.id,
    name: expense.name,
    description: expense.description,
    category: expense.category,
    currency: expense.currency || Currency.USD,
    amount: expense.amount || 0,
    qty: expense.qty || 1,
    createdAt:
      typeof expense.createdAt === "object"
        ? new Date(expense.createdAt).toISOString()
        : expense.createdAt,
  };
};
