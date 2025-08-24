import { ExpenseItem } from '@domain/models/expense-review.model';

export interface ExpenseReviewResponseDto {
  id: string;
  reviewText: string;
  expense?: ExpenseItem[];
  createdAt: Date;
  updatedAt: Date;
}
