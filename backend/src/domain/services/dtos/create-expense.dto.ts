import { ExpenseItem } from '@domain/models/expense.model';

export interface CreateExpenseDto
  extends Omit<ExpenseItem, 'amountUsd' | 'createdAt'> {
  createdAt?: string; // Allow Date or ISO string
}
