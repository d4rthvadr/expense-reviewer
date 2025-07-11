import { useExpenseStore } from "@/stores/expenseStore";

export const useUpdateExpense = () => {
  const isSubmitting = useExpenseStore((state) => state.isSubmitting);
  const updateExpense = useExpenseStore((state) => state.updateExpense);

  return { isSubmitting, updateExpense };
};
