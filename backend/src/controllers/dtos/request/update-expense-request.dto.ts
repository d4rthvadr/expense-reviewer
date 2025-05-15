import { ExpenseItem } from './create-expense-request.dto';

export interface UpdateExpenseRequestDto {
  id: string;
  name?: string;
  type: string;
  items: ExpenseItem[];
}
