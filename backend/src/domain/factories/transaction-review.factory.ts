import {
  TransactionReviewModel,
  TransactionItem,
} from '@domain/models/transaction-review.model';

interface CreateTransactionReviewData {
  reviewText: string;
  userId: string;
}

interface CreateExistingTransactionReviewData {
  id: string;
  reviewText: string;
  userId: string;
  transactions?: TransactionItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionReviewFactory {
  /**
   * Creates a new TransactionReviewModel instance for new reviews.
   * @param data - The data to create the transaction review model.
   * @returns A new TransactionReviewModel instance.
   */
  static createNew(data: CreateTransactionReviewData): TransactionReviewModel {
    return new TransactionReviewModel({
      reviewText: data.reviewText,
      userId: data.userId,
    });
  }

  /**
   * Creates a TransactionReviewModel instance from existing data.
   * @param data - The existing data to create the transaction review model.
   * @returns A TransactionReviewModel instance.
   */
  static createExisting(
    data: CreateExistingTransactionReviewData
  ): TransactionReviewModel {
    return new TransactionReviewModel({
      id: data.id,
      reviewText: data.reviewText,
      userId: data.userId,
      transactions: data.transactions,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
