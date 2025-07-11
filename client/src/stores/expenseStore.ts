import {
  createExpense,
  getExpensesById,
  updateExpense,
} from "@/actions/expense";
import { normalizeExpense } from "@/components/features/Expense/expense.utils";
import { Expense, ExpenseItem } from "@/constants/expense";
import { create } from "zustand";
import { toast } from "sonner";

type ExpenseActions = {
  getExpenseById: (expenseId: string) => Promise<void>;
  setExpenseItem: (expenseItem: ExpenseItem, callback?: () => void) => void;
  createExpense: (expense: Expense, callback?: () => void) => void;
  updateExpense: (
    expense: Expense,
    expenseId: string,
    callback?: () => void
  ) => Promise<void>;
};

export type ExpenseState = {
  expense: Expense | null;
  isSubmitting?: boolean;
  isLoading?: boolean;
};

export type ExpenseStore = ExpenseState & ExpenseActions;

const defaultExpenseState = {
  expense: null,
  isLoading: false,
  isSubmitting: false,
};

export const useExpenseStore = create<ExpenseStore>()((set) => ({
  expense: defaultExpenseState.expense,

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

    if (!success) {
      // Handle error case
      // TODO: Replace with proper notification
      toast.error("Failed to create expense");
      set(() => ({ isSubmitting: false }));
      return;
    }

    if (data?.id && typeof window !== "undefined") {
      window.history.pushState(null, "", `/dashboard/expenses/${data.id}`);
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

  setExpenseItem: async (expenseItem: ExpenseItem, callback?: () => void) => {
    if (callback) {
      await callback();
    }
    // Update the expense item in the store
    set((state) => {
      if (!state.expense) return state;

      const expenseItems = state.expense.items || [];

      const existingItem = expenseItems.find(
        (item) => item.id === expenseItem.id
      );

      if (!existingItem) {
        // If the item does not exist, add it to the items array
        return {
          expense: {
            ...state.expense,
            items: [...expenseItems, expenseItem],
          },
        };
      }

      return {
        expense: {
          ...state.expense,
          items: expenseItems.map((item) =>
            item.id === expenseItem.id ? { ...item, ...expenseItem } : item
          ),
        },
      };
    });
  },
}));
