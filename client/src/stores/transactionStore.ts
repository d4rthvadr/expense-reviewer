import {
  createTransaction,
  getTransactionById,
  updateTransaction,
} from "@/actions/transaction";
import { Transaction } from "@/constants/transaction";
import { create } from "zustand";
import { toast } from "sonner";
import { Currency } from "@/constants/currency.enum";

const normalizeTransaction = (
  transaction: Transaction | null
): Transaction | null => {
  if (!transaction) return null;
  return {
    id: transaction.id,
    name: transaction.name,
    description: transaction.description ?? transaction.description,
    category: transaction.category,
    currency: transaction.currency || Currency.USD,
    amount: transaction.amount || 0,
    qty: transaction.qty || 1,
    type: transaction.type,
    createdAt:
      typeof transaction.createdAt === "object"
        ? new Date(transaction.createdAt).toISOString()
        : transaction.createdAt,
    updatedAt:
      typeof transaction.updatedAt === "object"
        ? new Date(transaction.updatedAt).toISOString()
        : transaction.updatedAt,
  };
};

type TransactionActions = {
  getTransactionById: (transactionId: string) => Promise<void>;
  createTransaction: (transaction: Transaction, callback?: () => void) => void;
  updateTransaction: (
    transaction: Transaction,
    transactionId: string,
    callback?: () => void
  ) => Promise<void>;

  // logic for handling sheet state
  openEditSheet: (transaction: Transaction | null) => void;
  closeEditSheet: () => void;
};

export type TransactionState = {
  transaction: Transaction | null;
  isSubmitting?: boolean;
  isLoading?: boolean;
  // transaction state
  selectedTransaction: Transaction | null;
  isEditSheetOpen: boolean;
};

export type TransactionStore = TransactionState & TransactionActions;

const defaultTransactionState = {
  transaction: null,
  isLoading: false,
  isSubmitting: false,
};

export const useTransactionStore = create<TransactionStore>()((set) => ({
  transaction: defaultTransactionState.transaction,
  selectedTransaction: null,

  getTransactionById: async (transactionId: string) => {
    set(() => ({ isLoading: true }));
    try {
      const result = await getTransactionById(transactionId);
      if (result.success) {
        const normalizedData = normalizeTransaction(result.data);
        set(() => ({ transaction: normalizedData }));
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
    } finally {
      set(() => ({ isLoading: false }));
    }
  },
  createTransaction: async (
    transaction: Transaction,
    callback?: () => void
  ) => {
    set(() => ({ isSubmitting: true }));

    const { data, success } = await createTransaction(transaction);

    console.log("Create transaction response:", { data, success });

    if (!success) {
      // Handle error case
      toast.error("Failed to create transaction");
      set(() => ({ isSubmitting: false }));
      return;
    }

    if (data?.id && typeof window !== "undefined") {
      window.history.pushState(null, "", "/dashboard/transactions");
    }

    toast.success(
      `${
        transaction.type === "INCOME" ? "Income" : "Transaction"
      } created successfully`
    );
    callback?.();

    set(() => ({ transaction: data, isSubmitting: false }));
  },

  updateTransaction: async (
    transaction: Transaction,
    transactionId: string,
    callback?: () => void
  ) => {
    set(() => ({ isSubmitting: true }));

    const { data, success } = await updateTransaction(
      transaction,
      transactionId
    );

    console.log("Update transaction response:", { data, success });
    if (!success) {
      // Handle error case
      toast.error("Failed to update transaction");
      set(() => ({ isSubmitting: false }));
      return;
    }

    toast.success(
      `${
        transaction.type === "INCOME" ? "Income" : "Transaction"
      } updated successfully`
    );
    callback?.();

    console.log("Update transaction response:", { data, success, callback });

    set(() => ({ transaction: data, isSubmitting: false }));
  },

  // logic for handling sheet state
  isEditSheetOpen: false,
  openEditSheet: (transaction: Transaction | null) =>
    set({ selectedTransaction: transaction, isEditSheetOpen: true }),
  closeEditSheet: () =>
    set({ selectedTransaction: null, isEditSheetOpen: false }),
}));

// Backward compatibility - re-export as expense store with deprecation warning
/**
 * @deprecated Use useTransactionStore instead. This will be removed in a future version.
 */
export const useExpenseStore = () => {
  console.warn(
    "useExpenseStore is deprecated. Use useTransactionStore instead."
  );
  return useTransactionStore();
};
