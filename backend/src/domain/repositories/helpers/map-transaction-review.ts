/* eslint-disable no-unused-vars */
import { TransactionReviewModel } from '../../models/transaction-review.model';
import { TransactionReviewFullEntity } from '../transaction-review.repository';

export function mapTransactionReview(
  entity: TransactionReviewFullEntity
): TransactionReviewModel;
export function mapTransactionReview(entity: null): null;
export function mapTransactionReview(
  entity: TransactionReviewFullEntity | null
): TransactionReviewModel | null;
export function mapTransactionReview(
  entity: TransactionReviewFullEntity | null
): TransactionReviewModel | null {
  if (!entity) {
    return null;
  }

  return new TransactionReviewModel({
    id: entity.id,
    reviewText: entity.reviewText,
    userId: entity.userId ?? undefined,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}
