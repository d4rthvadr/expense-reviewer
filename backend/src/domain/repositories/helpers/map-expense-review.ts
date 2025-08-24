/* eslint-disable no-unused-vars */
import { ExpenseReviewModel } from '../../models/expense-review.model';
import { ExpenseReviewFullEntity } from '../expense-review.repository';

export function mapExpenseReview(
  entity: ExpenseReviewFullEntity
): ExpenseReviewModel;
export function mapExpenseReview(entity: null): null;
export function mapExpenseReview(
  entity: ExpenseReviewFullEntity | null
): ExpenseReviewModel | null;
export function mapExpenseReview(
  entity: ExpenseReviewFullEntity | null
): ExpenseReviewModel | null {
  if (!entity) {
    return null;
  }

  return new ExpenseReviewModel({
    id: entity.id,
    reviewText: entity.reviewText,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    expense: entity.expenses?.map((expense) => ({
      id: expense.id,
      category: expense.category,
      qty: expense.qty,
      currency: expense.currency,
      amount: expense.amount,
    })),
  });
}
