import { ExpenseItem } from '../../../domain/models/expense.model';

export interface ExpenseResponseDto {
  id: string;
  name?: string;
  type: string;
  items: ExpenseItem[];
  userId?: string;
  updatedAt: Date;
  createdAt: Date;
}
