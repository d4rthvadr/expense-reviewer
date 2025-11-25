import { TransactionReviewModel } from '@domain/models/transaction-review.model';

export function createMockTransactionReviewService() {
  return {
    create: jest.fn().mockResolvedValue(
      new TransactionReviewModel({
        id: 'review-123',
        userId: 'user-1',
        reviewText: 'Mock review text',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    createReview: jest.fn().mockResolvedValue(
      new TransactionReviewModel({
        id: 'review-123',
        userId: 'user-1',
        reviewText: 'Mock review text',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    find: jest.fn().mockResolvedValue({
      data: [],
      total: 0,
    }),
    findById: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(null),
  };
}
