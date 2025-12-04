export interface TransactionItem {
  id: string;
  category: string;
  qty: number;
  currency: string;
  amount: number;
  type: "EXPENSE" | "INCOME";
}

export interface TransactionReview {
  id: string;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  transactions?: TransactionItem[];
}
