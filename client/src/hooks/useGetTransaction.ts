import { useTransactionStore } from "@/stores/transactionStore";

export const useGetTransaction = () => {
  const { getTransactionById, transaction, isLoading } = useTransactionStore();
  return { getTransactionById, transaction, isLoading };
};
