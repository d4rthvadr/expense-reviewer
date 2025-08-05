import { Currency } from "@/constants/currency.enum";
import { Expense, ExpenseItem } from "@/constants/expense";

export const normalizeExpense = (expense: Expense | null): Expense | null => {
  if (!expense) return null;
  return {
    id: expense.id,
    name: expense.name,
    currency: expense.currency || "USD",
    type: expense.type || "Normal",
    totalAmount: expense.totalAmount || 0,
    status: expense.status,
    items:
      expense.items?.map(normalizeExpenseItem).filter((item) => !!item) || [],
    createdAt:
      typeof expense.createdAt === "object"
        ? new Date(expense.createdAt).toISOString()
        : expense.createdAt,
  };
};

const normalizeExpenseItem = (
  expense: ExpenseItem | null
): ExpenseItem | null => {
  if (!expense) return null;
  return {
    id: expense.id,
    name: expense.name,
    description: expense.description,
    currency: expense.currency || Currency.USD,
    category: expense.category,
    amount: expense.amount || 0,
    qty: expense.qty || 1,
  };
};
