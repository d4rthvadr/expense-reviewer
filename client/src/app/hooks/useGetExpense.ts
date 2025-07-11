import { useExpenseStore } from "@/stores/expenseStore";
import { useEffect } from "react";

export const useGetExpense = (
  expenseId?: string | null,
  isExpenseNew: boolean = false
) => {
  const loading = useExpenseStore((state) => state.isLoading);
  const getExpenseById = useExpenseStore((state) => state.getExpenseById);
  const expense = useExpenseStore((state) => state.expense);

  useEffect(() => {
    if (isExpenseNew || !expenseId) {
      return;
    }

    getExpenseById(expenseId);
  }, [expenseId, getExpenseById, isExpenseNew]);

  return { loading, expense };
};
