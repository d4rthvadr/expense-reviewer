import { useExpenseStore } from "@/stores/expenseStore";

export const useUpdateExpense = () => {
  const isSubmitting = useExpenseStore((state) => state.isSubmitting);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const expense = useExpenseStore((state) => state.expense);

  return { isSubmitting, expense, updateExpense };
};
