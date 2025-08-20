import {
  createExpense,
  getExpensesById,
  updateExpense,
} from "@/actions/expense";
import { Expense } from "@/constants/expense";
import { create } from "zustand";
import { toast } from "sonner";
import { Currency } from "@/constants/currency.enum";

const normalizeExpense = (expense: Expense | null): Expense | null => {
  if (!expense) return null;
  return {
    id: expense.id,
    name: expense.name,
    description: expense.description ?? expense.description,
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

type ExpenseActions = {
  getExpenseById: (expenseId: string) => Promise<void>;
  createExpense: (expense: Expense, callback?: () => void) => void;
  updateExpense: (
    expense: Expense,
    expenseId: string,
    callback?: () => void
  ) => Promise<void>;

  // logic for handling sheet state
  openEditSheet: (expense: Expense | null) => void;
  closeEditSheet: () => void;
};

export type ExpenseState = {
  expense: Expense | null;
  isSubmitting?: boolean;
  isLoading?: boolean;
  // expense state
  selectedExpense: Expense | null;
  isEditSheetOpen: boolean;
};

export type ExpenseStore = ExpenseState & ExpenseActions;

const defaultExpenseState = {
  expense: null,
  isLoading: false,
  isSubmitting: false,
};

export const useExpenseStore = create<ExpenseStore>()((set) => ({
  expense: defaultExpenseState.expense,
  selectedExpense: null,

  getExpenseById: async (expenseId: string) => {
    set(() => ({ isLoading: true }));
    try {
      const result = await getExpensesById(expenseId);
      if (result.success) {
        const normalizedData = normalizeExpense(result.data);
        set(() => ({ expense: normalizedData }));
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
    } finally {
      set(() => ({ isLoading: false }));
    }
  },
  createExpense: async (expense: Expense, callback?: () => void) => {
    set(() => ({ isSubmitting: true }));

    const { data, success } = await createExpense(expense);

    console.log("Create expense response:", { data, success });

    if (!success) {
      // Handle error case
      // TODO: Replace with proper notification
      toast.error("Failed to create expense");
      set(() => ({ isSubmitting: false }));
      return;
    }

    if (data?.id && typeof window !== "undefined") {
      window.history.pushState(null, "", `/dashboard/expenses`);
    }

    toast.success("Expense created successfully");
    callback?.();

    set(() => ({ expense: data, isSubmitting: false }));
  },

  updateExpense: async (
    expense: Expense,
    expenseId: string,
    callback?: () => void
  ) => {
    set(() => ({ isSubmitting: true }));

    const { data, success } = await updateExpense(expense, expenseId);

    console.log("Update expense response:", { data, success });
    if (!success) {
      // Handle error case
      // TODO: Replace with proper notification
      toast.error("Failed to update expense");
      set(() => ({ isSubmitting: false }));
      return;
    }

    toast.success("Expense updated successfully");
    callback?.();

    console.log("Update expense response:", { data, success, callback });

    set(() => ({ expense: data, isSubmitting: false }));
  },

  // logic for handling sheet state
  isEditSheetOpen: false,
  openEditSheet: (expense: Expense | null) =>
    set({ selectedExpense: expense, isEditSheetOpen: true }),
  closeEditSheet: () => set({ selectedExpense: null, isEditSheetOpen: false }),
}));
