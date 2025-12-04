export interface TransactionItem {
  id: string;
  category: string;
  qty: number;
  currency: string;
  amount: number;
  type: string; // EXPENSE or INCOME
}

export interface TransactionReviewResponseDto {
  id: string;
  reviewText: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  transactions?: TransactionItem[];
}
