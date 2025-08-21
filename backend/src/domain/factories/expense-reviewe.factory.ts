import { ExpenseReviewModel } from '@domain/models/expense-review.model';

interface ExpenseReviewCreateDataDto {
  userId?: string;
  reviewText: string;
}
export class ExpenseReviewFactory {
  /**
   * Creates a new ExpenseReviewModel instance from the provided data.
   * @param data - The data to create the expense review model.
   * @returns A new ExpenseReviewModel instance.
   */
  static createExpenseReview(
    data: ExpenseReviewCreateDataDto
  ): ExpenseReviewModel {
    const { userId, reviewText } = data;

    return new ExpenseReviewModel({
      userId,
      reviewText,
    });
  }
}
