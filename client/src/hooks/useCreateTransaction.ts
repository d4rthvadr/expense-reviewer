import { useTransactionStore } from "@/stores/transactionStore";

export const useCreateTransaction = () => {
  const { createTransaction, isSubmitting } = useTransactionStore();
  return { createTransaction, isSubmitting };
};
