import { useTransactionStore } from "@/stores/transactionStore";

export const useUpdateTransaction = () => {
  const { updateTransaction, isSubmitting } = useTransactionStore();
  return { updateTransaction, isSubmitting };
};
