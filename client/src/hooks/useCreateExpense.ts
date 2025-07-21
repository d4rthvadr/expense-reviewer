import { useExpenseStore } from "@/stores/expenseStore";

export const useCreateExpense = () => {
  const isSubmitting = useExpenseStore((state) => state.isSubmitting);
  const createExpense = useExpenseStore((state) => state.createExpense);

  return { isSubmitting, createExpense };
};
